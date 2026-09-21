import {
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  PageHeader,
} from "../components/ui/PageHeader";

import {
  useGlobalSearch,
} from "../features/search/hooks/useGlobalSearch";

function taskStatusLabel(
  status: string
) {
  switch (status) {
    case "todo":
      return "À faire";

    case "in_progress":
      return "En cours";

    case "done":
      return "Terminée";

    default:
      return status;
  }
}

export default function SearchPage() {
  const [
    query,
    setQuery,
  ] = useState("");

  const {
    results,
    loading,
    error,
  } =
    useGlobalSearch(
      query
    );

  const normalizedQuery =
    query.trim();

  const hasResults =
    results.clients.length >
      0 ||
    results.tasks.length >
      0 ||
    results.messages.length >
      0;

  return (
    <>
      <PageHeader
        title="Recherche"
        subtitle="Retrouvez rapidement un client, une chambre, une tâche ou un message."
      />

      <label className="global-search">
        <Search
          size={20}
        />

        <input
          autoFocus
          value={
            query
          }
          onChange={(
            event
          ) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Client, chambre, tâche, message…"
        />
      </label>

      {!normalizedQuery && (
        <p className="empty">
          Commencez à saisir pour rechercher dans l’hôtel.
        </p>
      )}

      {normalizedQuery.length ===
        1 && (
        <p className="empty">
          Saisissez au moins 2 caractères.
        </p>
      )}

      {loading && (
        <p className="empty">
          Recherche…
        </p>
      )}

      {error && (
        <p className="empty">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        normalizedQuery.length >=
          2 &&
        !hasResults && (
          <p className="empty">
            Aucun résultat pour «{" "}
            {normalizedQuery}
            {" "}».
          </p>
        )}

      {!loading &&
        normalizedQuery.length >=
          2 &&
        hasResults && (
          <div className="search-results">
            <section className="panel">
              <div className="panel-title">
                <h2>
                  Clients
                </h2>

                <span>
                  {
                    results
                      .clients
                      .length
                  }
                </span>
              </div>

              {results.clients.length ? (
                results.clients.map(
                  (client) => (
                    <Link
                      className="search-result"
                      to={`/clients/${client.id}`}
                      key={
                        client.id
                      }
                    >
                      <strong>
                        {
                          client.guestName
                        }
                      </strong>

                      <small>
                        Chambre{" "}
                        {client.roomCode ||
                          client.roomName}
                      </small>
                    </Link>
                  )
                )
              ) : (
                <p className="muted">
                  Aucun client.
                </p>
              )}
            </section>

            <section className="panel">
              <div className="panel-title">
                <h2>
                  Tâches
                </h2>

                <span>
                  {
                    results
                      .tasks
                      .length
                  }
                </span>
              </div>

              {results.tasks.length ? (
                results.tasks.map(
                  (task) => (
                    <Link
                      className="search-result"
                      to="/tasks"
                      key={
                        task.id
                      }
                    >
                      <strong>
                        {
                          task.title
                        }
                      </strong>

                      <small>
                        {taskStatusLabel(
                          task.status
                        )}

                        {task.roomName
                          ? ` · Chambre ${task.roomName}`
                          : ""}

                        {task.description
                          ? ` · ${task.description}`
                          : ""}
                      </small>
                    </Link>
                  )
                )
              ) : (
                <p className="muted">
                  Aucune tâche.
                </p>
              )}
            </section>

            <section className="panel">
              <div className="panel-title">
                <h2>
                  Messages
                </h2>

                <span>
                  {
                    results
                      .messages
                      .length
                  }
                </span>
              </div>

              {results.messages.length ? (
                results.messages.map(
                  (message) => (
                    <Link
                      className="search-result"
                      to="/messages"
                      key={
                        message.id
                      }
                    >
                      <strong>
                        #
                        {
                          message.channelName
                        }
                      </strong>

                      <small>
                        {
                          message.content
                        }
                      </small>
                    </Link>
                  )
                )
              ) : (
                <p className="muted">
                  Aucun message.
                </p>
              )}
            </section>
          </div>
        )}
    </>
  );
}