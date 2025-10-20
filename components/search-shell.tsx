"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SearchBar } from "@/components/search-bar";
import { RecordCard } from "@/components/record-card";
import { RecordDetail } from "@/components/record-detail";
import {
  DiscogsRelease,
  DiscogsReleaseRelations,
  DiscogsSearchPagination,
  DiscogsSearchResult,
} from "@/types/discogs";

const PER_PAGE = 24;
const INITIAL_QUERY = "detroit techno";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success" };

type DetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string };

export function SearchShell() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [activeQuery, setActiveQuery] = useState(INITIAL_QUERY);
  const [results, setResults] = useState<DiscogsSearchResult[]>([]);
  const [pagination, setPagination] = useState<DiscogsSearchPagination | null>(
    null
  );
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const [page, setPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState(4);
  const [detailState, setDetailState] = useState<DetailState>({
    status: "idle",
  });
  const [selectedRelease, setSelectedRelease] = useState<DiscogsRelease | null>(
    null
  );
  const [relationsState, setRelationsState] = useState<DetailState>({
    status: "idle",
  });
  const [relations, setRelations] = useState<DiscogsReleaseRelations | null>(
    null
  );

  const controllerRef = useRef<AbortController | null>(null);
  const detailControllerRef = useRef<AbortController | null>(null);
  const relationsControllerRef = useRef<AbortController | null>(null);

  const hasMore = useMemo(() => {
    if (!pagination) return false;
    return pagination.page < pagination.pages;
  }, [pagination]);

  const computeColumns = useCallback(() => {
    if (typeof window === "undefined") {
      return 4;
    }
    const width = window.innerWidth;
    if (width >= 1440) return 5;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
  }, []);

  useEffect(() => {
    setColumns(computeColumns());
    const handleResize = () => setColumns(computeColumns());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computeColumns]);

  const focusRecord = useCallback((index: number) => {
    const selector = `[data-record-index="${index}"]`;
    const node = document.querySelector<HTMLElement>(selector);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.focus({ preventScroll: true });
    }
  }, []);

  const performSearch = useCallback(
    async (targetQuery: string, nextPage: number, append = false) => {
      const trimmedQuery = targetQuery.trim();
      if (!trimmedQuery) {
        controllerRef.current?.abort();
        setResults([]);
        setPagination(null);
        setActiveQuery("");
        setFetchState({ status: "idle" });
        setSelectedIndex(null);
        setSelectedRelease(null);
        setDetailState({ status: "idle" });
        setRelations(null);
        setRelationsState({ status: "idle" });
        return;
      }

      if (!append) {
        setSelectedIndex(null);
        setSelectedRelease(null);
        setDetailState({ status: "idle" });
        setRelations(null);
        setRelationsState({ status: "idle" });
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setFetchState({ status: "loading" });
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(
            trimmedQuery
          )}&page=${nextPage}&per_page=${PER_PAGE}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as {
          pagination: DiscogsSearchPagination;
          results: DiscogsSearchResult[];
        };

        setPagination(data.pagination);
        setPage(data.pagination.page);

        if (append) {
          setResults((prev) => [...prev, ...data.results]);
        } else {
          setResults(data.results);
          setSelectedIndex(data.results.length > 0 ? 0 : null);
        }

        setFetchState({ status: "success" });
        setActiveQuery(trimmedQuery);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("[search]", error);
        setFetchState({
          status: "error",
          message: "Klarte ikke hente data fra Discogs.",
        });
      }
    },
    []
  );

  const handleSubmit = useCallback(() => {
    setPage(1);
    void performSearch(query, 1, false);
  }, [performSearch, query]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || fetchState.status === "loading") {
      return;
    }
    const nextPage = page + 1;
    void performSearch(activeQuery, nextPage, true);
  }, [activeQuery, fetchState.status, hasMore, page, performSearch]);

  const handleRelationSearch = useCallback(
    (value: string) => {
      if (!value.trim()) return;
      setQuery(value);
      setPage(1);
      void performSearch(value, 1, false);
    },
    [performSearch]
  );

  useEffect(() => {
    void performSearch(INITIAL_QUERY, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRecord = useMemo(() => {
    if (selectedIndex === null) return null;
    return results[selectedIndex] ?? null;
  }, [results, selectedIndex]);

  useEffect(() => {
    if (!selectedRecord) {
      setSelectedRelease(null);
      setDetailState({ status: "idle" });
      detailControllerRef.current?.abort();
      return;
    }

    detailControllerRef.current?.abort();
    const controller = new AbortController();
    detailControllerRef.current = controller;

    setDetailState({ status: "loading" });

    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/releases/${selectedRecord.id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = (await response.json()) as DiscogsRelease;
        setSelectedRelease(data);
        setDetailState({ status: "idle" });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("[release]", error);
        setSelectedRelease(null);
        setDetailState({
          status: "error",
          message: "Kunne ikke hente detaljer fra Discogs.",
        });
      }
    };

    void fetchDetail();

    return () => {
      controller.abort();
    };
  }, [selectedRecord]);

  useEffect(() => {
    if (!selectedRecord) {
      relationsControllerRef.current?.abort();
      setRelations(null);
      setRelationsState({ status: "idle" });
      return;
    }

    relationsControllerRef.current?.abort();
    const controller = new AbortController();
    relationsControllerRef.current = controller;
    setRelationsState({ status: "loading" });

    const fetchRelations = async () => {
      try {
        const response = await fetch(
          `/api/releases/${selectedRecord.id}/relations`,
          {
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = (await response.json()) as DiscogsReleaseRelations;
        setRelations(data);
        setRelationsState({ status: "idle" });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("[relations]", error);
        setRelations(null);
        setRelationsState({
          status: "error",
          message: "Kunne ikke hente relasjoner fra Discogs.",
        });
      }
    };

    void fetchRelations();

    return () => {
      controller.abort();
    };
  }, [selectedRecord]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!results.length) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
        return;

      event.preventDefault();
      const current = selectedIndex ?? 0;
      let nextIndex = current;

      switch (event.key) {
        case "ArrowRight":
          nextIndex = Math.min(results.length - 1, current + 1);
          break;
        case "ArrowLeft":
          nextIndex = Math.max(0, current - 1);
          break;
        case "ArrowDown":
          nextIndex = Math.min(results.length - 1, current + columns);
          break;
        case "ArrowUp":
          nextIndex = Math.max(0, current - columns);
          break;
      }

      setSelectedIndex(nextIndex);
      focusRecord(nextIndex);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [columns, focusRecord, results.length, selectedIndex]);

  const statusMessage = useMemo(() => {
    if (fetchState.status === "loading") return "Henter plater…";
    if (fetchState.status === "error") return fetchState.message;
    if (fetchState.status === "success" && results.length === 0)
      return "Ingen treff ennå – prøv et annet søk.";
    return null;
  }, [fetchState, results.length]);

  return (
    <div className="flex min-h-screen flex-col gap-10 bg-slate-950 px-6 pb-16 pt-16 text-slate-100 sm:px-10 md:px-14">
      <header className="flex flex-col gap-3 text-center sm:text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">
          WarpDig Prototype
        </span>
        <h1 className="text-4xl font-semibold leading-tight text-slate-50 md:text-5xl">
          Naviger Discogs uten friksjon
        </h1>
        <p className="max-w-2xl text-base text-slate-400 md:text-lg">
          Søkemotor med flyt. Bla gjennom labels, artister og utgivelser med
          piltaster og direkte forhåndsvisning – akkurat som å stå ved kasseveggen.
        </p>
      </header>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        isLoading={fetchState.status === "loading"}
      />

      {statusMessage ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section
          aria-label="Treffliste"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
        >
          {results.map((record, index) => (
            <RecordCard
              key={`${record.id}-${index}`}
              record={record}
              isSelected={selectedIndex === index}
              index={index}
              onHover={() => setSelectedIndex(index)}
            />
          ))}
        </section>

        <aside className="sticky top-24 flex h-fit min-h-[420px] flex-col gap-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
          <RecordDetail
            record={selectedRecord}
            release={selectedRelease}
            relations={relations}
            relationsLoading={relationsState.status === "loading"}
            relationsError={
              relationsState.status === "error"
                ? relationsState.message
                : undefined
            }
            isLoading={detailState.status === "loading"}
            errorMessage={
              detailState.status === "error" ? detailState.message : undefined
            }
            onRelationSearch={handleRelationSearch}
          />
        </aside>
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={fetchState.status === "loading"}
            className="rounded-full border border-emerald-400/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {fetchState.status === "loading" ? "Laster…" : "Hent flere"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
