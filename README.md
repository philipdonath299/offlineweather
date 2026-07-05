# Offline Weather PWA

En modern, snabb och minimalistisk väderapp byggd med React, TypeScript och Vite, med fullt stöd för offline-användning via Service Workers och IndexedDB.

## Funktioner

*   **Offline-först:** Appen sparar väderdata lokalt via IndexedDB. Om du förlorar internetuppkopplingen visas den senast hämtade datan automatiskt.
*   **Minimalistisk design:** Svartvit och ren design med Lucide-ikoner.
*   **Progressive Web App (PWA):** Kan installeras som en app på hemskärmen (fungerar utmärkt i Safari på iOS).
*   **Inget API-nyckelkrav:** Använder Open-Meteo för väderdata och platssökning, vilket är gratis och inte kräver någon API-nyckel.
*   **Snabbt och responsivt:** Optimerad med Vite.

## Förutsättningar

För att köra detta projekt lokalt behöver du [Node.js](https://nodejs.org/) installerat på din dator.

## Installation

1.  Öppna terminalen och navigera till projektmappen.
2.  Installera alla beroenden:
    ```bash
    npm install
    ```
3.  Starta utvecklingsservern:
    ```bash
    npm run dev
    ```
4.  Öppna din webbläsare och gå till `http://localhost:5173`.

## Bygga för produktion

För att skapa en produktionsoptimerad build:

```bash
npm run build
```

Den byggda applikationen kommer att finnas i `dist/`-mappen. För att förhandsgranska den lokalt:

```bash
npm run preview
```

## Teknologi

*   **Vite:** Supersnabb byggverktyg och utvecklingsserver.
*   **React + TypeScript:** Modernt gränssnitt med typsäkerhet.
*   **vite-plugin-pwa:** Genererar Service Worker och hanterar PWA-manifest.
*   **idb:** Lättviktigt bibliotek för att arbeta med IndexedDB (för offline-lagring).
*   **Open-Meteo:** Gratis väder-API.
*   **Lucide React:** Minimalistiska SVG-ikoner.
