"use client";

import { FormEvent } from "react";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SearchBar({
  value,
  placeholder = "Søk etter release, label eller artist…",
  isLoading,
  onChange,
  onSubmit,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl items-center gap-3 rounded-full border border-slate-800/60 bg-slate-900/50 px-6 py-3 backdrop-blur transition focus-within:border-slate-300/60 focus-within:bg-slate-900/80"
    >
      <input
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none"
        placeholder={placeholder}
        aria-label="Search"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Søker…" : "Søk"}
      </button>
    </form>
  );
}
