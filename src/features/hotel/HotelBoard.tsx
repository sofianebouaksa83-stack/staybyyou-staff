import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
} from "lucide-react";

import {
  useApp,
} from "../../app/AppContext";

import {
  PageHeader,
} from "../../components/ui/PageHeader";

import {
  createFollowup,
  createHotelStay,
  deleteFollowup,
  endHotelStay,
  getFollowups,
  getHotelRooms,
  updateFollowup,
  updateHotelStay,
  type GuestFollowup,
  type HotelRoom,
  type HotelStay,
} from "../../services/hotelService";

import {
  FollowupModal,
} from "./FollowupModal";

import {
  StayCard,
} from "./StayCard";

import {
  StayDetails,
} from "./StayDetails";

import {
  StayModal,
} from "./StayModal";

import {
  useHotel,
} from "./useHotel";


type Tab =
  | "arrivals"
  | "in_house"
  | "departures";


export function HotelBoard() {
  const {
    hotelId,
    setSelectedDate,
  } = useApp();


  const {
    arrivals,
    inHouse,
    departures,

    canViewHotel,
    canManageStays,
    canManageFollowups,

    loadingPermissions,

    loading,
    error,

    refresh,
  } = useHotel();


  const [
    tab,
    setTab,
  ] =
    useState<Tab>(
      "arrivals"
    );


  const [
    selectedStay,
    setSelectedStay,
  ] =
    useState<
      HotelStay | null
    >(null);


  const [
    followups,
    setFollowups,
  ] =
    useState<
      GuestFollowup[]
    >([]);


  const [
    loadingFollowups,
    setLoadingFollowups,
  ] =
    useState(
      false
    );


  const [
    followupModalOpen,
    setFollowupModalOpen,
  ] =
    useState(
      false
    );


  const [
    editingFollowup,
    setEditingFollowup,
  ] =
    useState<
      GuestFollowup | null
    >(null);


  const [
    rooms,
    setRooms,
  ] =
    useState<
      HotelRoom[]
    >([]);


  const [
    loadingRooms,
    setLoadingRooms,
  ] =
    useState(
      false
    );


  const [
    stayModalOpen,
    setStayModalOpen,
  ] =
    useState(
      false
    );


  const [
    editingStay,
    setEditingStay,
  ] =
    useState<
      HotelStay | null
    >(null);


  const [
    savingStay,
    setSavingStay,
  ] =
    useState(
      false
    );


  const [
    endingStay,
    setEndingStay,
  ] =
    useState(
      false
    );


  const [
    stayError,
    setStayError,
  ] =
    useState<
      string | null
    >(null);


  const currentStays =
    useMemo(() => {
      switch (
        tab
      ) {
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
    if (
      !hotelId ||
      !canManageStays
    ) {
      setRooms(
        []
      );

      return;
    }


    let cancelled =
      false;


    async function loadRooms() {
      try {
        setLoadingRooms(
          true
        );

        const rows =
          await getHotelRooms(
            hotelId as string
          );


        if (
          !cancelled
        ) {
          setRooms(
            rows
          );
        }
      } catch (
        err
      ) {
        console.error(
          "Erreur chargement chambres :",
          err
        );

        if (
          !cancelled
        ) {
          setStayError(
            "Impossible de charger les chambres."
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoadingRooms(
            false
          );
        }
      }
    }


    void loadRooms();


    return () => {
      cancelled =
        true;
    };
  }, [
    hotelId,
    canManageStays,
  ]);


  useEffect(() => {
    if (
      !selectedStay ||
      !canViewHotel
    ) {
      setFollowups(
        []
      );

      return;
    }


    let cancelled =
      false;


    async function load(
      stay:
        HotelStay
    ) {
      try {
        setLoadingFollowups(
          true
        );


        const rows =
          await getFollowups(
            stay.hotel_id,
            stay.id
          );


        if (
          !cancelled
        ) {
          setFollowups(
            rows
          );
        }
      } catch (
        err
      ) {
        console.error(
          "Erreur suivi client :",
          err
        );
      } finally {
        if (
          !cancelled
        ) {
          setLoadingFollowups(
            false
          );
        }
      }
    }


    void load(
      selectedStay
    );


    return () => {
      cancelled =
        true;
    };
  }, [
    selectedStay,
    canViewHotel,
  ]);


  async function handleCreateStay(
    values: {
      roomId:
        string;

      guestName:
        string;

      accessCode:
        string;

      startsAt:
        string;

      endsAt:
        string;
    }
  ) {
    if (
      !canManageStays
    ) {
      return;
    }


    try {
      setSavingStay(
        true
      );

      setStayError(
        null
      );


      await createHotelStay({
        roomId:
          values.roomId,

        guestName:
          values.guestName,

        accessCode:
          values.accessCode,

        startsAt:
          values.startsAt,

        endsAt:
          values.endsAt,
      });


      await refresh();


      setSelectedDate(
        new Date(
          values.startsAt
        )
      );

      setTab(
        "arrivals"
      );

      setStayModalOpen(
        false
      );

      setEditingStay(
        null
      );
    } catch (
      err
    ) {
      console.error(
        "Erreur création séjour :",
        err
      );

      throw err;
    } finally {
      setSavingStay(
        false
      );
    }
  }


  async function handleUpdateStay(
    values: {
      roomId:
        string;

      guestName:
        string;

      accessCode:
        string;

      startsAt:
        string;

      endsAt:
        string;
    }
  ) {
    if (
      !editingStay ||
      !canManageStays
    ) {
      return;
    }


    try {
      setSavingStay(
        true
      );

      setStayError(
        null
      );


      await updateHotelStay({
        stayId:
          editingStay.id,

        roomId:
          values.roomId,

        guestName:
          values.guestName,

        startsAt:
          values.startsAt,

        endsAt:
          values.endsAt,

        accessCode:
          values.accessCode ||
          null,
      });


      await refresh();


      setStayModalOpen(
        false
      );

      setEditingStay(
        null
      );

      setSelectedStay(
        null
      );
    } catch (
      err
    ) {
      console.error(
        "Erreur modification séjour :",
        err
      );

      throw err;
    } finally {
      setSavingStay(
        false
      );
    }
  }


  async function handleEndStay() {
    if (
      !selectedStay ||
      !canManageStays ||
      selectedStay.source !==
        "staybyyou"
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        `Terminer le séjour de ${selectedStay.guest_name} ?`
      );


    if (
      !confirmed
    ) {
      return;
    }


    try {
      setEndingStay(
        true
      );

      setStayError(
        null
      );


      await endHotelStay(
        selectedStay.id
      );


      setSelectedStay(
        null
      );


      await refresh();
    } catch (
      err
    ) {
      console.error(
        "Erreur fin séjour :",
        err
      );

      setStayError(
        err instanceof
          Error
          ? err.message
          : "Impossible de terminer le séjour."
      );
    } finally {
      setEndingStay(
        false
      );
    }
  }


  async function handleCreateFollowup(
    values: {
      type:
        GuestFollowup["followup_type"];

      priority:
        GuestFollowup["priority"];

      status:
        GuestFollowup["status"];

      content:
        string;
    }
  ) {
    if (
      !selectedStay ||
      !canManageFollowups
    ) {
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
      (
        previous
      ) => [
        created,
        ...previous,
      ]
    );
  }


  async function handleEditFollowup(
    values: {
      type:
        GuestFollowup["followup_type"];

      priority:
        GuestFollowup["priority"];

      status:
        GuestFollowup["status"];

      content:
        string;
    }
  ) {
    if (
      !editingFollowup ||
      !canManageFollowups
    ) {
      return;
    }


    const resolvedAt =
      values.status ===
      "resolved"
        ? new Date()
            .toISOString()
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
      (
        previous
      ) =>
        previous.map(
          (
            followup
          ) =>
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


  async function handleDeleteFollowup(
    id:
      string
  ) {
    if (
      !canManageFollowups
    ) {
      return;
    }


    if (
      !window.confirm(
        "Supprimer ce suivi ?"
      )
    ) {
      return;
    }


    await deleteFollowup(
      id
    );


    setFollowups(
      (
        previous
      ) =>
        previous.filter(
          (
            followup
          ) =>
            followup.id !==
            id
        )
    );
  }


  if (
    loadingPermissions
  ) {
    return (
      <>
        <PageHeader
          title="Hôtel"

          subtitle="Suivez les arrivées, les séjours en cours et les départs."
        />

        <div className="hotel-empty">
          Vérification des permissions…
        </div>
      </>
    );
  }


  if (
    !canViewHotel
  ) {
    return (
      <>
        <PageHeader
          title="Hôtel"

          subtitle="Suivez les arrivées, les séjours en cours et les départs."
        />

        <div className="hotel-empty">
          Vous n’avez pas accès à l’activité de l’hôtel.
        </div>
      </>
    );
  }


  return (
    <>
      <PageHeader
        title="Hôtel"

        subtitle="Suivez les arrivées, les séjours en cours et les départs."

        action={
          canManageStays ? (
            <button
              type="button"
              className="primary-button"

              disabled={
                loadingRooms ||
                rooms.length ===
                  0
              }

              onClick={() => {
                setEditingStay(
                  null
                );

                setStayModalOpen(
                  true
                );
              }}
            >
              <Plus
                size={15}
              />

              Nouveau séjour
            </button>
          ) : undefined
        }
      />


      {stayError && (
        <div className="hotel-error">
          {stayError}

          <button
            type="button"

            onClick={() =>
              setStayError(
                null
              )
            }
          >
            Fermer
          </button>
        </div>
      )}


      <div className="hotel-tabs">
        <button
          type="button"

          className={
            tab ===
            "arrivals"
              ? "active"
              : ""
          }

          onClick={() =>
            setTab(
              "arrivals"
            )
          }
        >
          Arrivées

          <span>
            {
              arrivals.length
            }
          </span>
        </button>


        <button
          type="button"

          className={
            tab ===
            "in_house"
              ? "active"
              : ""
          }

          onClick={() =>
            setTab(
              "in_house"
            )
          }
        >
          En séjour

          <span>
            {
              inHouse.length
            }
          </span>
        </button>


        <button
          type="button"

          className={
            tab ===
            "departures"
              ? "active"
              : ""
          }

          onClick={() =>
            setTab(
              "departures"
            )
          }
        >
          Départs

          <span>
            {
              departures.length
            }
          </span>
        </button>
      </div>


      {error && (
        <div className="hotel-error">
          {error}

          <button
            type="button"

            onClick={
              refresh
            }
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
          Aucun séjour pour cette section.
        </div>
      ) : (
        <div className="hotel-stays-grid">
          {currentStays.map(
            (
              stay
            ) => (
              <StayCard
                key={
                  stay.id
                }

                stay={
                  stay
                }

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
        stay={
          selectedStay
        }

        followups={
          followups
        }

        loadingFollowups={
          loadingFollowups
        }

        canManageFollowups={
          canManageFollowups
        }

        canManageStays={
          canManageStays
        }

        endingStay={
          endingStay
        }

        onClose={() =>
          setSelectedStay(
            null
          )
        }

        onEditStay={() => {
          if (
            !selectedStay
          ) {
            return;
          }

          setEditingStay(
            selectedStay
          );

          setStayModalOpen(
            true
          );
        }}

        onEndStay={() =>
          void handleEndStay()
        }

        onAddFollowup={() => {
          if (
            !canManageFollowups
          ) {
            return;
          }

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
          if (
            !canManageFollowups
          ) {
            return;
          }

          setEditingFollowup(
            followup
          );

          setFollowupModalOpen(
            true
          );
        }}

        onDeleteFollowup={
          handleDeleteFollowup
        }
      />


      {canManageFollowups && (
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
              await handleEditFollowup(
                values
              );
            } else {
              await handleCreateFollowup(
                values
              );
            }
          }}
        />
      )}


      {canManageStays && (
        <StayModal
          open={
            stayModalOpen
          }

          stay={
            editingStay
          }

          rooms={
            rooms
          }

          saving={
            savingStay
          }

          onClose={() => {
            if (
              savingStay
            ) {
              return;
            }

            setStayModalOpen(
              false
            );

            setEditingStay(
              null
            );
          }}

          onSubmit={
            editingStay
              ? handleUpdateStay
              : handleCreateStay
          }
        />
      )}
    </>
  );
}