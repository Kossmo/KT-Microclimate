# Projet : Microclimate

*(Carte des microclimats)*

## Concept
Expérience web de visualisation météo interactive. L'utilisateur explore une carte mondiale et clique n'importe où pour voir une prévision 7 jours. Trois vues : Explore (carte), Compare (2-6 villes côte à côte), Comfort (grille de villes triées par score de confort). Objectif : rendre la météo sensorielle et comparative, pas juste informative.

## Stack technique
- **Framework** : Angular (standalone components, signals, OnPush, inject())
- **Carte** : MapLibre GL JS (tiles CartoDB Positron, pas de clé API)
- **Animations** : SVG inline + CSS @keyframes pour les icônes météo (9 types)
- **Graphiques** : SVG custom (courbe Catmull-Rom pour température, barres pour précipitations)
- **Style** : SCSS avec palette organique/nature (sage green, earthy browns, soft blues)
- **Typographie** : Inter (body) + Playfair Display (titres)
- **Pas de backend** — tout côté client

## API
**Open-Meteo** — aucune clé API, pas de limite stricte (usage raisonnable).

Endpoints utilisés :
- Forecast : `https://api.open-meteo.com/v1/forecast` (7j standard, 16j étendu avec humidité + UV)
- Géocodage : `https://geocoding-api.open-meteo.com/v1/search`

Endpoints disponibles (non encore utilisés) :
- Historique : `https://archive-api.open-meteo.com/v1/archive` (depuis 1940)
- Qualité air : `https://air-quality-api.open-meteo.com/v1/air-quality`

Paramètres utiles : `latitude`, `longitude`, `hourly`, `daily`, `current`, `past_days`, `forecast_days` (jusqu'à 16), `timezone=auto`.

## Architecture

### Routes (lazy-loaded, layout parent AppShellComponent)
- `/` — Explore : carte MapLibre plein écran + panneau latéral forecast
- `/compare` — Compare : grille de cards (max 6 villes, 2-3 par ligne)
- `/comfort` — Comfort : grille de cards avec score de confort (20 villes prédéfinies + ajout custom)

### Structure
```
src/app/
  core/
    models/          # weather.model, location.model, wmo-codes, comparator.model, comfort.model
    services/        # weather, geocoding, cache, timeline-state, comparator-state, comfort
  features/
    map/             # MapComponent (carte + marqueur + forecast panel)
    forecast-panel/  # ForecastPanelComponent + DailyCardComponent
    comparator/      # ComparatorComponent + CityColumnComponent (layout card)
    comfort-grid/    # ComfortGridComponent + ComfortCardComponent (arc SVG score)
  shared/
    components/
      weather-icon/         # 9 icônes SVG animées
      temperature-chart/    # Courbe Catmull-Rom cliquable
      precipitation-chart/  # Barres cliquables par jour (utilisé dans Explore, pas dans Compare)
      search-bar/           # Geocoding avec mode inline (input [inline])
      timeline-slider/      # Range input (non utilisé dans Explore, disponible)
  layout/
    app-shell.component     # Nav flottante (3 onglets) + router-outlet
```

### Services (providedIn: root, signal-based)
- **WeatherService** : `getForecast()` (7j) + `getExtendedForecast()` (16j + humidité + UV), cache intégré
- **GeocodingService** : `search()` avec cache 5min
- **TimelineStateService** : `selectedHourIndex` signal, synchronise panneau + marqueur carte
- **ComparatorStateService** : `cities` signal, addCity/removeCity, max 6, dedup par lat/lon
- **ComfortService** : 20 villes prédéfinies, `calculateScore()` (temp 40% + humidité 25% + vent 20% + UV 15%)

### Patterns notables
- `SearchBarComponent` a un input `[inline]` : `false` = position absolute (flottant sur la carte), `true` = position relative (dans le flux, pour Compare/Comfort)
- Les graphiques émettent `(hourSelected)` / `(daySelected)` au clic — pas de slider dans Explore
- La page Comfort highlight la dernière ville ajoutée (fond vert pâle + bordure) jusqu'au prochain ajout
- Rate limiting : comfort grid charge 20 villes par batches de 5 (`mergeMap` concurrent)
- `html, body` n'a PAS `overflow: hidden` — seul `.map-wrapper` le fait (sinon Compare/Comfort ne scrollent pas)

## Fonctionnalités implémentées

### MVP (fait)
- Carte cliquable → prévision 7 jours au point cliqué
- Panneau latéral avec graphiques température (courbe lisse) + précipitations (barres)
- Icônes météo animées selon `weather_code` (WMO)
- Barre de recherche geocoding
- Clic sur les graphiques pour voir le détail horaire

### V2 (fait)
- Comparateur : 2-6 villes en cards (grille responsive max 2-3 par ligne), recherche + ajout depuis la carte
- Score de confort : 20 villes prédéfinies + ajout custom, tri par score, animation shimmer à l'ajout
- Navigation 3 onglets (Explore / Compare / Comfort) avec badge compteur

### V3 (fait)
- **Icône lune** : croissant SVG correct (deux arcs de rayon R avec sweep opposés pour créer la concavité) — les cercles identiques (clear night + partly-cloudy night) utilisaient avant `fill-rule="evenodd"` qui rendait une forme lentille/MasterCard
- **Direction du vent** : le panneau horaire (mode "Wind") affiche une flèche SVG rotative liée à `wind_direction_10m` au lieu d'une icône statique. Champ ajouté dans `HourlyData`, `Forecast`, `WeatherService` (paramètre API `wind_direction_10m`)
- **Scroll horaire à 8h** : l'ouverture d'un jour dans le panneau positionne le strip à `dragOffset = -8 * 80px` (08h visible), les utilisateurs peuvent faire glisser vers 00h
- **Redesign Compare** : cards avec hiérarchie visuelle claire (ville 1.35rem, temp 2.6rem, stats inline), graphique température uniquement (precipitation chart supprimé des cards), strip 7 jours plus lisible, responsive mobile — grille `minmax(min(340px, 100%), 1fr)`, graphiques masqués sur mobile (<768px)

### V4 — idées futures
- **Time machine** : "Quel temps faisait-il le jour de ta naissance ?" (archive API)
- **Sonification** : Tone.js (pluie = bruit filtré, vent = souffle, température = hauteur de note)
- **Mode "voyage"** : parcours animé entre villes, météo qui se transforme progressivement

## Points d'attention
- Cache existant (TTL) protège les re-chargements — pas de requêtes inutiles
- Les `weather_code` suivent WMO — mapping dans `wmo-codes.ts` (28 codes → icône + description + couleur)
- `timezone=auto` pour les heures locales au lieu demandé
- Accessibilité : semantic HTML, aria-labels sur les graphiques SVG, navigation clavier
- Le marqueur MapLibre ne doit PAS avoir `transition: transform` sur le div container (conflit avec le positionnement interne de MapLibre) — la transition est sur le SVG enfant
- SVG croissant de lune : les deux arcs doivent avoir des `sweep` opposés (1er arc `sweep=0`, 2nd arc `sweep=1`) — si les deux ont le même sweep, SVG choisit le même cercle sous-jacent et trace un cercle complet
- `PrecipitationChartComponent` n'est PAS importé dans `CityColumnComponent` (Compare) — seulement dans le panneau forecast (Explore)

## Déploiement
- Dockerfile : `node:22-alpine` (build) → `nginx:alpine` (serve)
- nginx.conf : SPA `try_files`, gzip, cache 1y sur assets

## Ressources
- Doc API : https://open-meteo.com/en/docs
- Codes WMO : https://open-meteo.com/en/docs#weathervariables
- MapLibre : https://maplibre.org/maplibre-gl-js/docs/
