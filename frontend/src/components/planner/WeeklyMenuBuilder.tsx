"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, RefreshCw, Sparkles } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Regional cuisine catalogue                                                 */
/*  tags: v = vegetarian, j = Jain-friendly (no onion-garlic/roots),           */
/*        q = ready in ~25 min, a = air-fryer / low-oil                        */
/* -------------------------------------------------------------------------- */

type RegionId = "north" | "south" | "east" | "west" | "northeast";
type MealSlot = "breakfast" | "lunch" | "dinner";

interface Dish {
  name: string;
  kcal: number;
  protein: number;
  cost: number; // ₹ per serving
  tags: string;
}

type DishTuple = [string, number, number, number, string];

const d = (rows: DishTuple[]): Dish[] =>
  rows.map(([name, kcal, protein, cost, tags]) => ({
    name,
    kcal,
    protein,
    cost,
    tags,
  }));

export const REGIONS: {
  id: RegionId;
  label: string;
  hint: string;
}[] = [
  { id: "north", label: "North Indian", hint: "Mughlai & breads" },
  { id: "south", label: "South Indian", hint: "Rice, lentils & coconut" },
  { id: "east", label: "East Indian", hint: "Seafood & mustard oil" },
  {
    id: "west",
    label: "West Indian",
    hint: "Coastal, sweet-savory & street food",
  },
  {
    id: "northeast",
    label: "Northeast Indian",
    hint: "Smoked meats & bamboo shoots",
  },
];

const CATALOGUE: Record<RegionId, Record<MealSlot, Dish[]>> = {
  north: {
    breakfast: d([
      ["Aloo Paratha with Curd", 420, 11, 45, "v"],
      ["Paneer Paratha with Mint Raita", 460, 22, 60, "v"],
      ["Besan Chilla with Paneer Stuffing", 340, 21, 40, "vjq"],
      ["Chole Kulche", 510, 16, 55, "v"],
      ["Egg Bhurji with Tandoori Roti", 380, 22, 35, "q"],
    ]),
    lunch: d([
      ["Rajma Chawal with Jeera Rice", 560, 19, 55, "v"],
      ["Dal Makhani with Butter Naan", 640, 20, 70, "v"],
      ["Air-Fryer Paneer Tikka with Tandoori Roti", 590, 30, 95, "va"],
      ["Chicken Tikka with Lachha Paratha", 620, 42, 120, "a"],
      ["Lauki Chana Dal with Phulka", 470, 18, 40, "vj"],
    ]),
    dinner: d([
      ["Mughlai Chicken Korma with Sheermal", 680, 38, 140, ""],
      ["Mutton Rogan Josh with Roti", 650, 40, 180, ""],
      ["Palak Paneer with Missi Roti", 520, 26, 85, "v"],
      ["Yellow Moong Dal Tadka with Phulka", 430, 18, 40, "vjq"],
      ["Tandoori Soya Chaap with Mint Chutney", 480, 32, 70, "va"],
    ]),
  },
  south: {
    breakfast: d([
      ["Idli with Sambar & Coconut Chutney", 350, 12, 35, "vq"],
      ["Masala Dosa", 450, 11, 50, "v"],
      ["Pesarattu with Ginger Chutney", 360, 18, 35, "vjq"],
      ["Ragi Dosa with Peanut Chutney", 380, 14, 35, "vq"],
      ["Ven Pongal with Gotsu", 420, 13, 40, "vj"],
    ]),
    lunch: d([
      ["Sambar Rice with Beans Poriyal", 520, 16, 50, "v"],
      ["Bisi Bele Bath with Curd", 540, 17, 55, "v"],
      ["Kerala Fish Curry with Matta Rice", 590, 36, 130, ""],
      ["Chettinad Chicken with Parotta", 680, 40, 140, ""],
      ["Avial with Rice & Rasam", 480, 12, 50, "vj"],
    ]),
    dinner: d([
      ["Curd Rice with Pomegranate", 400, 13, 35, "vjq"],
      ["Egg Roast with Appam", 520, 22, 70, ""],
      ["Chicken Pepper Fry with Neer Dosa", 560, 40, 120, "q"],
      ["Moong Dal Kootu with Chapati", 430, 17, 40, "vj"],
      ["Mushroom Chettinad with Kal Dosa", 450, 16, 70, "v"],
    ]),
  },
  east: {
    breakfast: d([
      ["Luchi with Cholar Dal", 520, 14, 40, "v"],
      ["Chirer Pulao with Peanuts", 380, 10, 30, "vq"],
      ["Ghugni with Toast", 400, 16, 30, "v"],
      ["Air-Fried Dimer Chop with Muri", 420, 20, 40, "a"],
      ["Chakuli Pitha with Dalma", 410, 15, 35, "v"],
    ]),
    lunch: d([
      ["Shorshe Ilish with Steamed Rice", 620, 34, 190, ""],
      ["Macher Jhol with Rice", 560, 32, 120, "q"],
      ["Odia Dalma with Rice", 500, 18, 45, "vj"],
      ["Chingri Malai Curry with Rice", 640, 30, 170, ""],
      ["Shukto with Rice & Masoor Dal", 480, 15, 45, "vj"],
    ]),
    dinner: d([
      ["Kosha Mangsho with Luchi", 720, 40, 180, ""],
      ["Steamed Mustard Fish Paturi with Roti", 480, 34, 130, "a"],
      ["Aloo Posto with Roti", 460, 10, 40, "v"],
      ["Chicken Rezala with Rumali Roti", 640, 38, 140, ""],
      ["Chhanar Dalna with Rice", 520, 24, 80, "vj"],
    ]),
  },
  west: {
    breakfast: d([
      ["Kanda Poha with Sev", 360, 9, 25, "vq"],
      ["Methi Thepla with Curd", 380, 12, 30, "vjq"],
      ["Misal Pav", 520, 18, 45, "v"],
      ["Sabudana Khichdi", 430, 8, 35, "vj"],
      ["Moong Sprout Usal", 320, 18, 30, "vjq"],
    ]),
    lunch: d([
      ["Goan Fish Curry with Rice", 580, 34, 130, ""],
      ["Gujarati Dal-Bhaat-Shaak", 520, 16, 50, "vj"],
      ["Mumbai Pav Bhaji", 560, 14, 55, "v"],
      ["Chicken Xacuti with Pao", 650, 40, 140, ""],
      ["Undhiyu with Puri", 560, 14, 65, "v"],
    ]),
    dinner: d([
      ["Prawn Balchão with Rice", 600, 32, 160, ""],
      ["Air-Fried Bombay Duck with Bhakri", 460, 30, 110, "aq"],
      ["Khandvi & Sprouted Moong Salad", 380, 18, 40, "vjq"],
      ["Kolhapuri Chicken with Jowar Bhakri", 620, 42, 130, ""],
      ["Dal Dhokli", 480, 16, 40, "vj"],
    ]),
  },
  northeast: {
    breakfast: d([
      ["Til Pitha with Boiled Eggs", 380, 18, 35, "q"],
      ["Steamed Pork Momos", 420, 22, 60, "q"],
      ["Veg Thukpa", 400, 12, 45, "vq"],
      ["Sel Roti with Aloo Dum", 450, 8, 35, "v"],
      ["Paneer & Bamboo Shoot Momos", 380, 18, 55, "vq"],
    ]),
    lunch: d([
      ["Naga Smoked Pork with Bamboo Shoot & Rice", 680, 40, 170, ""],
      ["Assamese Masor Tenga with Rice", 520, 32, 110, "q"],
      ["Khasi Jadoh with Doh Khlieh", 650, 36, 140, ""],
      ["Manipuri Eromba with Rice", 420, 14, 45, ""],
      ["Bamboo Shoot & Black Sesame Dal with Rice", 470, 17, 50, "v"],
    ]),
    dinner: d([
      ["Smoked Chicken with Akhuni & Sticky Rice", 620, 40, 150, ""],
      ["Chicken Thukpa", 520, 34, 90, "q"],
      ["Assamese Duck with Ash Gourd", 640, 38, 180, ""],
      ["Singju Salad with Black Rice Kheer", 380, 10, 50, "vq"],
      ["Tofu & Bamboo Shoot Stir-Fry with Red Rice", 460, 24, 70, "va"],
    ]),
  },
};

const DIET_OPTIONS = [
  "High-Protein",
  "Plant-Based",
  "Jain (No Onion-Garlic)",
  "Quick 25-Min Meals",
  "Low-Oil Air-Fryer",
] as const;
type DietOption = (typeof DIET_OPTIONS)[number];

const BUDGETS = [
  { label: "< ₹1.5k", value: 1500 },
  { label: "₹1.5k – ₹2.5k", value: 2500 },
  { label: "₹2.5k – ₹4k", value: 4000 },
  { label: "₹4k+", value: 5500 },
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];
const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

interface PlannedMeal {
  slot: MealSlot;
  dish: Dish;
}
interface PlannedDay {
  day: string;
  region: RegionId;
  meals: PlannedMeal[];
  portion: number;
  kcal: number;
  protein: number;
  cost: number;
}

/* ----------------------------- Plan generator ----------------------------- */

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function parseNumber(text: string, re: RegExp, fallback: number): number {
  const m = text.match(re);
  const n = m?.[1] ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function generatePlan(opts: {
  regions: RegionId[];
  diet: DietOption[];
  targetKcal: number;
  weeklyBudgetPerPerson: number;
  notes: string;
  seed: number;
}): PlannedDay[] {
  const { regions, diet, targetKcal, weeklyBudgetPerPerson, notes, seed } =
    opts;
  const vegOnly = diet.includes("Plant-Based");
  const jain = diet.includes("Jain (No Onion-Garlic)");
  const highProtein = diet.includes("High-Protein");
  const quick = diet.includes("Quick 25-Min Meals");
  const lowOil = diet.includes("Low-Oil Air-Fryer");
  const perMealBudget = weeklyBudgetPerPerson / 21;
  const noteWords = notes
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4);

  const used = new Set<string>();

  return DAYS.map((day, dayIdx) => {
    const region = regions[dayIdx % regions.length] ?? "north";
    const meals: PlannedMeal[] = SLOTS.map((slot) => {
      const pool = CATALOGUE[region][slot];
      let candidates = pool.filter(
        (dish) =>
          (!vegOnly && !jain ? true : dish.tags.includes("v")) &&
          (!jain || dish.tags.includes("j"))
      );
      // Relax Jain first, then vegetarian, so every slot still gets a dish
      if (candidates.length === 0 && (vegOnly || jain)) {
        candidates = pool.filter((dish) => dish.tags.includes("v"));
      }
      if (candidates.length === 0) candidates = pool;

      const scored = candidates.map((dish) => {
        let score = 0;
        if (highProtein) score += dish.protein * 1.6;
        if (quick && dish.tags.includes("q")) score += 14;
        if (lowOil && dish.tags.includes("a")) score += 14;
        if (dish.cost > perMealBudget) {
          score -= (dish.cost - perMealBudget) * 0.35;
        }
        if (noteWords.some((w) => dish.name.toLowerCase().includes(w))) {
          score += 18;
        }
        if (used.has(dish.name)) score -= 40;
        score += ((hashString(dish.name) + seed * 7919 + dayIdx * 131) % 17) * 0.9;
        return { dish, score };
      });
      scored.sort((a, b) => b.score - a.score);
      const pick = scored[0]!.dish;
      used.add(pick.name);
      return { slot, dish: pick };
    });

    const rawKcal = meals.reduce((s, m) => s + m.dish.kcal, 0);
    const portion =
      Math.round(Math.min(1.6, Math.max(0.75, targetKcal / rawKcal)) * 20) /
      20;
    return {
      day,
      region,
      meals,
      portion,
      kcal: Math.round(rawKcal * portion),
      protein: Math.round(
        meals.reduce((s, m) => s + m.dish.protein, 0) * portion
      ),
      cost: Math.round(meals.reduce((s, m) => s + m.dish.cost, 0) * portion),
    };
  });
}

/* -------------------------------- Component ------------------------------- */

export function WeeklyMenuBuilder() {
  const [chefName, setChefName] = useState("");
  const [household, setHousehold] = useState("");
  const [macroTarget, setMacroTarget] = useState("2000 kcal • 130g Protein");
  const [regions, setRegions] = useState<RegionId[]>(["north"]);
  const [diet, setDiet] = useState<DietOption[]>(["High-Protein"]);
  const [budget, setBudget] = useState<number>(2500);
  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState<PlannedDay[] | null>(null);
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const people = useMemo(
    () => Math.min(20, parseNumber(household, /(\d+)/, 1)),
    [household]
  );
  const targetKcal = parseNumber(macroTarget, /(\d{3,4})\s*kcal/i, 2000);
  const targetProtein = parseNumber(macroTarget, /(\d{2,3})\s*g/i, 100);

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const build = (nextSeed: number) => {
    if (regions.length === 0) {
      setError("Pick at least one preferred cuisine to build your menu.");
      return;
    }
    setError(null);
    setSeed(nextSeed);
    setPlan(
      generatePlan({
        regions,
        diet,
        targetKcal,
        weeklyBudgetPerPerson: budget / people,
        notes,
        seed: nextSeed,
      })
    );
    requestAnimationFrame(() => {
      document
        .getElementById("weekly-plan-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const weeklyCost = plan
    ? plan.reduce((s, dItem) => s + dItem.cost, 0) * people
    : 0;
  const avgKcal = plan
    ? Math.round(plan.reduce((s, dItem) => s + dItem.kcal, 0) / 7)
    : 0;
  const avgProtein = plan
    ? Math.round(plan.reduce((s, dItem) => s + dItem.protein, 0) / 7)
    : 0;
  const regionLabel = (id: RegionId) =>
    REGIONS.find((r) => r.id === id)?.label ?? id;

  const handleCopy = async () => {
    if (!plan) return;
    const text = [
      `MiseFood 7-Day Menu${chefName ? ` for ${chefName}` : ""} (${people} ${people === 1 ? "person" : "people"})`,
      ...plan.map(
        (p) =>
          `${p.day} — ${regionLabel(p.region)} (${p.kcal} kcal, ${p.protein}g protein)\n` +
          p.meals
            .map((m) => `  ${SLOT_LABEL[m.slot]}: ${m.dish.name}`)
            .join("\n")
      ),
      `Estimated weekly grocery cost: ₹${weeklyCost.toLocaleString("en-IN")}`,
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const inputClass =
    "w-full rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] px-3.5 py-2.5 text-sm text-[#000000] placeholder:text-[#4d4c4c] focus:outline-none focus:border-[#3f6212]";
  const pillClass = (active: boolean) =>
    `btn-press px-3.5 py-1.5 rounded-full text-xs font-medium border ${
      active
        ? "bg-[#3f6212] text-[#fcfcfd] border-[#3f6212]"
        : "bg-[#f1f3e6] text-[#000000] border-[#d3d4c8] hover:border-[#3f6212]"
    }`;

  return (
    <div className="space-y-10">
      {/* ------------------------------ Builder form ----------------------------- */}
      <div className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-xs font-semibold text-[#3f6212]">
              Custom 7-Day Menu Builder
            </span>
            <h1 className="text-[44px] sm:text-[56px] font-medium tracking-[-0.03em] leading-[1.04] text-[#000000]">
              Plan a week of regional Indian meals in one tap.
            </h1>
            <p className="text-[16px] text-[#333333] leading-[1.6]">
              Pick the regions you love, set your daily nutrition target and
              weekly grocery budget, and MiseFood builds breakfast, lunch and
              dinner for all seven days — portioned to your calories.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              build(seed);
            }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="menu-name"
                  className="block text-xs font-semibold text-[#333333]"
                >
                  Your Name
                </label>
                <input
                  id="menu-name"
                  type="text"
                  value={chefName}
                  onChange={(e) => setChefName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="menu-household"
                  className="block text-xs font-semibold text-[#333333]"
                >
                  Household Size
                </label>
                <input
                  id="menu-household"
                  type="text"
                  value={household}
                  onChange={(e) => setHousehold(e.target.value)}
                  placeholder="2 adults • Coimbatore"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="menu-macro"
                  className="block text-xs font-semibold text-[#333333]"
                >
                  Daily Nutrition Target (per person)
                </label>
                <input
                  id="menu-macro"
                  type="text"
                  value={macroTarget}
                  onChange={(e) => setMacroTarget(e.target.value)}
                  placeholder="2000 kcal • 130g Protein"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Preferred cuisines — regional buttons */}
            <fieldset className="space-y-2">
              <legend className="block text-xs font-semibold text-[#333333] mb-2">
                Preferred Cuisines{" "}
                <span className="font-normal text-[#4d4c4c]">
                  (choose one or more — days rotate between them)
                </span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REGIONS.map((r) => {
                  const active = regions.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setRegions((prev) => toggle(prev, r.id))}
                      className={`btn-press text-left rounded-[8px] border px-3.5 py-2.5 flex items-start gap-2.5 ${
                        active
                          ? "bg-[#3f6212] border-[#3f6212] text-[#fcfcfd]"
                          : "bg-[#f1f3e6] border-[#d3d4c8] text-[#000000] hover:border-[#3f6212]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border flex items-center justify-center ${
                          active
                            ? "bg-[#fcfcfd] border-[#fcfcfd] text-[#3f6212]"
                            : "border-[#4d4c4c]"
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">
                          {r.label}
                        </span>
                        <span
                          className={`block text-xs ${
                            active ? "text-[#fcfcfd]" : "text-[#4d4c4c]"
                          }`}
                        >
                          {r.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="block text-xs font-semibold text-[#333333] mb-2">
                Dietary Focus
              </legend>
              <div className="flex flex-wrap gap-2">
                {DIET_OPTIONS.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    aria-pressed={diet.includes(pill)}
                    onClick={() => setDiet((prev) => toggle(prev, pill))}
                    className={pillClass(diet.includes(pill))}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="block text-xs font-semibold text-[#333333] mb-2">
                Weekly Grocery Budget (whole household)
              </legend>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    aria-pressed={budget === b.value}
                    onClick={() => setBudget(b.value)}
                    className={`${pillClass(budget === b.value)} tabular-nums`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label
                htmlFor="menu-notes"
                className="block text-xs font-semibold text-[#333333]"
              >
                Ingredients to use up (optional)
              </label>
              <input
                id="menu-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., paneer, chicken, moong dal"
                className={inputClass}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-[#9a2a12]">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-press w-full py-3.5 px-5 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] text-sm font-medium flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{plan ? "Update My 7-Day Plan" : "Generate 7-Day Plan"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* ------------------------------ Generated plan ---------------------------- */}
      {plan && (
        <div
          id="weekly-plan-result"
          key={`${seed}-${regions.join()}-${diet.join()}-${budget}`}
          className="scroll-mt-28 space-y-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3f6212]">
                Your 7-Day Menu
              </p>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#000000] mt-1">
                {chefName ? `${chefName}'s week` : "Your week"} across{" "}
                {regions.map(regionLabel).join(", ")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => build(seed + 1)}
                className="btn-press px-4 py-2 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] hover:border-[#3f6212] text-xs font-medium text-[#000000] inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#3f6212]" />
                Shuffle dishes
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="btn-press px-4 py-2 rounded-full bg-[#3f6212] text-[#fcfcfd] text-xs font-medium inline-flex items-center gap-1.5"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy plan"}
              </button>
            </div>
          </div>

          {/* Weekly summary */}
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-[8px] overflow-hidden border border-[#d3d4c8] bg-[#d3d4c8]">
            {[
              {
                label: "Avg. calories / day",
                value: `${avgKcal.toLocaleString("en-IN")} kcal`,
                note: `Target ${targetKcal} kcal`,
              },
              {
                label: "Avg. protein / day",
                value: `${avgProtein} g`,
                note:
                  avgProtein >= targetProtein
                    ? `Meets ${targetProtein} g target`
                    : `${targetProtein - avgProtein} g short — add curd or eggs`,
              },
              {
                label: "Weekly grocery cost",
                value: `₹${weeklyCost.toLocaleString("en-IN")}`,
                note: `${people} ${people === 1 ? "person" : "people"}`,
              },
              {
                label: "Budget status",
                value:
                  weeklyCost <= budget
                    ? `₹${(budget - weeklyCost).toLocaleString("en-IN")} under`
                    : `₹${(weeklyCost - budget).toLocaleString("en-IN")} over`,
                note: `Budget ₹${budget.toLocaleString("en-IN")}`,
              },
            ].map((s) => (
              <div key={s.label} className="bg-[#f1f3e6] p-4">
                <dt className="text-xs text-[#4d4c4c]">{s.label}</dt>
                <dd className="text-xl font-semibold text-[#000000] tabular-nums mt-0.5">
                  {s.value}
                </dd>
                <dd className="text-xs text-[#333333] mt-0.5">{s.note}</dd>
              </div>
            ))}
          </dl>

          {/* Day cards */}
          <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {plan.map((p, i) => (
              <li
                key={p.day}
                style={{ animationDelay: `${i * 40}ms` }}
                className="plan-enter rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-4 flex flex-col"
              >
                <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#d3d4c8]">
                  <h3 className="text-base font-semibold text-[#000000]">
                    {p.day}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#3f6212]">
                    {regionLabel(p.region)}
                  </span>
                </div>
                <ul className="py-3 space-y-3 flex-1">
                  {p.meals.map((m) => (
                    <li key={m.slot}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4d4c4c]">
                        {SLOT_LABEL[m.slot]}
                      </p>
                      <p className="text-sm font-medium text-[#000000] leading-snug">
                        {m.dish.name}
                      </p>
                      <p className="text-xs text-[#4d4c4c] tabular-nums">
                        {Math.round(m.dish.kcal * p.portion)} kcal •{" "}
                        {Math.round(m.dish.protein * p.portion)} g protein
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-[#d3d4c8] flex items-center justify-between text-xs tabular-nums">
                  <span className="font-semibold text-[#000000]">
                    {p.kcal} kcal • {p.protein} g
                  </span>
                  <span className="text-[#333333]">
                    ×{p.portion.toFixed(2)} portion
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
