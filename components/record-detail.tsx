"use client";

import { useMemo } from "react";

import {
  DiscogsRelease,
  DiscogsReleaseRelations,
  DiscogsSearchResult,
} from "@/types/discogs";

interface RecordDetailProps {
  record: DiscogsSearchResult | null;
  release: DiscogsRelease | null;
  isLoading?: boolean;
  errorMessage?: string;
  relations?: DiscogsReleaseRelations | null;
  relationsLoading?: boolean;
  relationsError?: string;
  onRelationSearch?: (value: string) => void;
}

export function RecordDetail({
  record,
  release,
  isLoading = false,
  errorMessage,
  relations,
  relationsLoading = false,
  relationsError,
  onRelationSearch,
}: RecordDetailProps) {
  const displayTitle = record?.title ?? "Velg en plate";
  const subtitle = useMemo(() => {
    if (!record) return null;
    const parts = [
      release?.artists?.map((artist) => artist.name).join(" & ") ??
        record.label?.[0],
      release?.year ?? record.year,
      record.country,
    ].filter(Boolean);
    return parts.join(" • ");
  }, [record, release]);

  const tracklist = release?.tracklist?.slice(0, 10) ?? [];
  const styles = release?.styles ?? record?.style ?? [];
  const genres = release?.genres ?? record?.genre ?? [];
  const hasRelationsContent = useMemo(() => {
    if (!relations) return false;
    if (relations.master?.versions?.length) return true;
    if (relations.label?.releases?.length) return true;
    if (
      relations.artists?.some((artistGroup) => artistGroup.releases.length > 0)
    ) {
      return true;
    }
    return false;
  }, [relations]);

  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.35em] text-emerald-400/80">
          Fokus
        </span>
        <h2 className="text-2xl font-semibold text-slate-50 leading-snug">
          {displayTitle}
        </h2>
        {subtitle ? (
          <p className="text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </header>

      {isLoading ? (
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 text-sm text-slate-400">
          <SkeletonLine />
          <SkeletonLine width="70%" />
          <SkeletonLine width="50%" />
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {!record && !isLoading ? (
        <p className="text-sm text-slate-500">
          Søk etter noe, eller naviger med piltastene for å se detaljer om en
          release.
        </p>
      ) : null}

      {record && !isLoading ? (
        <>
          {(genres.length > 0 || styles.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 3).map((genre) => (
                <span
                  key={`genre-${genre}`}
                  className="rounded-full border border-emerald-400/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-300"
                >
                  {genre}
                </span>
              ))}
              {styles.slice(0, 5).map((style) => (
                <span
                  key={`style-${style}`}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300"
                >
                  {style}
                </span>
              ))}
            </div>
          )}

          {release?.labels?.length ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                Label
              </h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-200">
                {release.labels.map((label) => (
                  <li key={`${label.id}-${label.name}`}>
                    {label.name}
                    {label.catno ? (
                      <span className="text-slate-500"> · {label.catno}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tracklist.length ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                Tracklist
              </h3>
              <ol className="flex flex-col gap-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 text-sm text-slate-200">
                {tracklist.map((track) => (
                  <li
                    key={`${track.position}-${track.title}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-slate-400">{track.position}</span>
                    <span className="flex-1 text-slate-100">{track.title}</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {track.duration || "—"}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {release?.community?.wantlist ? (
            <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 text-sm text-slate-300">
              <p>
                {Intl.NumberFormat("no-NB").format(
                  release.community.wantlist
                )}{" "}
                brukere har denne på ønskelista,{" "}
                {Intl.NumberFormat("no-NB").format(
                  release.community.have
                )}{" "}
                har den i samlingen.
              </p>
            </section>
          ) : null}

          {(relationsLoading || relationsError || hasRelationsContent) && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                Relasjoner
              </h3>
              {relationsLoading ? (
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
                  <SkeletonLine />
                  <SkeletonLine width="65%" />
                </div>
              ) : null}
              {relationsError ? (
                <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                  {relationsError}
                </p>
              ) : null}

              {!relationsLoading && !relationsError ? (
                <>
                {relations?.master?.versions?.length ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Versjoner
                      </h4>
                      <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                        Master #{relations.master.id}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs text-slate-300">
                      {relations.master.versions.slice(0, 6).map((version) => (
                        <li
                          key={`master-${version.id}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-100">
                              {version.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {[version.year, version.country, version.label]
                                .filter(Boolean)
                                .join(" • ")}
                            </span>
                          </div>
                          <a
                            href={`https://www.discogs.com/release/${version.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-emerald-400/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300 transition hover:bg-emerald-400/10"
                          >
                            Discogs →
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {relations?.label?.releases?.length ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Flere fra labelen
                      </h4>
                      {onRelationSearch ? (
                        <button
                          type="button"
                          onClick={() => onRelationSearch(relations.label!.name)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-300"
                        >
                          Søk label
                        </button>
                      ) : null}
                    </div>
                    <ul className="flex flex-col gap-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs text-slate-300">
                      {relations.label.releases.slice(0, 6).map((item) => (
                        <li
                          key={`label-${item.id}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-100">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {[item.artist, item.year]
                                .filter(Boolean)
                                .join(" • ")}
                            </span>
                          </div>
                          <a
                            href={item.resource_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400 transition hover:border-emerald-400/60 hover:text-emerald-300"
                          >
                            Åpne
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {relations?.artists?.length ? (
                  <div className="flex flex-col gap-3">
                    {relations.artists.map((artistGroup) =>
                      artistGroup.releases.length ? (
                        <div key={`artist-${artistGroup.id}`} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                              {artistGroup.name}
                            </h4>
                            {onRelationSearch ? (
                              <button
                                type="button"
                                onClick={() => onRelationSearch(artistGroup.name)}
                                className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-300"
                              >
                                Søk artist
                              </button>
                            ) : null}
                          </div>
                          <ul className="flex flex-col gap-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs text-slate-300">
                            {artistGroup.releases.slice(0, 5).map((item) => (
                              <li
                                key={`artist-${artistGroup.id}-${item.id}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="text-slate-100">
                                  {item.title}
                                </span>
                                <a
                                  href={item.resource_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400 transition hover:border-emerald-400/60 hover:text-emerald-300"
                                >
                                  Åpne
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null
                    )}
                  </div>
                ) : null}
              </>
            ) : null}
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-4 animate-pulse rounded-full bg-slate-800/70"
      style={{ width }}
    />
  );
}
