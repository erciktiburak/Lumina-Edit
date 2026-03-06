"use client";

import { useEffect, useState } from "react";

const KEY = "lumina-tutorial-dismissed";

export function TutorialOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem(KEY) !== "1");
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 p-5">
      <div className="panel mx-auto mt-12 max-w-2xl rounded-2xl p-6">
        <h2 className="font-display text-2xl">Welcome to Lumina-Edit</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Drop a video or image into the upload zone.</li>
          <li>Adjust filters and timeline zoom.</li>
          <li>Export a trimmed sample without leaving your browser.</li>
        </ol>
        <button
          className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm text-white"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setOpen(false);
          }}
        >
          Start Editing
        </button>
      </div>
    </div>
  );
}
