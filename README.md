## WarpDig MVP

WarpDig er det intuitive laget over Discogs. Fokus for v1 er en prototype som gjør
én ting ekstremt bra: søk og bla i katalogen med relasjonell navigasjon og flyt.

Prosjektet er et Next.js 15 / React 19-oppsett (App Router, Turbopack) med
serverless API-ruter som proxyer Discogs-databasen. MVP-en leverer:
- keyboard-grid for søk og navigasjon
- detaljpanel med release-info, tracklist, YouTube-preview og relasjonsnoder (master/label/artist)
- tastatursnarveier (`Shift+←/→`) for å bla mellom forhåndslytter
- in-memory cache for søk/detaljer og forhåndsgenerert forskningsgrunnlag

### Kom i gang

```bash
npm install
npm run dev
```

Applikasjonen kjøres på `http://localhost:3000`.

### Miljøvariabler

Lag en `.env.local` basert på `.env.example`:

```
DISCOGS_TOKEN=your_token
DISCOGS_USER_AGENT=WarpDig/0.1 (+https://warpdig.github.io)
```

`DISCOGS_TOKEN` er påkrevd for stabile API-kall. `DISCOGS_USER_AGENT` kan stå på
default verdien hvis du ikke trenger en annen identifikator.

### Struktur

- `app/` – Next.js App Router (layout, hovedside, API-routes).
- `components/` – søkeopplevelse (SearchShell, SearchBar, RecordCard, RecordDetail).
- `lib/` – Discogs-klient, cache-håndtering og hjelpefunksjoner.
- `types/` – TypeScript-typer for Discogs-responser.
- `research/` – innsiktsgrunnlag (painpoints-tabell, refleksjoner, relasjons- og preview-planer).

### Videre arbeid

**Nær horisont**

- Relasjonell graf for artist ↔ label ↔ relasjoner + anbefalinger.
- Forsterk cache-laget (i dag in-memory) med varig lagring (SQLite/edge) og eksplisitt rate-limit.
- Utvid preview-modulen (Spotify fallback, play/pause hotkeys) etter brukertest.
- Planlegg Make-webhook for tilgjengelighetsvarsler.
- Availability-alert eksempel: “Oscar, en sang du spiller ofte på Spotify er nå tilgjengelig på Discogs hos en selger som har 10 plater på ønskelisten din, med gode rabatter og frakt til Bergen.” Dette er rettesnoren for automasjonsløpet (Spotify signal → Make webhook → WarpDig alert).

**Videre i løpet**

- Label Deep Dive: én klikk gir curated feed for et label (ettertraktede presser, reissues, hidden gems).
- Seller Merge: foreslår beste selgerkombinasjon når ønskelisten oppdateres for å minimere frakt.
- DJ Set Crafter: kombinerer platesamling + wishlist til ferdig sett (In Collection / Wishlist Candidates / Swap Suggestions) med automatisk Spotify/YouTube-playlist.
- Mood Digging: bruker Spotify-lytteen + metadata til å foreslå sett/ crate (“Sunday Soul”, “Bergen club”).
- Auto Crate Builder: budsjettstyrt kuratering inklusive forslag til salg/bytte for å finansiere kjøp.
