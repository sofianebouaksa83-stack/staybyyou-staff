import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { guests } from "../data/mock";

export default function ClientsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return guests;
    return guests.filter((guest) =>
      `${guest.firstName} ${guest.lastName} ${guest.room}`
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Les informations utiles, sans longues fiches illisibles."
      />

      <label className="global-search compact">
        <Search size={18}/>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client ou une chambre…"
        />
      </label>

      <div className="guest-list top-gap">
        {filtered.map((guest) => (
          <Link to={`/clients/${guest.id}`} className="guest-card" key={guest.id}>
            <div className="room">#{guest.room}</div>
            <div className="guest-main">
              <strong>{guest.firstName} {guest.lastName}</strong>
              <p>{guest.arrival} → {guest.departure}</p>
            </div>
            <div className="tags">
              {guest.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
