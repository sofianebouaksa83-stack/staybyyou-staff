import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { guests, messages, tasks } from "../data/mock";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { guests: [], tasks: [], messages: [] };

    return {
      guests: guests.filter((g) =>
        `${g.firstName} ${g.lastName} ${g.room}`.toLowerCase().includes(q)
      ),
      tasks: tasks.filter((t) =>
        `${t.title} ${t.location ?? ""}`.toLowerCase().includes(q)
      ),
      messages: messages.filter((m) =>
        m.text.toLowerCase().includes(q)
      ),
    };
  }, [query]);

  return (
    <>
      <PageHeader
        title="Recherche"
        subtitle="Retrouvez rapidement un client, une chambre, une tâche ou un message."
      />

      <label className="global-search">
        <Search size={20}/>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Client, chambre, tâche, message…"
        />
      </label>

      {!query && <p className="empty">Commencez à saisir pour rechercher dans l’hôtel.</p>}

      {query && (
        <div className="search-results">
          <section className="panel">
            <div className="panel-title"><h2>Clients</h2></div>
            {results.guests.length
              ? results.guests.map((g) => (
                <Link className="search-result" to={`/clients/${g.id}`} key={g.id}>
                  <strong>{g.firstName} {g.lastName}</strong>
                  <small>Chambre {g.room}</small>
                </Link>
              ))
              : <p className="muted">Aucun client.</p>}
          </section>

          <section className="panel">
            <div className="panel-title"><h2>Tâches</h2></div>
            {results.tasks.length
              ? results.tasks.map((t) => (
                <div className="search-result" key={t.id}>
                  <strong>{t.title}</strong>
                  <small>{t.location ?? t.department}</small>
                </div>
              ))
              : <p className="muted">Aucune tâche.</p>}
          </section>

          <section className="panel">
            <div className="panel-title"><h2>Messages</h2></div>
            {results.messages.length
              ? results.messages.map((m) => (
                <div className="search-result" key={m.id}>
                  <strong>#{m.channelName}</strong>
                  <small>{m.text}</small>
                </div>
              ))
              : <p className="muted">Aucun message.</p>}
          </section>
        </div>
      )}
    </>
  );
}
