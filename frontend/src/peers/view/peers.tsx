"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePeersViewModel } from "../viewmodel/usePeersViewModel";

export function PeersView() {
  const { searchQuery, hasPeers, handleSearch, handleAddFriend } =
    usePeersViewModel();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-6 text-3xl font-bold text-foreground">Peers</h1>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Find friends by username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Empty State */}
      {!hasPeers && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 rounded-full bg-blue-50 p-6">
            <Users className="h-12 w-12 text-blue-400" />
          </div>

          <h2 className="mb-2 text-xl font-semibold text-foreground">
            No peers yet
          </h2>
          <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
            Connect with classmates and friends to share progress, join study
            groups, and level up together.
          </p>

          <Button
            onClick={handleAddFriend}
            className="rounded-full bg-green-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Add friends
          </Button>
        </div>
      )}
    </div>
  );
}
