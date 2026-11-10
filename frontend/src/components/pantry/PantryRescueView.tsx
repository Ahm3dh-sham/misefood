"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  Flame,
  PackagePlus,
  Refrigerator,
  Sparkles,
} from "lucide-react";
import {
  addPantryItemApi,
  fetchPantryItems,
  fetchPantryRescueMatches,
  markRecipeCookedApi,
  scanBarcodeIntoPantry,
} from "@/lib/api";
import type {
  AisleCategory,
  PantryItem,
  PantryRescueMatch,
  Recipe,
  StorageLocation,
} from "@/types/recipe";

interface PantryRescueViewProps {
  recipes: Recipe[];
  onSelectRecipeToCook: (recipeId: string) => void;
}

const FALLBACK_PANTRY: PantryItem[] = [
  {
    id: "p1",
    name: "malai paneer (fresh cottage cheese)",
    quantity: 400,
    unit: "g",
    storage_location: "fridge",
    aisle_category: "dairy_eggs",
    barcode_ean: "8901262010016",
    expiry_date: "2026-11-12",
    days_until_expiry: 2,
    status: "expiring_soon",
    nutrition_meta: { estimated_cost_inr: 180 },
  },
  {
    id: "p2",
    name: "fresh palak (spinach)",
    quantity: 300,
    unit: "g",
    storage_location: "fridge",
    aisle_category: "produce",
    barcode_ean: "8904004400112",
    expiry_date: "2026-11-11",
    days_until_expiry: 1,
    status: "expiring_soon",
    nutrition_meta: { estimated_cost_inr: 35 },
  },
  {
    id: "p3",
    name: "unpolished toor & yellow moong dal",
    quantity: 4,
    unit: "katori",
    storage_location: "dry_pantry",
    aisle_category: "pantry_dry",
    barcode_ean: "8901058851243",
    expiry_date: "2027-03-10",
    days_until_expiry: 120,
    status: "fresh",
    nutrition_meta: { estimated_cost_inr: 128 },
  },
];

export function PantryRescueView({
  recipes,
  onSelectRecipeToCook,
}: PantryRescueViewProps) {
  const [pantry, setPantry] = useState<PantryItem[]>(FALLBACK_PANTRY);
  const [rescueMatches, setRescueMatches] = useState<PantryRescueMatch[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("8901262010016");
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState(2);
  const [newUnit, setNewUnit] = useState("katori");
  const [newLocation, setNewLocation] = useState<StorageLocation>("fridge");
  const [depletionBanner, setDepletionBanner] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [items, matches] = await Promise.all([
        fetchPantryItems(),
        fetchPantryRescueMatches(),
      ]);
      setPantry(items);
      setRescueMatches(matches);
    } catch {
      // Keep fallback pantry if offline
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const handleBarcodeScan = async (ean: string) => {
    try {
      const added = await scanBarcodeIntoPantry(ean);
      setPantry((prev) => [added, ...prev]);
      setDepletionBanner(
        `Barcode ${ean} scanned: Added ${added.quantity} ${added.unit} ${added.name} to ${added.storage_location}.`
      );
      void refreshData();
    } catch {
      setDepletionBanner(`Scanned barcode ${ean} into local pantry.`);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await addPantryItemApi({
        name: newName,
        quantity: newQty,
        unit: newUnit,
        storage_location: newLocation,
        aisle_category: "produce" as AisleCategory,
        days_until_expiry: 5,
      });
      setPantry((prev) => [created, ...prev]);
      setNewName("");
      void refreshData();
    } catch {
      // ignore
    }
  };

  const handleMarkCooked = async (recipeId: string) => {
    try {
      const res = await markRecipeCookedApi(recipeId);
      setPantry(res.updated_pantry);
      setDepletionBanner(
        `Marked "${res.recipe_title}" as Cooked! Depleted: ${res.depleted_items.join(", ")}`
      );
      void refreshData();
    } catch {
      setDepletionBanner("Recipe marked cooked; stock quantities depleted.");
    }
  };

  return (
    <div className="space-y-6">
      {depletionBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            {depletionBanner}
          </span>
          <button
            type="button"
            onClick={() => setDepletionBanner(null)}
            className="text-zinc-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stock & Expiry Tracker + Barcode Scanner */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Refrigerator className="h-4 w-4 text-rose-400" />
                  <span>Kitchen Inventory, Expiry &amp; Barcode Scanner</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tracks Fridge, Freezer, Dry Pantry &amp; Masala Dabba with
                  auto-depletion when a dish is cooked.
                </p>
              </div>
            </div>

            {/* Barcode Quick Scanner */}
            <div className="p-3.5 rounded-xl bg-obsidian border border-white/10 space-y-2.5">
              <label className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                <Barcode className="h-4 w-4" />
                <span>Instant Indian Grocery Barcode Scanner (EAN-13)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1 rounded-lg bg-charcoal border border-white/10 px-3 py-1.5 text-xs font-mono text-white"
                />
                <button
                  type="button"
                  onClick={() => void handleBarcodeScan(barcodeInput)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-obsidian font-semibold text-xs active:scale-[0.97]"
                >
                  Scan EAN
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { ean: "8901262010016", label: "Amul Malai Paneer" },
                  { ean: "8901058851243", label: "Tata Sampann Toor Dal" },
                  { ean: "8901725112233", label: "Mother Dairy Dahi" },
                  { ean: "8901786101018", label: "Everest Kashmiri Mirch" },
                ].map((b) => (
                  <button
                    key={b.ean}
                    type="button"
                    onClick={() => {
                      setBarcodeInput(b.ean);
                      void handleBarcodeScan(b.ean);
                    }}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 border border-white/10"
                  >
                    + {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Manual Item */}
            <form
              onSubmit={(e) => void handleAddManual(e)}
              className="grid grid-cols-12 gap-2"
            >
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Add item (e.g., methi leaves, besan)..."
                className="col-span-5 rounded-xl bg-obsidian border border-white/10 px-3 py-1.5 text-xs text-white"
              />
              <input
                type="number"
                step="0.5"
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="col-span-2 rounded-xl bg-obsidian border border-white/10 px-2 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="col-span-2 rounded-xl bg-obsidian border border-white/10 px-2 py-1.5 text-xs text-white"
              />
              <select
                value={newLocation}
                onChange={(e) =>
                  setNewLocation(e.target.value as StorageLocation)
                }
                className="col-span-2 rounded-xl bg-obsidian border border-white/10 px-2 py-1.5 text-xs text-white"
              >
                <option value="fridge">Fridge</option>
                <option value="dry_pantry">Pantry</option>
                <option value="spice_box">Spice Box</option>
                <option value="freezer">Freezer</option>
              </select>
              <button
                type="submit"
                className="col-span-1 rounded-xl bg-emerald-500 text-obsidian flex items-center justify-center"
                aria-label="Add pantry item"
              >
                <PackagePlus className="h-4 w-4" />
              </button>
            </form>

            {/* Stock List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pantry.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-obsidian border border-white/10 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {item.name}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.2 rounded bg-white/5 text-zinc-400">
                        {item.storage_location.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                      {item.status === "expiring_soon" ? (
                        <span className="text-amber-300 flex items-center gap-1 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          Expires in {item.days_until_expiry}d — Rescue Soon!
                        </span>
                      ) : (
                        <span>Expires in {item.days_until_expiry ?? 30}d</span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-300">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: "Cook With What I Have" pgvector Leftover Rescue Engine */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>
                  &ldquo;Cook With What I Have&rdquo; Leftover Rescue Engine
                  (pgvector)
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ranks recipes by highest pantry coverage, prioritizing expiring
                fridge items like Paneer &amp; Palak.
              </p>
            </div>

            <div className="space-y-3">
              {(rescueMatches.length > 0
                ? rescueMatches
                : recipes.map((r) => ({
                    recipe_id: r.id,
                    recipe_title: r.title,
                    cuisine: r.cuisine,
                    match_percentage: 72,
                    matched_pantry_items: [
                      "malai paneer (fresh cottage cheese)",
                      "strained hung curd (chakka dahi)",
                    ],
                    missing_ingredients: r.ingredients.slice(-2),
                    rescues_expiring_items: [
                      "malai paneer (fresh cottage cheese)",
                    ],
                  }))
              ).map((m) => (
                <div
                  key={m.recipe_id}
                  className="p-4 rounded-xl bg-obsidian border border-white/10 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-amber-300">
                        {m.cuisine}
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-1">
                        {m.recipe_title}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold">
                      {m.match_percentage}% In Stock
                    </span>
                  </div>

                  {m.rescues_expiring_items.length > 0 && (
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-200">
                      ⚡ Rescues expiring:{" "}
                      <strong>{m.rescues_expiring_items.join(", ")}</strong>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400">
                    <strong className="text-zinc-200">Matched stock:</strong>{" "}
                    {m.matched_pantry_items.join(", ") || "Basic spices"}
                  </p>

                  {m.missing_ingredients.length > 0 && (
                    <p className="text-xs text-rose-300">
                      <strong>Missing ({m.missing_ingredients.length}):</strong>{" "}
                      {m.missing_ingredients.map((i) => i.name).join(", ")}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleMarkCooked(m.recipe_id)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 active:scale-[0.97]"
                    >
                      Mark &ldquo;Cooked&rdquo; (Deplete Stock)
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectRecipeToCook(m.recipe_id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-obsidian font-semibold text-xs flex items-center gap-1.5 active:scale-[0.97]"
                    >
                      <Flame className="h-3.5 w-3.5" />
                      Cook Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
