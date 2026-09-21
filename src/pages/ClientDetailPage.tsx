import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Heart,
  Info,
  ListTodo,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Badge,
} from "../components/ui/Badge";

import {
  EmptyState,
} from "../components/ui/EmptyState";

import {
  useApp,
} from "../app/AppContext";

import {
  createClientFollowup,
  deleteClientFollowup,
  getClientFollowups,
  getClientStayById,
  updateClientFollowup,
  updateClientFollowupStatus,
} from "../features/clients/services/clients.service";

import type {
  ClientFollowup,
  ClientStay,
} from "../features/clients/types/clients.types";

import {
  useHotelPermission,
} from "../features/permissions/hooks/useHotelPermission";

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}

function getFollowupIcon(
  type: ClientFollowup["type"]
) {
  switch (type) {
    case "incident":
    case "complaint":
      return CircleAlert;

    case "request":
      return ListTodo;

    case "preference":
    case "vip":
      return Heart;

    default:
      return Info;
  }
}

function getFollowupLabel(
  type: ClientFollowup["type"]
) {
  switch (type) {
    case "note":
      return "Note";

    case "request":
      return "Demande";

    case "complaint":
      return "Réclamation";

    case "incident":
      return "Incident";

    case "preference":
      return "Préférence";

    case "vip":
      return "VIP";

    default:
      return "Suivi";
  }
}

function getStatusLabel(
  status: ClientFollowup["status"]
) {
  switch (status) {
    case "open":
      return "Ouvert";

    case "in_progress":
      return "En cours";

    case "resolved":
      return "Résolu";

    default:
      return status;
  }
}

function getPriorityLabel(
  priority: ClientFollowup["priority"]
) {
  switch (priority) {
    case "high":
      return "Haute";

    case "urgent":
      return "Urgente";

    default:
      return "Normale";
  }
}

function getTimelineClass(
  type: ClientFollowup["type"]
) {
  switch (type) {
    case "incident":
    case "complaint":
      return "incident";

    case "request":
      return "task";

    case "vip":
      return "positive";

    default:
      return "info";
  }
}

function hasWorkflow(
  type: ClientFollowup["type"]
) {
  return (
    type === "request" ||
    type === "complaint" ||
    type === "incident"
  );
}

export default function ClientDetailPage() {
  const {
    id,
  } = useParams();

  const {
    hotelId,
    user,
  } = useApp();

  const {
    allowed: canManageFollowups,
  } = useHotelPermission(
    hotelId,
    "hotel.followups.manage"
  );

  const [
    client,
    setClient,
  ] = useState<ClientStay | null>(
    null
  );

  const [
    followups,
    setFollowups,
  ] = useState<ClientFollowup[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState<string | null>(
    null
  );

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null
  );

  const [
    showFollowupModal,
    setShowFollowupModal,
  ] = useState(false);

  const [
    editingFollowup,
    setEditingFollowup,
  ] = useState<ClientFollowup | null>(
    null
  );

  const [
    followupType,
    setFollowupType,
  ] =
    useState<ClientFollowup["type"]>(
      "note"
    );

  const [
    followupPriority,
    setFollowupPriority,
  ] =
    useState<ClientFollowup["priority"]>(
      "normal"
    );

  const [
    followupContent,
    setFollowupContent,
  ] = useState("");

  const [
    savingFollowup,
    setSavingFollowup,
  ] = useState(false);

  const [
    followupError,
    setFollowupError,
  ] = useState<string | null>(
    null
  );

  const [
    busyFollowupId,
    setBusyFollowupId,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      if (
        !hotelId ||
        !id
      ) {
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setLoadError(null);

        const [
          stay,
          followupRows,
        ] = await Promise.all([
          getClientStayById(
            hotelId,
            id
          ),

          getClientFollowups(
            hotelId,
            id
          ),
        ]);

        if (cancelled) {
          return;
        }

        setClient(
          stay
        );

        setFollowups(
          followupRows
        );
      } catch (error) {
        console.error(
          "Erreur fiche client :",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Impossible de charger la fiche client."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    hotelId,
    id,
  ]);

  const preferences =
    useMemo(
      () =>
        followups.filter(
          (item) =>
            item.type ===
            "preference"
        ),
      [followups]
    );

  const notes =
    useMemo(
      () =>
        followups.filter(
          (item) =>
            item.type ===
            "note"
        ),
      [followups]
    );

  const history =
    useMemo(
      () =>
        followups.filter(
          (item) =>
            item.type !==
              "preference" &&
            item.type !==
              "note"
        ),
      [followups]
    );

  const isVip =
    useMemo(
      () =>
        followups.some(
          (item) =>
            item.type ===
            "vip"
        ),
      [followups]
    );

  function resetFollowupForm() {
    setEditingFollowup(
      null
    );

    setFollowupType(
      "note"
    );

    setFollowupPriority(
      "normal"
    );

    setFollowupContent(
      ""
    );

    setFollowupError(
      null
    );
  }

  function openFollowupModal() {
    resetFollowupForm();

    setShowFollowupModal(
      true
    );
  }

  function openEditFollowup(
    item: ClientFollowup
  ) {
    setEditingFollowup(
      item
    );

    setFollowupType(
      item.type
    );

    setFollowupPriority(
      item.priority
    );

    setFollowupContent(
      item.content
    );

    setFollowupError(
      null
    );

    setShowFollowupModal(
      true
    );
  }

  function closeFollowupModal() {
    if (savingFollowup) {
      return;
    }

    setShowFollowupModal(
      false
    );

    resetFollowupForm();
  }

  async function handleSubmitFollowup(
    event?: FormEvent
  ) {
    event?.preventDefault();

    const content =
      followupContent.trim();

    if (
      !hotelId ||
      !id ||
      !user.id ||
      !canManageFollowups ||
      !content
    ) {
      return;
    }

    try {
      setSavingFollowup(
        true
      );

      setFollowupError(
        null
      );

      if (editingFollowup) {
        const updated =
          await updateClientFollowup({
            hotelId,

            followupId:
              editingFollowup.id,

            type:
              followupType,

            priority:
              followupPriority,

            content,
          });

        setFollowups(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            )
        );
      } else {
        const created =
          await createClientFollowup({
            hotelId,

            stayId:
              id,

            createdBy:
              user.id,

            type:
              followupType,

            priority:
              followupPriority,

            content,
          });

        setFollowups(
          (previous) => [
            created,
            ...previous,
          ]
        );
      }

      setShowFollowupModal(
        false
      );

      resetFollowupForm();
    } catch (error) {
      console.error(
        "Erreur enregistrement suivi :",
        error
      );

      setFollowupError(
        editingFollowup
          ? "Impossible de modifier le suivi."
          : "Impossible d'ajouter le suivi client."
      );
    } finally {
      setSavingFollowup(
        false
      );
    }
  }

  async function handleStatusChange(
    item: ClientFollowup,
    status: ClientFollowup["status"]
  ) {
    if (
      !hotelId ||
      !canManageFollowups
    ) {
      return;
    }

    try {
      setBusyFollowupId(
        item.id
      );

      setActionError(
        null
      );

      const updated =
        await updateClientFollowupStatus({
          hotelId,

          followupId:
            item.id,

          status,
        });

      setFollowups(
        (previous) =>
          previous.map(
            (current) =>
              current.id ===
                updated.id
                ? updated
                : current
          )
      );
    } catch (error) {
      console.error(
        "Erreur statut suivi :",
        error
      );

      setActionError(
        "Impossible de modifier le statut du suivi."
      );
    } finally {
      setBusyFollowupId(
        null
      );
    }
  }

  async function handleDeleteFollowup(
    item: ClientFollowup
  ) {
    if (
      !hotelId ||
      !canManageFollowups
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Supprimer ce suivi "${getFollowupLabel(
          item.type
        )}" ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setBusyFollowupId(
        item.id
      );

      setActionError(
        null
      );

      await deleteClientFollowup(
        hotelId,
        item.id
      );

      setFollowups(
        (previous) =>
          previous.filter(
            (current) =>
              current.id !==
              item.id
          )
      );
    } catch (error) {
      console.error(
        "Erreur suppression suivi :",
        error
      );

      setActionError(
        "Impossible de supprimer le suivi."
      );
    } finally {
      setBusyFollowupId(
        null
      );
    }
  }

  if (loading) {
    return (
      <div className="center">
        <p>
          Chargement du client…
        </p>
      </div>
    );
  }

  if (
    loadError ||
    !client
  ) {
    return (
      <div className="center">
        <p>
          {loadError ??
            "Client introuvable."}
        </p>

        <Link to="/clients">
          Retour aux clients
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/clients"
        className="back-link"
      >
        <ArrowLeft size={16} />
        Clients
      </Link>

      <section className="client-hero client-hero-detail">
        <div className="client-hero-main">
          <div className="room large">
            #
            {client.roomCode ||
              client.roomName}
          </div>

          <div>
            <h1>
              {client.guestName}
            </h1>

            <p>
              {formatDate(
                client.startsAt
              )}

              {" → "}

              {formatDate(
                client.endsAt
              )}
            </p>

            <div className="tags">
              {client.active && (
                <Badge>
                  Séjour actif
                </Badge>
              )}

              {isVip && (
                <Badge>
                  VIP
                </Badge>
              )}
            </div>
          </div>
        </div>

        {canManageFollowups && (
          <div className="client-hero-action">
            <button
              type="button"
              className="primary-button small-button client-followup-add-button"
              onClick={
                openFollowupModal
              }
            >
              <Plus size={15} />

              <span className="client-followup-label-desktop">
                Ajouter un suivi
              </span>

              <span className="client-followup-label-mobile">
                Suivi
              </span>
            </button>
          </div>
        )}
      </section>

      {actionError && (
        <div className="client-followup-action-error">
          {actionError}
        </div>
      )}

      <div className="two-col">
        <section className="panel">
          <div className="panel-title">
            <h2>
              Historique
            </h2>
          </div>

          {history.length ? (
            history.map(
              (item) => {
                const Icon =
                  getFollowupIcon(
                    item.type
                  );

                const busy =
                  busyFollowupId ===
                  item.id;

                return (
                  <div
                    className="timeline-row client-followup-history-row"
                    key={item.id}
                  >
                    <div
                      className={`timeline-icon ${getTimelineClass(
                        item.type
                      )}`}
                    >
                      <Icon
                        size={16}
                      />
                    </div>

                    <div className="client-followup-history-content">
                      <div className="client-followup-history-head">
                        <div>
                          <strong>
                            {getFollowupLabel(
                              item.type
                            )}
                          </strong>

                          <div className="client-followup-meta-chips">
                            {hasWorkflow(
                              item.type
                            ) && (
                              <span
                                className={`client-followup-chip status-${item.status}`}
                              >
                                {getStatusLabel(
                                  item.status
                                )}
                              </span>
                            )}

                            <span
                              className={`client-followup-chip priority-${item.priority}`}
                            >
                              {getPriorityLabel(
                                item.priority
                              )}
                            </span>
                          </div>
                        </div>

                        {canManageFollowups && (
                          <div className="client-followup-row-actions">
                            <button
                              type="button"
                              className="client-followup-icon-button"
                              onClick={() =>
                                openEditFollowup(
                                  item
                                )
                              }
                              disabled={
                                busy
                              }
                              title="Modifier"
                              aria-label="Modifier"
                            >
                              <Pencil
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              className="client-followup-icon-button danger"
                              onClick={() =>
                                void handleDeleteFollowup(
                                  item
                                )
                              }
                              disabled={
                                busy
                              }
                              title="Supprimer"
                              aria-label="Supprimer"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>
                        )}
                      </div>

                      <p>
                        {item.content}
                      </p>

                      <small>
                        {formatDateTime(
                          item.createdAt
                        )}
                      </small>

                      {canManageFollowups &&
                        hasWorkflow(
                          item.type
                        ) && (
                          <div className="client-followup-status-actions">
                            {item.status ===
                              "open" && (
                              <button
                                type="button"
                                className="secondary-button small-button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void handleStatusChange(
                                    item,
                                    "in_progress"
                                  )
                                }
                              >
                                <Clock3
                                  size={13}
                                />
                                En cours
                              </button>
                            )}

                            {item.status ===
                              "in_progress" && (
                              <button
                                type="button"
                                className="secondary-button small-button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void handleStatusChange(
                                    item,
                                    "open"
                                  )
                                }
                              >
                                <RotateCcw
                                  size={13}
                                />
                                Rouvrir
                              </button>
                            )}

                            {item.status !==
                              "resolved" && (
                              <button
                                type="button"
                                className="primary-button small-button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void handleStatusChange(
                                    item,
                                    "resolved"
                                  )
                                }
                              >
                                <CheckCircle2
                                  size={13}
                                />
                                Résoudre
                              </button>
                            )}

                            {item.status ===
                              "resolved" && (
                              <button
                                type="button"
                                className="secondary-button small-button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void handleStatusChange(
                                    item,
                                    "open"
                                  )
                                }
                              >
                                <RotateCcw
                                  size={13}
                                />
                                Rouvrir
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              }
            )
          ) : (
            <EmptyState text="Aucun élément dans l’historique." />
          )}
        </section>

        <div className="stack">
          <section className="panel">
            <div className="panel-title">
              <h2>
                Préférences
              </h2>
            </div>

            {preferences.length ? (
              preferences.map(
                (item) => (
                  <div
                    className="client-followup-simple-row"
                    key={item.id}
                  >
                    <div className="client-followup-simple-main">
                      <p className="simple-line">
                        {item.content}
                      </p>

                      <small>
                        {formatDateTime(
                          item.createdAt
                        )}
                      </small>
                    </div>

                    {canManageFollowups && (
                      <div className="client-followup-row-actions">
                        <button
                          type="button"
                          className="client-followup-icon-button"
                          onClick={() =>
                            openEditFollowup(
                              item
                            )
                          }
                          disabled={
                            busyFollowupId ===
                            item.id
                          }
                          title="Modifier"
                          aria-label="Modifier"
                        >
                          <Pencil
                            size={14}
                          />
                        </button>

                        <button
                          type="button"
                          className="client-followup-icon-button danger"
                          onClick={() =>
                            void handleDeleteFollowup(
                              item
                            )
                          }
                          disabled={
                            busyFollowupId ===
                            item.id
                          }
                          title="Supprimer"
                          aria-label="Supprimer"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="muted">
                Aucune préférence enregistrée.
              </p>
            )}
          </section>

          <section className="panel">
            <div className="panel-title">
              <h2>
                Notes
              </h2>
            </div>

            {notes.length ? (
              notes.map(
                (item) => (
                  <div
                    className="client-followup-simple-row"
                    key={item.id}
                  >
                    <div className="client-followup-simple-main">
                      <p className="simple-line">
                        {item.content}
                      </p>

                      <small>
                        {formatDateTime(
                          item.createdAt
                        )}
                      </small>
                    </div>

                    {canManageFollowups && (
                      <div className="client-followup-row-actions">
                        <button
                          type="button"
                          className="client-followup-icon-button"
                          onClick={() =>
                            openEditFollowup(
                              item
                            )
                          }
                          disabled={
                            busyFollowupId ===
                            item.id
                          }
                          title="Modifier"
                          aria-label="Modifier"
                        >
                          <Pencil
                            size={14}
                          />
                        </button>

                        <button
                          type="button"
                          className="client-followup-icon-button danger"
                          onClick={() =>
                            void handleDeleteFollowup(
                              item
                            )
                          }
                          disabled={
                            busyFollowupId ===
                            item.id
                          }
                          title="Supprimer"
                          aria-label="Supprimer"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="muted">
                Aucune note.
              </p>
            )}
          </section>
        </div>
      </div>

      {showFollowupModal && (
        <div
          className="client-followup-backdrop"
          onClick={
            closeFollowupModal
          }
        >
          <form
            className="client-followup-modal"
            onSubmit={
              handleSubmitFollowup
            }
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="client-followup-modal-header">
              <div>
                <span className="eyebrow">
                  SUIVI CLIENT
                </span>

                <h2>
                  {editingFollowup
                    ? "Modifier le suivi"
                    : "Ajouter un suivi"}
                </h2>

                <p>
                  {client.guestName}
                </p>
              </div>

              <button
                type="button"
                className="ghost-icon"
                onClick={
                  closeFollowupModal
                }
                disabled={
                  savingFollowup
                }
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="client-followup-form">
              <label>
                Type

                <select
                  value={
                    followupType
                  }
                  onChange={(
                    event
                  ) =>
                    setFollowupType(
                      event.target
                        .value as ClientFollowup["type"]
                    )
                  }
                  disabled={
                    savingFollowup
                  }
                >
                  <option value="note">
                    Note
                  </option>

                  <option value="request">
                    Demande
                  </option>

                  <option value="complaint">
                    Réclamation
                  </option>

                  <option value="incident">
                    Incident
                  </option>

                  <option value="preference">
                    Préférence
                  </option>

                  <option value="vip">
                    VIP
                  </option>
                </select>
              </label>

              <label>
                Priorité

                <select
                  value={
                    followupPriority
                  }
                  onChange={(
                    event
                  ) =>
                    setFollowupPriority(
                      event.target
                        .value as ClientFollowup["priority"]
                    )
                  }
                  disabled={
                    savingFollowup
                  }
                >
                  <option value="normal">
                    Normale
                  </option>

                  <option value="high">
                    Haute
                  </option>

                  <option value="urgent">
                    Urgente
                  </option>
                </select>
              </label>

              <label className="client-followup-content">
                Contenu

                <textarea
                  value={
                    followupContent
                  }
                  onChange={(
                    event
                  ) =>
                    setFollowupContent(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ajouter une information utile pour l'équipe…"
                  rows={5}
                  disabled={
                    savingFollowup
                  }
                  autoFocus
                />
              </label>
            </div>

            {followupError && (
              <div className="client-followup-action-error">
                {followupError}
              </div>
            )}

            <div className="client-followup-modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={
                  closeFollowupModal
                }
                disabled={
                  savingFollowup
                }
              >
                Annuler
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={
                  savingFollowup ||
                  !followupContent.trim()
                }
              >
                {savingFollowup
                  ? "Enregistrement…"
                  : editingFollowup
                    ? "Enregistrer"
                    : "Ajouter le suivi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}