import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="center">
      <h1>404</h1>
      <p>Cette page n’existe pas.</p>
      <Link to="/">Retour à l’accueil</Link>
    </div>
  );
}
