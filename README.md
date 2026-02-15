# ia-notre-nouvelle-autoroute

Présentation web immersive en une page: **L'IA : Notre Nouvelle Autoroute**.

- Démo en ligne: `https://chab974.github.io/ia-notre-nouvelle-autoroute/`
- Type de projet: site statique (sans backend, sans build local obligatoire)

## 1) Objectif du projet

Ce dépôt contient une présentation pédagogique sur l'IA, pensée comme un storytelling visuel:

- métaphores simples pour expliquer des concepts complexes;
- sections animées pour garder l'attention;
- partie "veille stratégique" avec flux d'actualités;
- message final: l'IA est un outil, l'humain garde la décision.

## 2) Ce que vous trouverez dans ce dépôt

Structure minimale volontaire:

- `index.html`: toute l'application (HTML + CSS + React JSX inline).
- `README.md`: documentation projet.

Le choix "mono-fichier" simplifie la prise en main: pas d'installation, pas de compilation, déploiement direct.

## 3) Stack technique (et pourquoi)

Le site charge ses dépendances depuis des CDN:

- `Tailwind CSS` (style utilitaire rapide),
- `React 18` (structure des composants),
- `Framer Motion` (animations),
- `Lucide React` (icônes),
- `Babel Standalone` (interprétation JSX dans le navigateur).

Avantage: démarrage ultra rapide.
Compromis: dépendance au réseau/CDN au runtime.

## 4) Architecture fonctionnelle de la page

La page est organisée en sections plein écran (`scroll snap`):

1. `Hero`: accroche principale.
2. `Introduction`: métaphore de la "voiture à conduire".
3. `HistoryTimeline`: repères historiques de l'IA.
4. `Metaphors`: explications pédagogiques.
5. `Risks`: limites et risques (hallucinations, biais, deepfakes).
6. `SafetyBelt`: bonnes pratiques de sécurité.
7. `Prompting`: comparaison prompt vague vs contextualisé.
8. `HumanVsAI`: répartition des rôles humain/machine.
9. `DynamicNewsSection`: actualités "live" + fallback.
10. `Consumption`: enjeux énergie/géopolitique.
11. `Conclusion`: synthèse et call-to-action.

Composants transverses:

- `ProgressBar`: barre de progression de scroll.
- `Section` et `Card`: primitives UI réutilisables.

## 5) Focus: section actualités dynamiques

Le bloc `DynamicNewsSection` fonctionne en 2 niveaux:

1. Tentative de récupération d'articles via flux Google News (RSS converti en JSON).
2. En cas d'échec, bascule automatique vers un jeu de données local (`fallbackNews`).

Résultat: la section reste toujours utilisable, même si l'API externe est indisponible.

## 6) Lancer le projet en local

### Option A (rapide)

Ouvrir `index.html` dans le navigateur.

### Option B (recommandée)

Servir le dossier en HTTP local pour reproduire un comportement proche de la prod:

```bash
cd /Users/chab/Documents/AI-SANDBOX/GITHUB/IA-PPT
python3 -m http.server 8080
```

Puis ouvrir:

- `http://localhost:8080`

## 7) Déploiement GitHub Pages

Le site est publié depuis:

- branche: `main`
- dossier source: `/` (racine du repo)

URL finale:

- `https://chab974.github.io/ia-notre-nouvelle-autoroute/`

## 8) Modifier le contenu facilement

Tout se fait dans `index.html`.

Exemples courants:

- changer le titre global: balise `<title>` + section `Hero`;
- modifier les sections: composants `Hero`, `Introduction`, etc.;
- ajuster les actus de secours: tableau `fallbackNews`;
- changer les couleurs/ambiance: classes Tailwind + bloc `<style>`.

## 9) Dépannage rapide

- Page blanche:
  - vérifier la connexion internet (CDN requis),
  - ouvrir la console navigateur (erreurs JS éventuelles).
- Les actus live ne s'affichent pas:
  - comportement attendu possible, le fallback prend le relais.
- Le style semble "cassé":
  - vérifier que `https://cdn.tailwindcss.com` est accessible.

## 10) Limites connues

- Dépendance aux CDN (pas de mode offline complet).
- Runtime côté client uniquement (pas de cache serveur des news).
- Architecture mono-fichier: simple, mais moins modulaire pour très gros projets.

## 11) Évolutions possibles

- passer vers une structure modulaire (`src/`, bundler Vite);
- ajouter i18n (FR/EN);
- ajouter tests visuels et linting;
- ajouter un backend léger pour sécuriser/fiabiliser l'agrégation d'actualités.
