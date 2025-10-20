"use client";

import Image from "next/image";
import { DiscogsSearchResult } from "@/types/discogs";
import { cn } from "@/lib/utils";

interface RecordCardProps {
  record: DiscogsSearchResult;
  isSelected?: boolean;
  onHover?: () => void;
  index?: number;
}

export function RecordCard({
  record,
  isSelected = false,
  onHover,
  index,
}: RecordCardProps) {
  const cover = record.cover_image || record.thumb || "/placeholder-release.svg";
  const subtitleParts = [
    record.year,
    record.label?.[0],
    record.country,
  ].filter(Boolean);

  return (
    <article
      tabIndex={0}
      onMouseEnter={onHover}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-slate-800/50 bg-slate-900/60 p-4 text-left shadow-lg shadow-slate-950/20 transition focus:outline-none",
        "hover:border-emerald-400/60 hover:shadow-emerald-500/20 focus:border-emerald-400/60 focus:shadow-emerald-500/25",
        isSelected &&
          "border-emerald-400/80 ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-slate-950"
      )}
      data-record-index={index}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-800/60">
        <Image
          src={cover}
          alt={record.title}
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          priority={isSelected}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-slate-100 leading-tight">
          {record.title}
        </h3>
        {subtitleParts.length > 0 ? (
          <p className="text-sm text-slate-400">
            {subtitleParts.join(" • ")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
          {record.genre?.slice(0, 3).map((genre) => (
            <span key={genre} className="rounded-full bg-slate-800/60 px-3 py-1">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
