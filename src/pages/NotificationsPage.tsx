import { PageHeader } from "../components/ui/PageHeader";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" subtitle="Uniquement ce qui mérite réellement votre attention." />
      <div className="panel">
        <div className="notification">
          <b>Nouvelle tâche assignée</b>
          <p>Attention anniversaire · Chambre 14</p>
          <small>Il y a 12 min</small>
        </div>
        <div className="notification">
          <b>@Réception vous a mentionné</b>
          <p>Dans #Cuisine</p>
          <small>Il y a 26 min</small>
        </div>
        <div className="notification">
          <b>Consigne importante</b>
          <p>Chambre froide pâtisserie hors service.</p>
          <small>Il y a 1 h</small>
        </div>
      </div>
    </>
  );
}
