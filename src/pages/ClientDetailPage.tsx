import { ArrowLeft, CircleAlert, Heart, Info, ListTodo } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { guests } from "../data/mock";
import { EmptyState } from "../components/ui/EmptyState";

const timelineIcons = {
  info: Info,
  incident: CircleAlert,
  task: ListTodo,
  positive: Heart,
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const guest = guests.find((item) => item.id === id);

  if (!guest) {
    return (
      <div className="center">
        <p>Client introuvable.</p>
        <Link to="/clients">Retour aux clients</Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/clients" className="back-link"><ArrowLeft size={16}/> Clients</Link>

      <section className="client-hero">
        <div className="room large">#{guest.room}</div>
        <div>
          <h1>{guest.firstName} {guest.lastName}</h1>
          <p>{guest.arrival} → {guest.departure}</p>
          <div className="tags">
            {guest.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        </div>
      </section>

      <div className="two-col">
        <section className="panel">
          <div className="panel-title"><h2>Historique</h2></div>
          {guest.timeline?.length ? guest.timeline.map((item) => {
            const Icon = timelineIcons[item.type];
            return (
              <div className="timeline-row" key={item.id}>
                <div className={`timeline-icon ${item.type}`}><Icon size={16}/></div>
                <div>
                  <strong>{item.department} · {item.author}</strong>
                  <p>{item.text}</p>
                  <small>{item.date}</small>
                </div>
              </div>
            );
          }) : <EmptyState text="Aucun élément dans l’historique." />}
        </section>

        <div className="stack">
          <section className="panel">
            <div className="panel-title"><h2>Préférences</h2></div>
            {guest.preferences?.length
              ? guest.preferences.map((item) => <p className="simple-line" key={item}>{item}</p>)
              : <p className="muted">Aucune préférence enregistrée.</p>}
          </section>

          <section className="panel">
            <div className="panel-title"><h2>Notes</h2></div>
            {guest.notes?.length
              ? guest.notes.map((item) => <p className="simple-line" key={item}>{item}</p>)
              : <p className="muted">Aucune note.</p>}
          </section>
        </div>
      </div>
    </>
  );
}
