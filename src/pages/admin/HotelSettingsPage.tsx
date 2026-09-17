import { PageHeader } from "../../components/ui/PageHeader";

export default function HotelSettingsPage() {
  return (
    <>
      <PageHeader title="Établissement" subtitle="Informations générales et préférences." />
      <div className="settings-grid">
        <section className="panel">
          <div className="panel-title"><h2>Informations</h2></div>
          <label className="field">Nom<input value="Château de Berne" readOnly /></label>
          <label className="field">Fuseau horaire<input value="Europe/Paris" readOnly /></label>
          <label className="field">Langue<input value="Français" readOnly /></label>
        </section>

        <section className="panel">
          <div className="panel-title"><h2>Interface</h2></div>
          <label className="toggle-row"><span>Dashboard personnalisable</span><input type="checkbox" defaultChecked /></label>
          <label className="toggle-row"><span>Notifications importantes</span><input type="checkbox" defaultChecked /></label>
          <label className="toggle-row"><span>Mode PWA</span><input type="checkbox" defaultChecked /></label>
        </section>
      </div>
    </>
  );
}
