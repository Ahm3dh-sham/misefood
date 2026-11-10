"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  CalendarRange,
  Check,
  Command,
  Flame,
  GitMerge,
  Mic,
  PackageCheck,
  Play,
  Plus,
  ScanText,
  Search,
  Sparkles,
  Timer,
  Volume2,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ActiveTab } from "@/components/layout/AppShell";
import {
  MiseFoodGlyph,
  MiseFoodLogo,
} from "@/components/brand/MiseFoodLogo";
import {
  ParallaxShowcaseFrame,
  ScrollHeadlineReveal,
  ScrollServiceRow,
} from "@/components/landing/ScrollRevealPrimitives";
import {
  ImporterMacbookShowcase,
  KineticTabletShowcase,
  PantryCartAuditShowcase,
  ThaliPlannerDualShowcase,
} from "@/components/landing/ShowcaseMockups";
import type { ActiveCookingTimer, Recipe, UnitSystem } from "@/types/recipe";

const EMIL_EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface EloqwntLandingShellProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unitSystem: UnitSystem;
  onChangeUnitSystem: (sys: UnitSystem) => void;
  onOpenOcrModal: () => void;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  activeTimers: ActiveCookingTimer[];
  onApplyConciergePrompt?: (prompt: string) => void;
  children: React.ReactNode;
}

const CAPABILITY_ROWS: {
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  targetTab: ActiveTab;
  openModal?: boolean;
}[] = [
  {
    number: "01",
    title: "Save from Any Link, Video, or Cookbook Photo",
    subtitle: "Turns reels, food blogs, and handwritten family cards into clean recipes",
    badge: "Import",
    targetTab: "hub",
    openModal: true,
  },
  {
    number: "02",
    title: "Indian Katori, Metric & US Cup Scaling",
    subtitle: "Switch between 150ml katoris, grams, and cups with live ₹ and macro updates",
    badge: "Precision",
    targetTab: "hub",
  },
  {
    number: "03",
    title: "One-Click Dietary Adaptations",
    subtitle: "Adapt any dish to High-Protein, Jain (No Onion-Garlic), Vegan, or Air-Fryer",
    badge: "Adapt",
    targetTab: "hub",
  },
  {
    number: "04",
    title: "Weekly Thali & Macro Meal Planner",
    subtitle: "Balanced Rice + Dal + Sabji + Curd plates tailored to your protein and ₹ budget",
    badge: "Plan",
    targetTab: "planner",
  },
  {
    number: "05",
    title: "Multi-Dish Parallel Cooking Timeline",
    subtitle: "Interleaves active prep and passive simmering so 2–4 dishes finish hot together",
    badge: "Timing",
    targetTab: "kinetic-prep",
  },
  {
    number: "06",
    title: "Hands-Free Voice Chef & 10-Min Grocery Cart",
    subtitle: "Keep your screen awake while cooking and order missing items on Instamart or Blinkit",
    badge: "Kitchen Flow",
    targetTab: "sous-chef",
  },
];

const FAQ_ITEMS: {
  number: string;
  question: string;
  answer: string;
}[] = [
  {
    number: "01",
    question: "How does MiseFood help me cook faster on weeknights?",
    answer:
      "Most recipe apps only store bookmarks. MiseFood turns links or photos into structured ingredients, merges multiple dishes into a single step-by-step timeline so nothing gets cold, and guides you hands-free by voice while you cook.",
  },
  {
    number: "02",
    question: "How does Indian Katori measurement conversion work?",
    answer:
      "A standard household katori holds 150 ml (approx. 150 g for dals, curries, curds, and diced vegetables). You can switch between Katori, Metric (g/ml), and US Cups at any time while calories, protein, and ₹ cost scale automatically.",
  },
  {
    number: "03",
    question: "How does Cook Together coordinate multiple dishes at once?",
    answer:
      "When you select 2 to 4 dishes (for example Dal Tadka, Paneer Tikka, and Jeera Rice), MiseFood spots passive wait windows—like pressure-cooking or marinating—and schedules your chopping and tempering inside them, saving up to 38% of active kitchen time.",
  },
  {
    number: "04",
    question: "Can I adapt a recipe to be Jain-friendly or High-Protein?",
    answer:
      "Yes. On any recipe, use the one-click adaptation pills to boost protein (+40%), make it Jain-friendly (replacing onion and garlic with hing, ginger, and fennel), make it plant-based, or convert deep-frying to an air-fryer.",
  },
  {
    number: "05",
    question: "How do quick-commerce grocery links work?",
    answer:
      "Your weekly meal plan combines duplicate ingredients across all 7 days, organizes them by aisle, and lets you open any item directly in Swiggy Instamart, Blinkit, Zepto, or BigBasket.",
  },
  {
    number: "06",
    question: "Will my phone screen turn off while using Voice Chef?",
    answer:
      "No. Voice Chef keeps your screen awake while you cook so you never have to touch your phone with messy hands, and listens for simple commands like 'Next step', 'Repeat', or 'Set a timer for 8 minutes'.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "“Cooking a full North Indian dinner on a Tuesday night used to take 75 minutes and three cold pans. MiseFood overlapped the pressure-cooker window with my air-fryer paneer—everything hit the table hot in 42 minutes.”",
    author: "Ananya Krishnan",
    role: "Home Chef, Bengaluru",
  },
  {
    quote:
      "“Adapting saved Instagram Reels to Jain and High-Protein in one click is a lifesaver. My parents get their no-onion-garlic dal while I hit 135g daily protein under ₹2,400 a week.”",
    author: "Rohan Mehta",
    role: "Product Designer, Mumbai",
  },
  {
    quote:
      "“Scanning my grandmother's handwritten masala card into katori measurements and sending the missing spices straight to Blinkit saved our Sunday family lunch.”",
    author: "Meera Nair",
    role: "Food Writer, Kochi",
  },
];

export function EloqwntLandingShell({
  activeTab,
  onSelectTab,
  unitSystem,
  onChangeUnitSystem,
  onOpenOcrModal,
  recipes,
  onSelectRecipe,
  activeTimers,
  onApplyConciergePrompt,
  children,
}: EloqwntLandingShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [showreelPlaying, setShowreelPlaying] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Interactive Meal Concierge state
  const [chefName, setChefName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [macroTarget, setMacroTarget] = useState("2000 kcal • 130g Protein");
  const [cuisinePref, setCuisinePref] = useState("Indian Thali + Global");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "High-Protein",
    "Indian Thali",
  ]);
  const [selectedBudget, setSelectedBudget] = useState("₹1.5k – ₹2.5k");
  const [conciergePrompt, setConciergePrompt] = useState("");
  const [conciergeSubmitted, setConciergeSubmitted] = useState(false);

  const studioSectionRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const footerInView = useInView(footerRef, {
    once: true,
    margin: "-8% 0px -8% 0px",
  });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const jumpToStudioTab = (tab: ActiveTab, openOcr = false) => {
    onSelectTab(tab);
    if (openOcr) {
      onOpenOcrModal();
      return;
    }
    studioSectionRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConciergeSubmitted(true);

    // Build a natural prompt from the user's selections so the planner solves their exact inputs
    const budgetNumeric =
      selectedBudget === "< ₹1.5k"
        ? "₹1500"
        : selectedBudget === "₹1.5k – ₹2.5k"
          ? "₹2400"
          : selectedBudget === "₹2.5k – ₹4k"
            ? "₹3500"
            : "₹4500";

    const builtPrompt = [
      `Plan a 7-day ${cuisinePref} menu`,
      macroTarget ? `targeting ${macroTarget}` : "",
      `under ${budgetNumeric} weekly budget`,
      selectedInterests.length > 0
        ? `with ${selectedInterests.join(", ")}`
        : "",
      conciergePrompt.trim() ? `(${conciergePrompt.trim()})` : "",
    ]
      .filter(Boolean)
      .join(" ");

    onApplyConciergePrompt?.(builtPrompt);

    setTimeout(() => {
      jumpToStudioTab("planner");
      setConciergeSubmitted(false);
    }, 300);
  };

  const filteredRecipes = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      r.ingredients.some((i) =>
        i.name.toLowerCase().includes(cmdQuery.toLowerCase())
      )
  );

  const studioTabs: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "hub",
      label: "Recipes",
      icon: <Flame className="h-3.5 w-3.5" />,
    },
    {
      id: "planner",
      label: "Meal Plan",
      icon: <CalendarRange className="h-3.5 w-3.5" />,
    },
    {
      id: "kinetic-prep",
      label: "Cook Together",
      icon: <GitMerge className="h-3.5 w-3.5" />,
    },
    {
      id: "sous-chef",
      label: "Voice Chef",
      icon: <Mic className="h-3.5 w-3.5" />,
    },
    {
      id: "pantry",
      label: "Pantry",
      icon: <PackageCheck className="h-3.5 w-3.5" />,
    },
    {
      id: "social",
      label: "Cookbooks",
      icon: <BookOpen className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div
      id="top"
      className="min-h-screen bg-[#ECEEF0] text-zinc-950 selection:bg-zinc-950 selection:text-white"
    >
      {/* Minimalist Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#ECEEF0]/90 backdrop-blur-xl border-b border-zinc-200/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="#top" className="flex items-center gap-2.5 group shrink-0">
              <MiseFoodLogo
                variant="crown-katori"
                size={36}
                showWordmark={true}
                theme="light"
              />
            </a>

            {/* Primary Navigation Tabs right in the header for effortless 1-click access */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/80 p-1 rounded-full border border-zinc-200/80">
              {studioTabs.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToStudioTab(item.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.97] ${
                      isActive
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.id === "sous-chef" && activeTimers.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
                        <Timer className="h-2.5 w-2.5" />
                        {activeTimers.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Compact Unit System Pill */}
            <div className="hidden sm:flex items-center bg-white/90 p-1 rounded-full border border-zinc-200/80 text-[11px]">
              {(
                [
                  { id: "indian", label: "Katori" },
                  { id: "metric", label: "Metric" },
                  { id: "imperial", label: "US" },
                ] as const
              ).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onChangeUnitSystem(u.id)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors active:scale-[0.97] ${
                    unitSystem === u.id
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/80 text-xs text-zinc-600 hover:text-zinc-950 active:scale-[0.97]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-500 flex items-center gap-0.5">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenOcrModal}
              className="px-4 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
            >
              <ScanText className="h-3.5 w-3.5" />
              <span>Import Recipe</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-16 space-y-8">
        {/* =====================================================================
            PRIMARY CULINARY WORKSPACE FIRST — Clean White Floating Island Sheet
           ===================================================================== */}
        <section
          id="live-studio"
          ref={studioSectionRef as React.RefObject<HTMLElement>}
          className="rounded-[32px] sm:rounded-[40px] bg-white p-5 sm:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-20"
        >
          {/* Mobile / Tablet Navigation Bar + Workspace Context */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/80">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {studioTabs.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shrink-0 transition-all duration-150 active:scale-[0.97] ${
                      isActive
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "bg-[#F6F6F4] text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.id === "sous-chef" && activeTimers.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                        <Timer className="h-2.5 w-2.5" />
                        {activeTimers.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500">
              <a
                href="#story"
                className="hover:text-zinc-950 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#faq"
                className="hover:text-zinc-950 transition-colors"
              >
                FAQ
              </a>
              <a
                href="#concierge"
                className="hover:text-zinc-950 transition-colors"
              >
                Custom Plan
              </a>
            </div>
          </div>

          {/* Active Culinary Module Content */}
          <div>{children}</div>
        </section>

        {/* =====================================================================
            EDITORIAL STORY & INTERACTIVE KITCHEN TOUR SHEET
           ===================================================================== */}
        <section
          id="story"
          className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)] scroll-mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Interactive Kitchen Tour */}
            <div className="lg:col-span-5">
              <div className="rounded-[26px] bg-[#F6F6F4] p-3.5 sm:p-4 space-y-3 border border-zinc-200/60">
                <div
                  onClick={() => setShowreelPlaying((prev) => !prev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setShowreelPlaying((prev) => !prev);
                  }}
                  className="group relative rounded-[18px] bg-[#141210] aspect-[16/10] overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(200,90,50,0.22),transparent_55%),radial-gradient(circle_at_75%_75%,rgba(224,159,62,0.18),transparent_55%)]" />

                  {!showreelPlaying ? (
                    <>
                      <span className="text-base sm:text-lg font-medium tracking-tight text-white/90 select-none">
                        See how MiseFood works
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl transition-transform duration-200 ease-emil-out group-hover:scale-105 active:scale-95">
                          <Play className="h-5 w-5 fill-zinc-950 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-white/80">
                        01:24 • Kitchen Walkthrough
                      </div>
                    </>
                  ) : (
                    <div className="relative z-10 w-full h-full p-5 flex flex-col justify-between text-white bg-black/60 backdrop-blur-sm">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                          VOICE CHEF WALKTHROUGH
                        </span>
                        <span className="text-zinc-400">Click to pause</span>
                      </div>
                      <div className="space-y-2 my-auto">
                        <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                          Step 2 of 4 • Smart Overlap
                        </p>
                        <p className="text-sm sm:text-base font-medium leading-snug">
                          “While the Toor Dal pressure-cooks for 12 minutes,
                          air-fry your marinated Malai Paneer cubes at 200°C.”
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                        <span className="text-zinc-300">
                          1.67 Katori (250g) Paneer • ₹115
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            jumpToStudioTab("sous-chef");
                          }}
                          className="px-3 py-1 rounded-full bg-white text-zinc-950 font-semibold text-[11px]"
                        >
                          Try Voice Chef →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1.5 pt-1 pb-0.5">
                  <span className="text-sm font-medium text-zinc-950">
                    Kitchen Flow Preview
                  </span>
                  <span className="text-xs text-zinc-500">
                    Save • Scale • Cook Together
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Headline & Clear Value Proposition */}
            <div className="lg:col-span-7 lg:pl-6 space-y-6">
              <ScrollHeadlineReveal
                as="h2"
                className="text-3xl sm:text-4xl lg:text-[44px]"
                lines={[
                  "Every home kitchen hits the",
                  "same gap — between what you",
                  "save and what lands hot on the table.",
                ]}
              />

              <div className="space-y-4 text-sm sm:text-[15px] text-zinc-600 leading-[1.68] max-w-2xl">
                <p>
                  MiseFood is built for everyday home cooking—whether you are
                  preparing weeknight tiffins, hitting daily protein goals,
                  cooking a Sunday family thali, or turning fridge leftovers
                  into dinner.
                </p>
                <p>
                  Bring recipes from any link or handwritten card, switch
                  effortlessly between Indian katoris and grams, coordinate
                  multiple dishes so they finish hot at the same minute, and
                  cook hands-free with voice guidance.
                </p>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => jumpToStudioTab("kinetic-prep")}
                  className="px-6 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium inline-flex items-center gap-3 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                >
                  <span>Cook Multiple Dishes Together</span>
                  <span className="h-2 w-2 rounded-full bg-white" />
                </button>

                <button
                  type="button"
                  onClick={onOpenOcrModal}
                  className="px-5 py-3.5 rounded-full bg-[#F6F6F4] hover:bg-zinc-200/80 text-zinc-900 text-sm font-medium inline-flex items-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                >
                  <ScanText className="h-4 w-4" />
                  <span>Import from Link or Photo</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION HEADER: CORE FEATURES
           ===================================================================== */}
        <div
          id="selected-work"
          className="pt-10 pb-4 px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className="lg:col-span-5 flex items-center gap-2.5 text-sm font-medium text-zinc-900 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
            <span>Designed for Home Cooks</span>
          </div>
          <div className="lg:col-span-7">
            <ScrollHeadlineReveal
              className="text-3xl sm:text-4xl lg:text-[42px]"
              lines={[
                "Four tools that bring calm and",
                "precision to your daily cooking.",
              ]}
            />
          </div>
        </div>

        {/* =====================================================================
            SHEET 2: 4 ALTERNATING CULINARY SHOWCASES
           ===================================================================== */}
        <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-20 lg:space-y-28">
          {/* SHOWCASE 1: Recipe Import & Adaptation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C85A32]" />
                  <span>Recipe Import &amp; Scaling</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  Import &amp; Adapt
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  Save recipes from blogs, YouTube videos, Instagram Reels, or
                  photos of handwritten family cards. Automatically convert
                  measurements into Indian katoris or grams and adapt any dish
                  to Jain, High-Protein, Vegan, or Air-Fryer in one click.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      150ml
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      STANDARD KATORI SCALE
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      4 Modes
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      1-CLICK DIET ADAPTATION
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      -65%
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      OIL IN AIR-FRYER MODE
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => jumpToStudioTab("hub")}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-950 hover:text-zinc-600 transition-colors"
                >
                  <span>Open Recipes</span>
                  <span className="transition-transform duration-200 ease-emil-out group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ParallaxShowcaseFrame>
                <ImporterMacbookShowcase
                  onLaunch={() => jumpToStudioTab("hub")}
                />
              </ParallaxShowcaseFrame>
            </div>
          </div>

          {/* SHOWCASE 2: Multi-Dish Parallel Cooking */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <ParallaxShowcaseFrame>
                <KineticTabletShowcase
                  onLaunch={() => jumpToStudioTab("kinetic-prep")}
                />
              </ParallaxShowcaseFrame>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-between space-y-8 lg:pl-4">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C85A32]" />
                  <span>Multi-Dish Timing</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  Cook Together
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  Cooking Dal, Paneer, and Rice at the same time? Select 2 to 4
                  recipes and MiseFood weaves them into one coordinated
                  timeline—slotting chopping and tempering inside passive
                  simmering windows so everything finishes hot together.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      42m
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      3-DISH COMBINED TIME
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      38%
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      FASTER THAN SEQUENTIAL
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      4 Dishes
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      READY AT ONCE
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => jumpToStudioTab("kinetic-prep")}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-950 hover:text-zinc-600 transition-colors"
                >
                  <span>Try Cook Together</span>
                  <span className="transition-transform duration-200 ease-emil-out group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* SHOWCASE 3: Weekly Thali & Macro Planner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C85A32]" />
                  <span>Weekly Nutrition &amp; Budget</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  Thali Planner
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  Plan a complete 7-day menu around full Indian thalis
                  (Rice/Roti + Dal + Sabji + Curd) or quick single-bowl meals,
                  balanced automatically for your daily protein target and
                  weekly grocery budget.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      130g+
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      DAILY PROTEIN GOAL
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      ₹2.5k
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      WEEKLY BUDGET TARGET
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      4-Part
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      COMPLETE THALI PLATES
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => jumpToStudioTab("planner")}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-950 hover:text-zinc-600 transition-colors"
                >
                  <span>Open Meal Plan</span>
                  <span className="transition-transform duration-200 ease-emil-out group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ParallaxShowcaseFrame>
                <ThaliPlannerDualShowcase
                  onLaunch={() => jumpToStudioTab("planner")}
                />
              </ParallaxShowcaseFrame>
            </div>
          </div>

          {/* SHOWCASE 4: Pantry & 10-Min Grocery Cart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <ParallaxShowcaseFrame>
                <PantryCartAuditShowcase
                  onLaunch={() => jumpToStudioTab("pantry")}
                />
              </ParallaxShowcaseFrame>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-between space-y-8 lg:pl-4">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C85A32]" />
                  <span>Zero-Waste Kitchen &amp; Groceries</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  Pantry &amp; Cart
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  Keep track of what is in your fridge, prioritize ingredients
                  expiring soon, and export combined grocery lists straight to
                  Swiggy Instamart, Blinkit, Zepto, or BigBasket.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      Zero
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      FRIDGE WASTE GOAL
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      4 Apps
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      QUICK-COMMERCE LINKS
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      ₹660
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      AVG WEEKLY SAVINGS
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => jumpToStudioTab("pantry")}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-950 hover:text-zinc-600 transition-colors"
                >
                  <span>Check My Pantry</span>
                  <span className="transition-transform duration-200 ease-emil-out group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SHEET 3: NUMBERED 01-06 CAPABILITIES OVERVIEW
           ===================================================================== */}
        <section
          id="capabilities"
          className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        >
          <div className="divide-y divide-transparent">
            {CAPABILITY_ROWS.map((row, index) => (
              <ScrollServiceRow
                key={row.number}
                number={row.number}
                title={row.title}
                subtitle={row.subtitle}
                badge={row.badge}
                index={index}
                onSelect={() =>
                  jumpToStudioTab(row.targetTab, Boolean(row.openModal))
                }
              />
            ))}
          </div>
        </section>

        {/* =====================================================================
            SHEET 4: FAQ ACCORDION ISLAND SHEET
           ===================================================================== */}
        <section
          id="faq"
          className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)] scroll-mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-900">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                <span>FAQ</span>
              </div>
              <ScrollHeadlineReveal
                className="text-3xl sm:text-5xl"
                lines={["Frequently", "Asked Questions"]}
              />
              <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                Common questions about katori measurements, cooking multiple
                dishes together, voice guidance, and grocery delivery links.
              </p>
            </div>

            <div className="lg:col-span-7 divide-y divide-zinc-200">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.number} className="py-6 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                      }
                      className="w-full text-left flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-baseline gap-6 sm:gap-12 pr-4">
                        <span className="font-mono text-xs text-zinc-400 shrink-0">
                          {item.number}
                        </span>
                        <span className="text-lg sm:text-xl font-normal tracking-[-0.02em] text-zinc-950 group-hover:text-zinc-700 transition-colors">
                          {item.question}
                        </span>
                      </div>

                      <span
                        className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ease-emil-out ${
                          isOpen
                            ? "bg-zinc-950 text-white rotate-45"
                            : "bg-[#F6F6F4] text-zinc-900 group-hover:bg-zinc-200"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>

                    {isOpen && (
                      <motion.div
                        initial={
                          reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: EMIL_EASE_OUT }}
                        className="pl-10 sm:pl-16 pr-12 pt-3 text-sm text-zinc-600 leading-relaxed"
                      >
                        {item.answer}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            HOME CHEF STORIES CAROUSEL
           ===================================================================== */}
        <div className="px-2 sm:px-6 py-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm sm:text-base text-zinc-700 max-w-3xl italic">
              {TESTIMONIALS[testimonialIdx]?.quote}
            </p>
            <div className="text-xs text-zinc-500 shrink-0">
              <span className="font-semibold text-zinc-900">
                {TESTIMONIALS[testimonialIdx]?.author}
              </span>{" "}
              — {TESTIMONIALS[testimonialIdx]?.role}
            </div>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 h-0.5 bg-zinc-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-950 transition-all duration-300 ease-emil-out"
                style={{
                  width: `${((testimonialIdx + 1) / TESTIMONIALS.length) * 100}%`,
                }}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() =>
                  setTestimonialIdx((prev) =>
                    prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
                  )
                }
                className="h-10 w-10 rounded-full bg-white hover:bg-zinc-950 hover:text-white text-zinc-900 flex items-center justify-center shadow-sm transition-colors active:scale-95"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() =>
                  setTestimonialIdx(
                    (prev) => (prev + 1) % TESTIMONIALS.length
                  )
                }
                className="h-10 w-10 rounded-full bg-white hover:bg-zinc-950 hover:text-white text-zinc-900 flex items-center justify-center shadow-sm transition-colors active:scale-95"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================
            SHEET 5: PERSONALIZED WEEKLY MEAL PLANNER FORM
           ===================================================================== */}
        <section
          id="concierge"
          className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)] scroll-mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <span className="inline-block px-4 py-1.5 rounded-full border border-zinc-200 text-xs text-zinc-500">
                  Personalized Weekly Menu
                </span>
                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] leading-[1.1] text-zinc-950">
                  Plan your week around your taste &amp; goals.
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                  Share your household size, protein targets, and weekly grocery
                  budget to build a custom 7-day meal plan and shopping list.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleConciergeSubmit}
              className="lg:col-span-7 space-y-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 border-b border-zinc-200 pb-2.5">
                  <label className="block text-xs text-zinc-500">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={chefName}
                    onChange={(e) => setChefName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 border-b border-zinc-200 pb-2.5">
                  <label className="block text-xs text-zinc-500">
                    Household Size
                  </label>
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="4 Adults • Bengaluru"
                    className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 border-b border-zinc-200 pb-2.5">
                  <label className="block text-xs text-zinc-500">
                    Daily Nutrition Goal
                  </label>
                  <input
                    type="text"
                    value={macroTarget}
                    onChange={(e) => setMacroTarget(e.target.value)}
                    placeholder="2000 kcal • 130g Protein"
                    className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 border-b border-zinc-200 pb-2.5">
                  <label className="block text-xs text-zinc-500">
                    Preferred Cuisines
                  </label>
                  <input
                    type="text"
                    value={cuisinePref}
                    onChange={(e) => setCuisinePref(e.target.value)}
                    placeholder="Indian Thali + Mediterranean"
                    className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs text-zinc-500">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "High-Protein",
                    "Indian Thali",
                    "Jain (No Onion-Garlic)",
                    "Quick 25-Min Meals",
                    "Plant-Based",
                    "Low-Oil Air-Fryer",
                  ].map((pill) => {
                    const active = selectedInterests.includes(pill);
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => toggleInterest(pill)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-150 active:scale-[0.97] ${
                          active
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        {pill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs text-zinc-500">
                  Weekly Grocery Budget (INR)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["< ₹1.5k", "₹1.5k – ₹2.5k", "₹2.5k – ₹4k", "₹4k+"].map(
                    (b) => {
                      const active = selectedBudget === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBudget(b)}
                          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-150 active:scale-[0.97] ${
                            active
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          {b}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="space-y-2 border-b border-zinc-200 pb-3">
                <label className="block text-xs text-zinc-500">
                  Ingredients on hand or special notes
                </label>
                <textarea
                  rows={2}
                  value={conciergePrompt}
                  onChange={(e) => setConciergePrompt(e.target.value)}
                  placeholder="e.g., Use 250g paneer on Tuesday, lighter dinners on weekdays..."
                  className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-300 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.99]"
              >
                {conciergeSubmitted ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Building Your 7-Day Meal Plan...</span>
                  </>
                ) : (
                  <span>Build My 7-Day Meal Plan</span>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* =====================================================================
            MINIMALIST FOOTER ON #ECEEF0
           ===================================================================== */}
        <footer ref={footerRef} className="pt-12 pb-8 px-2 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 pb-12">
            <div className="col-span-1 md:col-span-3 space-y-3">
              <p className="text-xs font-semibold text-zinc-950">Kitchen</p>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Recipes", tab: "hub" as ActiveTab },
                  { label: "Weekly Meal Plan", tab: "planner" as ActiveTab },
                  { label: "Cook Together", tab: "kinetic-prep" as ActiveTab },
                  { label: "Voice Chef", tab: "sous-chef" as ActiveTab },
                  { label: "My Pantry", tab: "pantry" as ActiveTab },
                  { label: "Cookbooks", tab: "social" as ActiveTab },
                ].map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={
                      reduceMotion ? { opacity: 0.2 } : { opacity: 0.15, y: 6 }
                    }
                    animate={
                      footerInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0.15, y: 6 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion ? 0 : i * 0.045,
                      ease: EMIL_EASE_OUT,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => jumpToStudioTab(item.tab)}
                      className="text-zinc-600 hover:text-zinc-950 transition-colors"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 md:col-span-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-950">
                Dietary Styles
              </p>
              <ul className="space-y-2 text-sm text-zinc-600">
                {[
                  "North & South Indian Thalis",
                  "High-Protein Home Meals",
                  "Jain (No Onion-Garlic)",
                  "Plant-Based & Vegan",
                  "Low-Oil Air-Fryer Recipes",
                  "20-Minute Weeknight Tiffins",
                ].map((label, i) => (
                  <motion.li
                    key={label}
                    initial={
                      reduceMotion ? { opacity: 0.2 } : { opacity: 0.15, y: 6 }
                    }
                    animate={
                      footerInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0.15, y: 6 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion ? 0 : i * 0.045 + 0.05,
                      ease: EMIL_EASE_OUT,
                    }}
                  >
                    {label}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-5 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-zinc-950">
                  Import a recipe from any link
                </p>
                <div className="flex items-center border-b border-zinc-300 pb-2.5">
                  <input
                    type="text"
                    placeholder="Paste a YouTube, Instagram Reel, or blog link..."
                    onFocus={onOpenOcrModal}
                    readOnly
                    className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={onOpenOcrModal}
                    className="text-zinc-950 hover:translate-x-1 transition-transform text-lg px-1"
                  >
                    →
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Automatically formats ingredients into Indian katoris, grams,
                  and US cups.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-300/80 flex flex-wrap items-center justify-between gap-4">
            <a href="#top" className="inline-flex items-center gap-2.5">
              <MiseFoodGlyph variant="crown-katori" size={34} />
              <span className="text-2xl font-switzer font-bold tracking-[-0.04em] text-[#1E1916]">
                misefood
              </span>
            </a>

            <p className="text-xs text-zinc-500">
              © 2026 MiseFood. Thoughtfully crafted for home kitchens.
            </p>

            <button
              type="button"
              aria-label="Scroll to top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: reduceMotion ? "auto" : "smooth",
                })
              }
              className="h-11 w-11 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white flex items-center justify-center shadow-md transition-transform duration-150 ease-emil-out hover:scale-105 active:scale-95"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>

      {/* Instant Command Palette (Zero animation on keyboard trigger) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200">
              <Search className="h-4 w-4 text-zinc-900" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search recipes, ingredients, or kitchen tools..."
                className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 hover:text-zinc-950"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-zinc-100">
              <div className="pb-2">
                <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                  Quick Actions
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    onOpenOcrModal();
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-sm text-zinc-900 hover:bg-zinc-100 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#C85A32]" />
                    Import Recipe from Link or Cookbook Photo
                  </span>
                  <span className="text-xs text-zinc-400">Import</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    jumpToStudioTab("kinetic-prep");
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-sm text-zinc-900 hover:bg-zinc-100 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <GitMerge className="h-4 w-4 text-zinc-700" />
                    Cook 2–4 Dishes Together
                  </span>
                  <span className="text-xs text-zinc-400">Timeline</span>
                </button>
              </div>
              <div className="pt-2">
                <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                  Recipes ({filteredRecipes.length})
                </p>
                {filteredRecipes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onSelectRecipe(r);
                      setCmdOpen(false);
                      jumpToStudioTab("hub");
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-sm text-zinc-900 hover:bg-zinc-100 flex items-center justify-between"
                  >
                    <span className="truncate pr-3 font-medium">{r.title}</span>
                    <span className="text-xs text-zinc-500 shrink-0 font-mono">
                      ₹{r.estimated_total_cost_inr} • {r.cuisine}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
