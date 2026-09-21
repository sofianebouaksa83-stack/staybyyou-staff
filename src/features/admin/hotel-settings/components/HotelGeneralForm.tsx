import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Building2,
  Check,
  Clock3,
  Languages,
} from "lucide-react";

import type {
  HotelSettings,
  UpdateHotelSettingsInput,
} from "../types/hotel-settings.types";

import {
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../utils/hotel-settings.utils";


type HotelGeneralFormProps = {
  settings:
    HotelSettings;

  saving:
    boolean;

  canEdit:
    boolean;

  onSave: (
    input:
      UpdateHotelSettingsInput
  ) => Promise<void>;
};


export function HotelGeneralForm({
  settings,
  saving,
  canEdit,
  onSave,
}: HotelGeneralFormProps) {
  const [
    name,
    setName,
  ] =
    useState("");


  const [
    timezone,
    setTimezone,
  ] =
    useState(
      "Europe/Paris"
    );


  const [
    languages,
    setLanguages,
  ] =
    useState<
      string[]
    >([]);


  const [
    localError,
    setLocalError,
  ] =
    useState<
      string | null
    >(null);


  useEffect(() => {
    setName(
      settings.name
    );

    setTimezone(
      settings.timezone
    );

    setLanguages(
      settings.supportedLanguages
    );

    setLocalError(
      null
    );
  }, [
    settings,
  ]);


  const hasChanges =
    name.trim() !==
      settings.name.trim() ||
    timezone !==
      settings.timezone ||
    JSON.stringify(
      [
        ...languages,
      ].sort()
    ) !==
      JSON.stringify(
        [
          ...settings.supportedLanguages,
        ].sort()
      );


  function toggleLanguage(
    language:
      string
  ) {
    if (
      !canEdit
    ) {
      return;
    }


    setLanguages(
      (
        current
      ) => {
        if (
          current.includes(
            language
          )
        ) {
          return current.filter(
            (
              item
            ) =>
              item !==
              language
          );
        }


        return [
          ...current,
          language,
        ];
      }
    );
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (
      !canEdit
    ) {
      return;
    }


    if (
      !name.trim()
    ) {
      setLocalError(
        "Le nom de l'établissement est obligatoire."
      );

      return;
    }


    if (
      languages.length ===
      0
    ) {
      setLocalError(
        "Sélectionne au moins une langue."
      );

      return;
    }


    setLocalError(
      null
    );


    await onSave({
      name,

      timezone,

      supportedLanguages:
        languages,
    });
  }


  return (
    <form
      className="hotel-settings-card"

      onSubmit={
        handleSubmit
      }
    >
      <div className="hotel-settings-card-header">
        <span className="hotel-settings-card-icon">
          <Building2
            size={18}
          />
        </span>

        <div>
          <h3>
            Informations générales
          </h3>

          <p>
            Informations principales de l'établissement.
          </p>
        </div>
      </div>


      <div className="hotel-settings-fields">
        <label className="hotel-settings-field">
          <span>
            Nom de l'établissement
          </span>

          <div className="hotel-settings-input-wrap">
            <Building2
              size={16}
            />

            <input
              type="text"

              value={
                name
              }

              onChange={(
                event
              ) =>
                setName(
                  event.target.value
                )
              }

              disabled={
                saving ||
                !canEdit
              }
            />
          </div>
        </label>


        <label className="hotel-settings-field">
          <span>
            Fuseau horaire
          </span>

          <div className="hotel-settings-input-wrap">
            <Clock3
              size={16}
            />

            <select
              value={
                timezone
              }

              onChange={(
                event
              ) =>
                setTimezone(
                  event.target.value
                )
              }

              disabled={
                saving ||
                !canEdit
              }
            >
              {TIMEZONE_OPTIONS.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option.value
                    }

                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </label>
      </div>


      <div className="hotel-settings-languages">
        <div className="hotel-settings-languages-title">
          <Languages
            size={17}
          />

          <div>
            <strong>
              Langues disponibles
            </strong>

            <span>
              Langues proposées aux clients de l'établissement.
            </span>
          </div>
        </div>


        <div className="hotel-settings-language-grid">
          {LANGUAGE_OPTIONS.map(
            (
              language
            ) => {
              const selected =
                languages.includes(
                  language.value
                );


              return (
                <button
                  key={
                    language.value
                  }

                  type="button"

                  className={
                    selected
                      ? "hotel-settings-language hotel-settings-language--active"
                      : "hotel-settings-language"
                  }

                  onClick={() =>
                    toggleLanguage(
                      language.value
                    )
                  }

                  disabled={
                    saving ||
                    !canEdit
                  }
                >
                  {selected && (
                    <Check
                      size={14}
                    />
                  )}

                  {
                    language.label
                  }
                </button>
              );
            }
          )}
        </div>
      </div>


      {localError && (
        <div className="hotel-settings-feedback hotel-settings-feedback--error">
          {localError}
        </div>
      )}


      {!canEdit && (
        <div className="hotel-settings-note">
          Vous pouvez consulter ces réglages, mais vous n’avez pas l’autorisation de les modifier.
        </div>
      )}


      {canEdit && (
        <div className="hotel-settings-form-actions">
          <button
            type="submit"

            className="hotel-settings-primary-button"

            disabled={
              saving ||
              !hasChanges
            }
          >
            {saving
              ? "Enregistrement…"
              : "Enregistrer les modifications"}
          </button>
        </div>
      )}
    </form>
  );
}