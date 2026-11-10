"use client";

import Image from "next/image";
import { useState } from "react";

/** Lightweight YouTube embed: shows the thumbnail and only loads the player once someone presses play. */
export default function YouTube({ id, title, className = "" }: { id: string; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`relative aspect-video overflow-hidden rounded-lg bg-steel ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play video: ${title}`}>
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover opacity-85 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute top-1/2 left-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-clay text-white shadow-lg transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left text-sm font-medium text-white">
            {title}
          </span>
        </button>
      )}
    </div>
  );
}
