"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Camera,
  GitFork,
  MessageSquarePlus,
  Star,
  Users,
} from "lucide-react";
import {
  fetchCommunities,
  fetchCookbooks,
  postMadeItReview,
} from "@/lib/api";
import type { Community, Cookbook, Recipe } from "@/types/recipe";

interface SocialCookbooksViewProps {
  recipes: Recipe[];
  selectedRecipe: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
  onReviewAdded: (recipeId: string) => void;
}

export function SocialCookbooksView({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  onReviewAdded,
}: SocialCookbooksViewProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [authorName, setAuthorName] = useState("Aarav Mehta");
  const [reviewNote, setReviewNote] = useState("");
  const [tweakNote, setTweakNote] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [comms, books] = await Promise.all([
          fetchCommunities(),
          fetchCookbooks(),
        ]);
        setCommunities(comms);
        setCookbooks(books);
      } catch {
        // Fallback if offline
      }
    })();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNote.trim()) return;
    try {
      await postMadeItReview(selectedRecipe.id, {
        author_name: authorName,
        rating: 5,
        review_note: reviewNote,
        photo_caption: photoCaption || "Home kitchen claypot plating",
        tweak_note: tweakNote || "Used Indian Katori measurements",
      });
      setReviewNote("");
      setTweakNote("");
      setPhotoCaption("");
      onReviewAdded(selectedRecipe.id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Culinary Communities Row */}
      <div className="rounded-2xl bg-charcoal border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <span>Samsung Food Communities &amp; Shared Household Cookbooks</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Collaborate on family recipe boxes, inspect fork lineages, and
              share &ldquo;Made It&rdquo; photo notes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communities.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-obsidian border border-white/10 space-y-2"
            >
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {c.banner_tag}
              </span>
              <h3 className="text-sm font-semibold text-white">{c.name}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {c.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {c.featured_tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Collaborative Household Cookbooks */}
        <div className="lg:col-span-6 rounded-2xl bg-charcoal border border-white/10 p-5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span>Collaborative Family &amp; Housemate Cookbooks</span>
          </h3>

          <div className="space-y-3">
            {cookbooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-xl bg-obsidian border border-white/10 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-white">
                    {book.title}
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                    Shared ({book.members_names.length} members)
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{book.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recipes
                    .filter((r) => book.recipe_ids.includes(r.id))
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onSelectRecipe(r)}
                        className="px-2.5 py-1 rounded-lg bg-charcoal border border-white/10 text-xs text-amber-300 hover:border-amber-400/50"
                      >
                        {r.title}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "Made It" Photo Reviews & Tweaks for Selected Recipe */}
        <div className="lg:col-span-6 rounded-2xl bg-charcoal border border-white/10 p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-400" />
              <span>
                &ldquo;Made It&rdquo; Reviews &amp; Tweaks: {selectedRecipe.title}
              </span>
            </h3>
          </div>

          <form
            onSubmit={(e) => void handleSubmitReview(e)}
            className="p-4 rounded-xl bg-obsidian border border-white/10 space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name"
                className="rounded-lg bg-charcoal border border-white/10 px-3 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Photo caption (e.g., Sunday Handi Paneer)"
                className="rounded-lg bg-charcoal border border-white/10 px-3 py-1.5 text-xs text-white"
              />
            </div>
            <input
              type="text"
              value={tweakNote}
              onChange={(e) => setTweakNote(e.target.value)}
              placeholder="Your tweak (e.g., Used Jain mode + Air-Fryer at 200°C)"
              className="w-full rounded-lg bg-charcoal border border-white/10 px-3 py-1.5 text-xs text-white"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Share how it turned out..."
                className="flex-1 rounded-lg bg-charcoal border border-white/10 px-3 py-1.5 text-xs text-white"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-obsidian font-semibold text-xs flex items-center gap-1.5 shrink-0 active:scale-[0.97]"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>Post &ldquo;Made It&rdquo;</span>
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            {selectedRecipe.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl bg-obsidian border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    {rev.author_name}
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-400 text-xs">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {rev.rating}/5
                  </span>
                </div>
                <p className="text-xs text-zinc-200">{rev.review_note}</p>
                {rev.tweak_note && (
                  <p className="text-[11px] text-amber-300 flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    Tweak: {rev.tweak_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
