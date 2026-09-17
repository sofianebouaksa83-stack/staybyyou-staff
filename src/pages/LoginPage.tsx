import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { useApp } from "../app/AppContext";

function loginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }

  if (message.toLowerCase().includes("email not confirmed")) {
    return "Votre adresse e-mail doit être confirmée avant la connexion.";
  }

  if (message.toLowerCase().includes("failed to fetch")) {
    return "Connexion au serveur impossible. Vérifiez votre réseau.";
  }

  return message || "La connexion a échoué. Réessayez.";
}

export default function LoginPage() {
  const { signIn, signOut, session, authError, authLoading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setFormError(loginErrorMessage(error));
    }
  }

  async function handleResetSession() {
    setFormError(null);

    try {
      await signOut();
    } catch (error) {
      setFormError(loginErrorMessage(error));
    }
  }

  const visibleError = formError ?? authError;

  return (
    <main className="login-page">
      <section className="login-brand">
  <img
    src="/logo_StayByYou/staybyyou_blanc_slogan_sansfond.png"
    alt="StayByYou"
    className="login-brand-logo"
  />
</section>

      <section className="login-card">
        <span className="eyebrow">ESPACE ÉQUIPE</span>
        <h1>Bienvenue</h1>
        <p>
          Connectez-vous pour accéder à votre journée, vos messages et vos
          tâches.
        </p>

        <form onSubmit={handleSubmit} aria-busy={authLoading}>
          <label>
            Adresse e-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              autoFocus
              required
              disabled={authLoading}
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={authLoading}
            />
          </label>

          {visibleError && (
            <p className="login-error" role="alert">
              {loginErrorMessage(visibleError)}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={authLoading || !email.trim() || !password}
          >
            {authLoading ? (
              <>
                Connexion… <LoaderCircle size={17} aria-hidden="true" />
              </>
            ) : (
              <>
                Se connecter <ArrowRight size={17} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {session && authError && !authLoading ? (
          <button
            className="primary-button"
            type="button"
            onClick={handleResetSession}
          >
            Se déconnecter et réessayer
          </button>
        ) : null}

        <small>Utilisez votre compte StayByYou Staff.</small>
      </section>
    </main>
  );
}
