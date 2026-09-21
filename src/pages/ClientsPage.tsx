import {
  useMemo,
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
  Badge,
} from "../components/ui/Badge";

import {
  useClients,
} from "../features/clients/hooks/useClients";

import type {
  ClientStay,
} from "../features/clients/types/clients.types";

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

function isSameDay(
  first: Date,
  second: Date
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function getStayStatus(
  stay: ClientStay
) {
  const now =
    new Date();

  const start =
    new Date(
      stay.startsAt
    );

  const end =
    new Date(
      stay.endsAt
    );

  if (
    isSameDay(
      now,
      start
    )
  ) {
    return "Arrivée";
  }

  if (
    isSameDay(
      now,
      end
    )
  ) {
    return "Départ";
  }

  if (
    now > start &&
    now < end
  ) {
    return "En séjour";
  }

  if (
    now < start
  ) {
    return "À venir";
  }

  return "Terminé";
}

export default function ClientsPage() {
  const {
    clients,
    loading,
    error,
  } = useClients();

  const [
    query,
    setQuery,
  ] = useState("");

  const filtered =
    useMemo(() => {
      const q =
        query
          .toLowerCase()
          .trim();

      if (!q) {
        return clients;
      }

      return clients.filter(
        (client) =>
          `${client.guestName} ${client.roomName} ${client.roomCode}`
            .toLowerCase()
            .includes(q)
      );
    }, [
      clients,
      query,
    ]);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Les informations utiles, sans longues fiches illisibles."
      />

      <label className="global-search compact">
        <Search size={18} />

        <input
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Rechercher un client ou une chambre…"
        />
      </label>

      {error && (
        <div
          style={{
            marginTop: 16,
            color: "#a84d46",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "30px 0",
            opacity: 0.65,
          }}
        >
          Chargement des clients…
        </div>
      ) : (
        <div className="guest-list top-gap">
          {filtered.map(
            (client) => (
              <Link
                to={`/clients/${client.id}`}
                className="guest-card"
                key={client.id}
              >
                <div className="room">
                  #
                  {client.roomCode ||
                    client.roomName}
                </div>

                <div className="guest-main">
                  <strong>
                    {client.guestName}
                  </strong>

                  <p>
                    {formatDate(
                      client.startsAt
                    )}
                    {" → "}
                    {formatDate(
                      client.endsAt
                    )}
                  </p>
                </div>

                <div className="tags">
                  <Badge>
                    {getStayStatus(
                      client
                    )}
                  </Badge>
                </div>
              </Link>
            )
          )}

          {filtered.length ===
            0 && (
            <div
              style={{
                padding: "30px 0",
                opacity: 0.6,
              }}
            >
              Aucun client trouvé.
            </div>
          )}
        </div>
      )}
    </>
  );
}