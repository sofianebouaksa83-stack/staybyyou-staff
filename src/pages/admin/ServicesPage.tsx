import { SettingsShell } from "../SettingsShell";

const services = [
  "Réception",
  "Cuisine",
  "Housekeeping",
  "Maintenance",
  "Restaurant",
  "Room Service",
  "Spa",
  "Direction",
];

export default function ServicesPage() {
  return (
    <SettingsShell
      sectionLabel="Administration"
      sectionTitle="Services"
      sectionSubtitle="Organisation des équipes de l’établissement."
    >
      <div className="service-grid">
        {services.map((service, index) => (
          <article className="service-card" key={service}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{service}</h3>
            <p>Configuration prête pour le futur branchement Supabase.</p>
          </article>
        ))}
      </div>
    </SettingsShell>
  );
}
