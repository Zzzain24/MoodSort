"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { deleteAccount } from "@/app/actions/auth";

interface SettingsClientProps {
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export function SettingsClient({
  displayName,
  email,
  avatarUrl,
}: SettingsClientProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initial = displayName.charAt(0).toUpperCase();

  function handleDelete() {
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <div className="px-8 pt-12 pb-8 flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-1">
          Settings
        </p>
        <h1 className="text-3xl font-extrabold text-[#121212] leading-tight">
          Account
        </h1>
      </div>

      {/* Account info */}
      <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55 mb-4">
          Profile
        </p>
        <div className="flex items-center gap-4 mb-5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={48}
              height={48}
              className="rounded-full object-cover border border-black/10 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center shrink-0">
              <span className="text-base font-bold text-[#1DB954]">
                {initial}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-[#121212]">{displayName}</p>
            <p className="text-xs text-black/55 mt-0.5">Spotify account</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-black/55 block mb-1">
              Display name
            </label>
            <div className="bg-[#F5F4F0] border border-black/[0.08] rounded-xl px-4 py-2.5 text-sm text-black/70 select-none">
              {displayName}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-black/55 block mb-1">
              Email
            </label>
            <div className="bg-[#F5F4F0] border border-black/[0.08] rounded-xl px-4 py-2.5 text-sm text-black/70 select-none">
              {email}
            </div>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <div className="bg-red-50/60 border border-red-200 rounded-2xl px-5 py-5">
        <p className="text-sm font-bold text-[#121212] mb-1">Delete account</p>
        <p className="text-xs text-black/60 leading-relaxed mb-4">
          Permanently delete your MoodSort account. This cannot be undone.
        </p>

        <div className="relative inline-block">
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-xl border border-red-300 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 transition-colors duration-200"
          >
            Delete account
          </button>

          {showConfirm && (
            <>
              {/* Dark overlay */}
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                onClick={() => setShowConfirm(false)}
              />

              {/* Popover — centered on screen */}
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] z-50 bg-[#F5F4F0] rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.18)] border border-red-200 p-6 flex flex-col gap-4">
                <div>
                  <p className="text-sm font-bold text-[#121212] mb-1.5">
                    Are you sure?
                  </p>
                  <p className="text-xs text-black/55 leading-relaxed">
                    This will permanently delete your account and all associated
                    data. This cannot be undone.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 transition-colors duration-200"
                  >
                    {isPending ? "Deleting…" : "Yes, delete my account"}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="rounded-xl border border-black/[0.10] bg-[#F5F4F0] hover:border-black/20 text-sm font-semibold text-[#121212] px-4 py-2 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
