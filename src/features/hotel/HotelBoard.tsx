import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { PageHeader } from "../../components/ui/PageHeader";

import {
  createFollowup,
  deleteFollowup,
  getFollowups,
  updateFollowup,
  type GuestFollowup,
  type HotelStay,
} from "../../services/hotelService";

import { FollowupModal } from "./FollowupModal";
import { StayCard } from "./StayCard";
import { StayDetails } from "./StayDetails";
import { useHotel } from "./useHotel";

type Tab =
  | "arrivals"
  | "in_house"
  | "departures";

export function HotelBoard() {
  const {
    arrivals,
    inHouse,
    departures,
    loading,
    error,
    refresh,
  } = useHotel();

  const [tab, setTab] =
    useState<Tab>(
      "arrivals"
    );

  const [
    selectedStay,
    setSelectedStay,
  ] =
    useState<HotelStay | null>(
      null
    );

  const [
    followups,
    setFollowups,
  ] =
    useState<GuestFollowup[]>(
      []
    );

  const [
    loadingFollowups,
    setLoadingFollowups,
  ] = useState(false);

  const [
    followupModalOpen,
    setFollowupModalOpen,
  ] = useState(false);

  const [
    editingFollowup,
    setEditingFollowup,
  ] =
    useState<GuestFollowup | null>(
      null
    );

  const currentStays =
    useMemo(() => {
      switch (tab) {
        case "in_house":
          return inHouse;

        case "departures":
          return departures;

        default:
          return arrivals;
      }
    }, [
      tab,
      arrivals,
      inHouse,
      departures,
    ]);

useEffect(() => {
  if (!selectedStay) {
    setFollowups([]);
    return;
  }

  let cancelled = false;

  async function load(
    stay: HotelStay
  ) {
    try {
      setLoadingFollowups(true);

      const rows =
        await getFollowups(
          stay.hotel_id,
          stay.id
        );

      if (!cancelled) {
        setFollowups(rows);
      }
    } catch (err) {
      console.error(
        "Erreur suivi client :",
        err
      );
    } finally {
      if (!cancelled) {
        setLoadingFollowups(false);
      }
    }
  }

  load(selectedStay);

  return () => {
    cancelled = true;
  };
}, [selectedStay]);

  async function handleCreate(
    values: {
      type:
        GuestFollowup["followup_type"];

      priority:
        GuestFollowup["priority"];

      status:
        GuestFollowup["status"];

      content: string;
    }
  ) {
    if (!selectedStay) {
      return;
    }

    const created =
      await createFollowup({
        hotelId:
          selectedStay.hotel_id,

        stayId:
          selectedStay.id,

        type:
          values.type,

        priority:
          values.priority,

        content:
          values.content,
      });

    setFollowups(
      (previous) => [
        created,
        ...previous,
      ]
    );
  }

  async function handleEdit(
    values: {
      type:
        GuestFollowup["followup_type"];

      priority:
        GuestFollowup["priority"];

      status:
        GuestFollowup["status"];

      content: string;
    }
  ) {
    if (!editingFollowup) {
      return;
    }

    const resolvedAt =
      values.status ===
      "resolved"
        ? new Date().toISOString()
        : null;

    const updated =
      await updateFollowup(
        editingFollowup.id,
        {
          followup_type:
            values.type,

          priority:
            values.priority,

          status:
            values.status,

          content:
            values.content,

          resolved_at:
            resolvedAt,
        }
      );

    setFollowups(
      (previous) =>
        previous.map(
          (followup) =>
            followup.id ===
            updated.id
              ? updated
              : followup
        )
    );

    setEditingFollowup(
      null
    );
  }

  async function handleDelete(
    id: string
  ) {
    if (
      !window.confirm(
        "Supprimer ce suivi ?"
      )
    ) {
      return;
    }

    await deleteFollowup(id);

    setFollowups(
      (previous) =>
        previous.filter(
          (followup) =>
            followup.id !== id
        )
    );
  }

  return (
    <>
      <PageHeader
        title="Hôtel"
        subtitle="Suivez les arrivées, les séjours en cours et les départs."
      />

      <div className="hotel-tabs">
        <button
          type="button"
          className={
            tab === "arrivals"
              ? "active"
              : ""
          }
          onClick={() =>
            setTab("arrivals")
          }
        >
          Arrivées
          <span>
            {arrivals.length}
          </span>
        </button>

        <button
          type="button"
          className={
            tab === "in_house"
              ? "active"
              : ""
          }
          onClick={() =>
            setTab("in_house")
          }
        >
          En séjour
          <span>
            {inHouse.length}
          </span>
        </button>

        <button
          type="button"
          className={
            tab === "departures"
              ? "active"
              : ""
          }
          onClick={() =>
            setTab("departures")
          }
        >
          Départs
          <span>
            {departures.length}
          </span>
        </button>
      </div>

      {error && (
        <div className="hotel-error">
          {error}

          <button
            type="button"
            onClick={refresh}
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="hotel-empty">
          Chargement des séjours…
        </div>
      ) : currentStays.length ===
        0 ? (
        <div className="hotel-empty">
          Aucun séjour pour cette
          section.
        </div>
      ) : (
        <div className="hotel-stays-grid">
          {currentStays.map(
            (stay) => (
              <StayCard
                key={stay.id}
                stay={stay}
                onClick={() =>
                  setSelectedStay(
                    stay
                  )
                }
              />
            )
          )}
        </div>
      )}

      <StayDetails
        stay={selectedStay}
        followups={followups}
        loadingFollowups={
          loadingFollowups
        }
        onClose={() =>
          setSelectedStay(null)
        }
        onAddFollowup={() => {
          setEditingFollowup(
            null
          );

          setFollowupModalOpen(
            true
          );
        }}
        onUpdateFollowup={(
          followup
        ) => {
          setEditingFollowup(
            followup
          );

          setFollowupModalOpen(
            true
          );
        }}
        onDeleteFollowup={
          handleDelete
        }
      />

      <FollowupModal
        open={
          followupModalOpen
        }
        followup={
          editingFollowup
        }
        onClose={() => {
          setFollowupModalOpen(
            false
          );

          setEditingFollowup(
            null
          );
        }}
        onSubmit={async (
          values
        ) => {
          if (
            editingFollowup
          ) {
            await handleEdit(
              values
            );
          } else {
            await handleCreate(
              values
            );
          }
        }}
      />
    </>
  );
}