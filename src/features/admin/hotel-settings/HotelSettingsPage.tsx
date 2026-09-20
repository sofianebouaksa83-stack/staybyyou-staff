import {
  RefreshCw,
} from "lucide-react";

import {
  useApp,
} from "../../../app/AppContext";

import {
  SettingsShell,
} from "../../../pages/SettingsShell";

import {
  HotelGeneralForm,
} from "./components/HotelGeneralForm";

import {
  HotelStatusCard,
} from "./components/HotelStatusCard";

import {
  useHotelSettings,
} from "./hooks/useHotelSettings";

export default function HotelSettingsPage() {
  const {
    hotelId,
    session,
    reloadAuth,
  } = useApp();

  const {
    settings,
    loading,
    saving,
    error,
    success,
    refresh,
    save,
  } = useHotelSettings(
    hotelId,
    session?.user.id
  );

  async function handleSave(
    input: Parameters<
      typeof save
    >[0]
  ) {
    await save(input);

    // Le nom de l'hôtel est aussi
    // affiché dans la navbar/profil.
    await reloadAuth();
  }

  return (
    <SettingsShell
      sectionLabel="Administration"
      sectionTitle="Établissement"
      sectionSubtitle="Informations générales et configuration de l’établissement."
    >
      <div className="hotel-settings-toolbar">
        <span>
          Configuration
          générale
        </span>

        <button
          type="button"
          className="hotel-settings-refresh-button"
          onClick={() =>
            void refresh()
          }
          disabled={
            loading ||
            saving
          }
          title="Actualiser"
        >
          <RefreshCw
            size={16}
          />
        </button>
      </div>

      {error && (
        <div
          className="hotel-settings-feedback hotel-settings-feedback--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="hotel-settings-feedback hotel-settings-feedback--success"
          role="status"
        >
          {success}
        </div>
      )}

      {loading ? (
        <div className="hotel-settings-state">
          Chargement…
        </div>
      ) : settings ? (
        <div className="hotel-settings-grid">
          <HotelGeneralForm
            settings={
              settings
            }
            saving={
              saving
            }
            onSave={
              handleSave
            }
          />

          <HotelStatusCard
            settings={
              settings
            }
          />
        </div>
      ) : (
        <div className="hotel-settings-state">
          Impossible de charger
          l'établissement.
        </div>
      )}
    </SettingsShell>
  );
}