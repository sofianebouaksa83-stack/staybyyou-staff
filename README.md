# StayByYou Staff

Prototype frontend complet de la future plateforme Staff reliée à StayByYou.

## Installation

```bash
npm install
npm run dev
```

## Stack

- React
- TypeScript
- Vite
- React Router
- Lucide React
- CSS natif
- Données mockées (pas de Supabase pour l'instant)

## Pages incluses

- Connexion de démonstration
- Aujourd'hui / Dashboard
- Hôtel
- Clients
- Fiche client
- Messages
- Tâches
- Consignes
- Événements
- Recherche globale
- Notifications
- Profil
- Administration
  - Établissement
  - Utilisateurs
  - Services
  - Rôles & permissions

## Architecture

Les pages assemblent des composants et consomment des données mockées structurées comme de futures données Supabase.
Le branchement backend pourra être fait module par module sans réécrire l'interface.
