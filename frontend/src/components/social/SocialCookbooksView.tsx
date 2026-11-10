"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Camera,
  GitFork,
  MessageSquarePlus,
  Star,
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
        photo_caption: photoCaption || "Home kitchen plating",
        tweak_note: tweakNote || "Used Katori measurements",
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
      {/* Culinary Circles */}
      <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="font-switzer text-xl sm:text-2xl font-medium text-zinc-950">
            Cookbooks &amp; Kitchen Circles
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Shared family recipe collections and cooking notes from home chefs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communities.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2"
            >
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-[#C85A32]">
                {c.banner_tag}
              </span>
              <h3 className="font-switzer text-base font-medium text-zinc-950">
                {c.name}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {c.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {c.featured_tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white text-zinc-500 border border-zinc-200/60"
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
        {/* Shared Household Cookbooks */}
        <div className="lg:col-span-6 rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-4">
          <h3 className="font-switzer text-lg font-medium text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#C85A32]" />
            <span>Shared Family Collections</span>
          </h3>

          <div className="space-y-3">
            {cookbooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-switzer font-medium text-sm text-zinc-950">
                    {book.title}
                  </h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-600">
                    {book.members_names.length} members
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{book.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recipes
                    .filter((r) => book.recipe_ids.includes(r.id))
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onSelectRecipe(r)}
                        className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-xs text-zinc-800 hover:border-zinc-400"
                      >
                        {r.title}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen Notes & Reviews */}
        <div className="lg:col-span-6 rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-4">
          <h3 className="font-switzer text-lg font-medium text-zinc-950 flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#C85A32]" />
            <span>Cooking Notes: {selectedRecipe.title}</span>
          </h3>

          <form
            onSubmit={(e) => void handleSubmitReview(e)}
            className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name"
                className="rounded-full bg-white border border-zinc-200 px-3.5 py-1.5 text-xs text-zinc-950 focus:outline-none"
              />
              <input
                type="text"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Occasion (e.g., Sunday Lunch)"
                className="rounded-full bg-white border border-zinc-200 px-3.5 py-1.5 text-xs text-zinc-950 focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={tweakNote}
              onChange={(e) => setTweakNote(e.target.value)}
              placeholder="Any tweaks? (e.g., Jain mode, air-fried at 200°C)"
              className="w-full rounded-full bg-white border border-zinc-200 px-3.5 py-1.5 text-xs text-zinc-950 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Share how it turned out..."
                className="flex-1 rounded-full bg-white border border-zinc-200 px-3.5 py-1.5 text-xs text-zinc-950 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-zinc-950 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 active:scale-[0.97]"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>Add Note</span>
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            {selectedRecipe.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-950">
                    {rev.author_name}
                  </span>
                  <span className="flex items-center gap-0.5 text-[#E09F3E] text-xs font-medium">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {rev.rating}/5
                  </span>
                </div>
                <p className="text-xs text-zinc-700">{rev.review_note}</p>
                {rev.tweak_note && (
                  <p className="text-[11px] text-[#9A4220] flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {rev.tweak_note}
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
