import "server-only";

import { getCache, setCache } from "@/lib/cache";
import {
  DiscogsMasterVersion,
  DiscogsRelatedRelease,
  DiscogsRelease,
  DiscogsReleaseRelations,
  DiscogsSearchResponse,
} from "@/types/discogs";

const DISCOGS_API_BASE = "https://api.discogs.com";
const DEFAULT_USER_AGENT = "WarpDig/0.1 (+https://warpdig.github.io)";

const userAgent =
  process.env.DISCOGS_USER_AGENT?.trim() || DEFAULT_USER_AGENT;
const discogsToken = process.env.DISCOGS_TOKEN?.trim();

function createDiscogsUrl(
  path: string,
  params: Record<string, string | number | undefined> = {}
): URL {
  const url = new URL(`${DISCOGS_API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });
  if (discogsToken) {
    url.searchParams.set("token", discogsToken);
  }
  return url;
}

async function fetchDiscogsJson<T>(
  url: URL,
  options?: { revalidate?: number; tags?: string[] }
): Promise<T> {
  const nextOptions =
    options?.revalidate || options?.tags
      ? {
          revalidate: options?.revalidate,
          tags: options?.tags,
        }
      : undefined;

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
    ...(nextOptions ? { next: nextOptions } : {}),
  });

  if (!response.ok) {
    throw new Error(
      `Discogs request failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}

export async function searchDiscogs(
  query: string,
  page = 1,
  perPage = 30,
  options?: { type?: string }
): Promise<DiscogsSearchResponse> {
  if (!query.trim()) {
    return {
      pagination: {
        page: 1,
        pages: 1,
        per_page: perPage,
        items: 0,
      },
      results: [],
    };
  }

  const url = createDiscogsUrl("/database/search", {
    q: query,
    page,
    per_page: perPage,
    type: options?.type ?? "release",
    sort: "year",
    sort_order: "desc",
  });

  const cacheKey = `search:${url.searchParams.toString()}`;
  const cached = getCache<DiscogsSearchResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchDiscogsJson<DiscogsSearchResponse>(url, {
    revalidate: 60,
    tags: ["discogs-search"],
  });
  setCache(cacheKey, data, 1000 * 60 * 3);
  return data;
}

export async function getRelease(id: number): Promise<DiscogsRelease> {
  const cacheKey = `release:${id}`;
  const cached = getCache<DiscogsRelease>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = createDiscogsUrl(`/releases/${id}`);
  const data = await fetchDiscogsJson<DiscogsRelease>(url, {
    revalidate: 300,
    tags: ["discogs-release", id.toString()],
  });
  setCache(cacheKey, data, 1000 * 60 * 10);
  return data;
}

interface DiscogsMasterVersionsResponse {
  versions: Array<{
    id: number;
    title: string;
    country?: string;
    year?: number;
    label?: string;
    format?: string | string[];
    resource_url: string;
    thumb?: string;
    main_release?: number;
  }>;
}

interface DiscogsEntityReleasesResponse {
  releases: Array<{
    id: number;
    title: string;
    artist?: string;
    year?: number;
    type?: string;
    format?: string;
    resource_url: string;
    thumb?: string;
  }>;
}

async function getMasterVersions(masterId: number): Promise<DiscogsMasterVersion[]> {
  const url = createDiscogsUrl(`/masters/${masterId}/versions`, {
    per_page: 30,
    sort: "year",
    sort_order: "asc",
  });
  const cacheKey = `master:${masterId}:versions:${url.searchParams.toString()}`;
  const cached = getCache<DiscogsMasterVersion[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchDiscogsJson<DiscogsMasterVersionsResponse>(url);
  const mapped = data.versions.map((version) => ({
    id: version.id,
    title: version.title,
    country: version.country,
    year: version.year,
    label: version.label,
    format: Array.isArray(version.format)
      ? version.format
      : version.format
      ? [version.format]
      : undefined,
    resource_url: version.resource_url,
    thumb: version.thumb,
    main_release: version.main_release,
  }));

  setCache(cacheKey, mapped, 1000 * 60 * 10);
  return mapped;
}

async function getLabelReleases(labelId: number): Promise<DiscogsRelatedRelease[]> {
  const url = createDiscogsUrl(`/labels/${labelId}/releases`, {
    sort: "year",
    sort_order: "desc",
    per_page: 20,
  });
  const cacheKey = `label:${labelId}:releases:${url.searchParams.toString()}`;
  const cached = getCache<DiscogsRelatedRelease[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchDiscogsJson<DiscogsEntityReleasesResponse>(url);
  const mapped = data.releases.map((release) => ({
    id: release.id,
    title: release.title,
    artist: release.artist,
    year: release.year,
    type: release.type,
    format: release.format,
    resource_url: release.resource_url,
    thumb: release.thumb,
  }));
  setCache(cacheKey, mapped, 1000 * 60 * 5);
  return mapped;
}

async function getArtistReleases(
  artistId: number
): Promise<DiscogsRelatedRelease[]> {
  const url = createDiscogsUrl(`/artists/${artistId}/releases`, {
    sort: "year",
    sort_order: "desc",
    per_page: 20,
  });
  const cacheKey = `artist:${artistId}:releases:${url.searchParams.toString()}`;
  const cached = getCache<DiscogsRelatedRelease[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchDiscogsJson<DiscogsEntityReleasesResponse>(url);
  const mapped = data.releases.map((release) => ({
    id: release.id,
    title: release.title,
    artist: release.artist,
    year: release.year,
    type: release.type,
    format: release.format,
    resource_url: release.resource_url,
    thumb: release.thumb,
  }));
  setCache(cacheKey, mapped, 1000 * 60 * 5);
  return mapped;
}

export async function getReleaseRelations(
  id: number
): Promise<DiscogsReleaseRelations> {
  const release = await getRelease(id);
  const relations: DiscogsReleaseRelations = {
    artists: [],
  };

  if (release.master_id) {
    try {
      const versions = await getMasterVersions(release.master_id);
      relations.master = {
        id: release.master_id,
        title: release.title,
        versions: versions
          .filter((version) => version.id !== id)
          .slice(0, 10),
      };
    } catch (error) {
      console.error("[discogs:master]", error);
    }
  }

  const primaryLabel = release.labels?.[0];
  if (primaryLabel) {
    try {
      const labelReleases = await getLabelReleases(primaryLabel.id);
      relations.label = {
        id: primaryLabel.id,
        name: primaryLabel.name,
        releases: labelReleases
          .filter((item) => item.id !== id)
          .slice(0, 8),
      };
    } catch (error) {
      console.error("[discogs:label]", error);
    }
  }

  if (release.artists?.length) {
    const artistPromises = release.artists
      .slice(0, 2)
      .map(async (artist) => {
        try {
          const artistReleases = await getArtistReleases(artist.id);
          return {
            id: artist.id,
            name: artist.name,
            releases: artistReleases
              .filter((item) => item.id !== id)
              .slice(0, 8),
          };
        } catch (error) {
          console.error("[discogs:artist]", error);
          return null;
        }
      });

    const artistGroups = await Promise.all(artistPromises);
    relations.artists = artistGroups.filter(
      (group): group is NonNullable<typeof group> => Boolean(group)
    );
  }

  return relations;
}
