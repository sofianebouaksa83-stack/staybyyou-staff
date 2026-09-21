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
- Données persistées dans Supabase

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

- Les fonctionnalités principales utilisent les données réelles de l'hôtel avec contrôle d'accès par permissions et RLS.
- Le branchement backend pourra être fait module par module sans réécrire l'interface.
