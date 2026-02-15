# Vivre avec ChatGPT - Plateforme de formation progressive

Application Next.js + Supabase qui lit les modules depuis les fichiers `.md` du dossier racine.

## Fonctionnalites

- Connexion Google via Supabase Auth
- Dashboard de progression (`locked`, `unlocked`, `passed`)
- Lecture des modules markdown
- Quiz obligatoire par module (seuil 80%)
- Deblocage lineaire strict du module suivant
- Historique des tentatives en base Supabase

## Prerequis

- Node.js 20+
- Projet Supabase
- Projet Vercel (ou execution locale)

## Installation

1. Copier les variables d'environnement:

```bash
cp .env.example .env.local
```

2. Installer les dependances:

```bash
npm install
```

3. Executer la migration SQL `supabase/migrations/001_init.sql` dans Supabase SQL Editor.

4. Configurer l'auth Google dans Supabase:
- `Authentication -> Providers -> Google -> Enable`
- Redirect URL locale: `http://localhost:3000/auth/callback`
- Redirect URL prod: `https://<votre-domaine>/auth/callback`

5. Lancer en local:

```bash
npm run dev
```

## Deploiement Vercel

1. Connecter le repo sur Vercel.
2. Ajouter les variables d'env:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (URL publique Vercel)
3. Redefinir la redirect OAuth Google vers `https://<votre-app-vercel>/auth/callback`.

## Tests

```bash
npm run test
```

Tests inclus:
- extraction/tri des prefixes de modules (`0`, `06`, `21`)
- validation frontmatter markdown
- scoring du quiz
- regles de deblocage lineaire
