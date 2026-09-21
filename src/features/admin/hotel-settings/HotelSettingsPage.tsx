import {
  RefreshCw,
} from "lucide-react";

import {
  useApp,
} from "../../../app/AppContext";

import {
  useHotelPermission,
} from "../../permissions/hooks/useHotelPermission";

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
    allowed:
      canViewSettings,

    loading:
      loadingViewPermission,
  } = useHotelPermission(
    hotelId,
    "settings.view"
  );


  const {
    allowed:
      canEditSettings,

    loading:
      loadingEditPermission,
  } = useHotelPermission(
    hotelId,
    "settings.edit"
  );


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
    if (
      !canEditSettings
    ) {
      return;
    }


    await save(
      input
    );


    await reloadAuth();
  }


  const loadingPermissions =
    loadingViewPermission ||
    loadingEditPermission;


  return (
    <SettingsShell
      sectionLabel="Administration"

      sectionTitle="Établissement"

      sectionSubtitle="Informations générales et configuration de l’établissement."
    >
      {loadingPermissions ? (
        <div className="hotel-settings-state">
          Vérification des permissions…
        </div>
      ) : !canViewSettings ? (
        <div className="hotel-settings-state">
          Vous n’avez pas accès aux paramètres de l’établissement.
        </div>
      ) : (
        <>
          <div className="hotel-settings-toolbar">
            <span>
              Configuration générale
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

                canEdit={
                  canEditSettings
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
              Impossible de charger l'établissement.
            </div>
          )}
        </>
      )}
    </SettingsShell>
  );
}