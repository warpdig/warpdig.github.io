export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v");
    }
    const match = parsed.pathname.match(/\/embed\/([\w-]+)/);
    if (match) return match[1];
    return null;
  } catch (error) {
    console.error("Failed to parse YouTube url", error);
    return null;
  }
}
