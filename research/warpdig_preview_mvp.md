# WarpDig – Preview MVP

## Brukersmerte
- Reddit (r/vinyl, r/discogs) klager over manglende forhåndslytting og at YouTube-embeddene ligger for langt ned eller feiler.
- User story: “Jeg vil høre et utdrag av releasen uten å scrolle eller åpne flere faner.”

## Mål
1. **Direkte preview** i fokus-panelet: første tilgjengelige video (YouTube) fra Discogs skal starte automatisk når man bytter release.
2. **Tastatursnarveier**: `Shift+→` / `Shift+←` for å hoppe mellom tilgjengelige previews, og `Enter` for å åpne i ny fane.
3. **Fallback**: Hvis ingen video, vis tydelig beskjed og snarvei til Discogs-siden.

## Datakilde
- `release.videos` fra Discogs `/releases/{id}` inneholder liste med `uri`, `title`, `description`, `duration`, `embed`.

## Implementasjonsplan
1. Utvide `DiscogsRelease`-typene med `videos`.
2. Legge til `PreviewPlayer`-seksjon i `RecordDetail`.
3. Håndtere tastatursnarveier i `SearchShell`.
4. Parse YouTube-ID (`watch?v=...` eller `youtu.be/...`) for å støtte embed.
5. Oppdatere README og backlog.

## Senere forbedringer
- Støtte Spotify-embed (krever track-ID eller ekstern søk).
- Hotkeys for play/pause (gjennom YouTube IFrame API).
- Offline caching av preview-lenker.
