# WarpDig – Relasjonsnavigasjon MVP

Basert på smertepunktene samlet fra Discogs-forum/Reddit (`warpdig_discogs_painpoints.*`) peker flere klager direkte mot mangel på god relasjonsnavigasjon:

- **“Kan ikke se alle versjoner av en release”** → brukere mister oversikten over pressinger og utgaver.
- **“For mange duplikater av samme release” / “Multiple entries of same release”** → databasen oppleves støyende uten konsolidering.
- **“Reviews begraves under reissues”** → informasjonen som faktisk beskriver musikken drukner i pressing-detailjer.
- **“Filtrering på format/land fungerer ikke”** → relasjonslogikken (label ↔ pressing ↔ selger) gir ingen mening når filtrene feiler.

## MVP-mål for relasjonsvisning
1. **Oversikt**: Vis koblinger mellom release ↔ master ↔ label ↔ artister i ett blikk.
2. **Navigasjon**: Tillat piltaster eller hotkeys for å hoppe mellom relasjoner uten å miste kontekst.
3. **Duplikatkontroll**: Samle pressinger/versjoner under et “tree” slik at samme release ikke dukker opp 20 ganger.
4. **Forhåndsvalg**: Vis “flere fra denne labelen / artisten” som ett klikks valg, uten å tape søkeresultatlisten.

## Datapunkter vi kan hente fra Discogs API
- `release.master_id`: Gir tilgang til `masters/{id}` for å hente `versions` (alle pressinger).
- `release.labels`: Navn/id, kan brukes for `labels/{id}/releases`.
- `release.artists`: Navn/id, kan brukes for `artists/{id}/releases`.

## Foreslått MVP-komponent
`RelationPanel` (klientkomponent) som vises i detaljkolonnen:

| Seksjon | Innhold | Handling |
|---------|---------|----------|
| **Master tree** | Liste over versjoner (år, format, land) | Klikk for å åpne release i nytt søk |
| **Label stream** | De 3 nyeste/cooleste release fra samme label | Klikk for å åpne i hovedgrid |
| **Artist cross-links** | Andre release-artister dukker opp i | Klikk for å vise nye treff |

## API-behov
- `GET /api/releases/[id]/relations` (server-route) som:
  1. Henter release (vi har allerede).
  2. Hvis `master_id`, henter `masters/{id}` med versjoner.
  3. Henter `labels/{id}/releases` (begrens til få).
  4. Henter `artists/{id}/releases` (begrens til få).

Resultatet caches (in-memory nå, senere SQLite) for å unngå rate-limit.

## Open spørsmål
- Hvor mange relasjonskall per release tåler vi før rate-limits? (må testes).
- Hvordan sortere versjoner (år, land, pris?) – vi starter med år + format.
- Skal klikks på relasjoner trigge nytt søk i samme grid eller åpne i ny kolonne? (MVP: trigge nytt søk, men bevar forrige resultat i state).
