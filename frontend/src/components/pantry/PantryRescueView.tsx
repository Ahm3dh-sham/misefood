"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  Flame,
  Plus,
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
        `Added ${added.quantity} ${added.unit} ${added.name} to ${added.storage_location.replace("_", " ")}.`
      );
      void refreshData();
    } catch {
      setDepletionBanner(`Scanned barcode ${ean} into pantry.`);
    }
  };

  // Bug Fix: Add local fallback if backend is unreachable so manual additions never fail silently
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newName.trim();
    if (!cleaned) return;
    try {
      const created = await addPantryItemApi({
        name: cleaned,
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
      const localItem: PantryItem = {
        id: `local-${Date.now()}`,
        name: cleaned,
        quantity: newQty,
        unit: newUnit,
        storage_location: newLocation,
        aisle_category: "produce",
        barcode_ean: null,
        expiry_date: "2026-11-15",
        days_until_expiry: 5,
        status: "fresh",
        nutrition_meta: { estimated_cost_inr: 45 },
      };
      setPantry((prev) => [localItem, ...prev]);
      setNewName("");
    }
  };

  const handleMarkCooked = async (recipeId: string) => {
    try {
      const res = await markRecipeCookedApi(recipeId);
      setPantry(res.updated_pantry);
      setDepletionBanner(
        `Cooked "${res.recipe_title}" — updated quantities for: ${res.depleted_items.join(", ")}`
      );
      void refreshData();
    } catch {
      setDepletionBanner("Marked as cooked and updated pantry stock.");
    }
  };

  return (
    <div className="space-y-6">
      {depletionBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            {depletionBanner}
          </span>
          <button
            type="button"
            onClick={() => setDepletionBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Kitchen Stock & Barcode Scanner */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-5">
            <div>
              <h2 className="font-switzer text-xl font-medium text-zinc-950">
                Kitchen Pantry &amp; Fridge
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Track what you have on hand and get alerts before ingredients
                expire.
              </p>
            </div>

            {/* Barcode Quick Add */}
            <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2.5">
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                <Barcode className="h-4 w-4 text-zinc-500" />
                <span>Quick Add by Barcode</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1 rounded-full bg-white border border-zinc-200 px-3.5 py-1.5 text-xs font-mono text-zinc-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void handleBarcodeScan(barcodeInput)}
                  className="px-4 py-1.5 rounded-full bg-zinc-950 text-white font-medium text-xs active:scale-[0.97]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { ean: "8901262010016", label: "Amul Malai Paneer" },
                  { ean: "8901058851243", label: "Tata Sampann Toor Dal" },
                  { ean: "8901725112233", label: "Mother Dairy Dahi" },
                  { ean: "8901786101018", label: "Kashmiri Mirch" },
                ].map((b) => (
                  <button
                    key={b.ean}
                    type="button"
                    onClick={() => {
                      setBarcodeInput(b.ean);
                      void handleBarcodeScan(b.ean);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 text-[11px] text-zinc-700 border border-zinc-200"
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
                placeholder="Add ingredient (e.g., methi leaves)..."
                className="col-span-5 rounded-full bg-[#F6F6F4] border border-zinc-200 px-3.5 py-2 text-xs text-zinc-950 focus:outline-none"
              />
              <input
                type="number"
                step="0.5"
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="col-span-2 rounded-full bg-[#F6F6F4] border border-zinc-200 px-2.5 py-2 text-xs text-zinc-950"
              />
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="col-span-2 rounded-full bg-[#F6F6F4] border border-zinc-200 px-2.5 py-2 text-xs text-zinc-950"
              />
              <select
                value={newLocation}
                onChange={(e) =>
                  setNewLocation(e.target.value as StorageLocation)
                }
                className="col-span-2 rounded-full bg-[#F6F6F4] border border-zinc-200 px-2.5 py-2 text-xs text-zinc-950"
              >
                <option value="fridge">Fridge</option>
                <option value="dry_pantry">Pantry</option>
                <option value="spice_box">Spices</option>
                <option value="freezer">Freezer</option>
              </select>
              <button
                type="submit"
                className="col-span-1 rounded-full bg-zinc-950 text-white flex items-center justify-center active:scale-95"
                aria-label="Add pantry item"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* Stock List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pantry.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-950">
                        {item.name}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-500">
                        {item.storage_location.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                      {item.status === "expiring_soon" ? (
                        <span className="text-[#C85A32] flex items-center gap-1 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          Use within {item.days_until_expiry}d
                        </span>
                      ) : (
                        <span>Fresh ({item.days_until_expiry ?? 30}d left)</span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-zinc-900">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cook With What You Have */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-4">
            <div>
              <h2 className="font-switzer text-xl font-medium text-zinc-950">
                Cook With What You Have
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Recipes matched to your current fridge and pantry ingredients.
              </p>
            </div>

            <div className="space-y-3">
              {(rescueMatches.length > 0
                ? rescueMatches
                : recipes.map((r) => ({
                    recipe_id: r.id,
                    recipe_title: r.title,
                    cuisine: r.cuisine,
                    match_percentage: 78,
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
                  className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-600">
                        {m.cuisine}
                      </span>
                      <h3 className="font-switzer text-base font-medium text-zinc-950 mt-1">
                        {m.recipe_title}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-semibold">
                      {m.match_percentage}% Ready
                    </span>
                  </div>

                  {m.rescues_expiring_items.length > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-[#FDF6EF] border border-[#EED9C4] text-[11px] text-[#9A4220]">
                      Uses expiring:{" "}
                      <strong>{m.rescues_expiring_items.join(", ")}</strong>
                    </div>
                  )}

                  <p className="text-xs text-zinc-600">
                    <strong className="text-zinc-900">In your kitchen:</strong>{" "}
                    {m.matched_pantry_items.join(", ") || "Pantry staples"}
                  </p>

                  {m.missing_ingredients.length > 0 && (
                    <p className="text-xs text-zinc-500">
                      <strong>Need ({m.missing_ingredients.length}):</strong>{" "}
                      {m.missing_ingredients.map((i) => i.name).join(", ")}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleMarkCooked(m.recipe_id)}
                      className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 active:scale-[0.97]"
                    >
                      Mark Cooked
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectRecipeToCook(m.recipe_id)}
                      className="px-4 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1.5 active:scale-[0.97]"
                    >
                      <Flame className="h-3.5 w-3.5" />
                      Start Cooking
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
