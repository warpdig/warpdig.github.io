export interface DiscogsSearchPagination {
  page: number;
  pages: number;
  per_page: number;
  items: number;
}

export interface DiscogsSearchResult {
  id: number;
  title: string;
  year?: number;
  thumb?: string;
  cover_image?: string;
  type: string;
  format?: string[];
  label?: string[];
  style?: string[];
  genre?: string[];
  country?: string;
  resource_url: string;
  uri: string;
  master_id?: number;
  master_url?: string;
}

export interface DiscogsSearchResponse {
  pagination: DiscogsSearchPagination;
  results: DiscogsSearchResult[];
}

export interface DiscogsLabel {
  id: number;
  name: string;
  catno?: string;
}

export interface DiscogsArtist {
  id: number;
  name: string;
  anv?: string;
  join?: string;
  resource_url: string;
  role?: string;
  tracks?: string;
}

export interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
}

export interface DiscogsCommunityStats {
  have: number;
  wantlist: number;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  year?: number;
  country?: string;
  genres?: string[];
  styles?: string[];
  artists?: DiscogsArtist[];
  labels?: DiscogsLabel[];
  tracklist?: DiscogsTrack[];
  community?: DiscogsCommunityStats;
  resource_url?: string;
  uri?: string;
  master_id?: number;
  thumb?: string;
}

export interface DiscogsMasterVersion {
  id: number;
  title: string;
  country?: string;
  year?: number;
  label?: string;
  format?: string[];
  resource_url: string;
  thumb?: string;
  main_release?: number;
}

export interface DiscogsRelatedRelease {
  id: number;
  title: string;
  artist?: string;
  year?: number;
  type?: string;
  format?: string;
  resource_url: string;
  thumb?: string;
}

export interface DiscogsReleaseRelations {
  master?: {
    id: number;
    title: string;
    versions: DiscogsMasterVersion[];
  };
  label?: {
    id: number;
    name: string;
    releases: DiscogsRelatedRelease[];
  };
  artists: Array<{
    id: number;
    name: string;
    releases: DiscogsRelatedRelease[];
  }>;
}
