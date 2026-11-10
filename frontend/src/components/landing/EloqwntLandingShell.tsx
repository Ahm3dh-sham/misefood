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
  Scale,
  ScanText,
  Search,
  Sparkles,
  Timer,
  Volume2,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ActiveTab } from "@/components/layout/AppShell";
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
    title: "Universal URL, YouTube & Reel Importer",
    subtitle: "Strips blog fluff & video transcripts into structured recipes",
    badge: "Module 01",
    targetTab: "hub",
    openModal: true,
  },
  {
    number: "02",
    title: "Handwritten & Cookbook Vision OCR",
    subtitle: "Tesseract.js + Gemini 3.8 Flash multimodal family card parser",
    badge: "Vision OCR",
    targetTab: "hub",
    openModal: true,
  },
  {
    number: "03",
    title: "Katori, Metric & US Imperial Converter",
    subtitle: "150ml Indian katori scaling with live macro & ₹ recalculation",
    badge: "Unit Engine",
    targetTab: "hub",
  },
  {
    number: "04",
    title: "1-Click AI Dietary & Technique Remix",
    subtitle: "High-Protein, Jain (No Onion-Garlic), Vegan & Air-Fryer modes",
    badge: "LangGraph",
    targetTab: "hub",
  },
  {
    number: "05",
    title: "Multi-Slot Indian Thali & Macro Planner",
    subtitle: "Rice + Dal + Sabji + Curd composite calendar & ₹ budget solver",
    badge: "Module 02",
    targetTab: "planner",
  },
  {
    number: "06",
    title: "Kinetic Loop Parallel Prep Timeline",
    subtitle: "Interleaves 2–4 recipes into a unified active/passive Gantt DAG",
    badge: "Module 03",
    targetTab: "kinetic-prep",
  },
  {
    number: "07",
    title: "Hands-Free Voice AI Sous Chef",
    subtitle: "Screen Wake-Lock, concurrent floating timers & Web Speech loop",
    badge: "Module 04",
    targetTab: "sous-chef",
  },
  {
    number: "08",
    title: "Pantry Rescue, Quick-Commerce & Cookbooks",
    subtitle: "pgvector leftover match + Instamart, Blinkit, Zepto & BigBasket",
    badge: "Modules 05–07",
    targetTab: "pantry",
  },
];

const FAQ_ITEMS: {
  number: string;
  question: string;
  answer: string;
}[] = [
  {
    number: "01",
    question: "What does MiseFood do differently from a recipe app?",
    answer:
      "Most recipe apps stop at saving bookmarks. MiseFood bridges the execution gap: it normalizes every ingredient into strict gram/katori schemas, schedules 2 to 4 dishes into a single parallel Gantt timeline so everything finishes hot together, and guides you hands-free via voice while you cook.",
  },
  {
    number: "02",
    question: "How does Indian Kitchen Metric (Katori) conversion work?",
    answer:
      "A standard Indian household katori holds 150 ml (approx. 150 g for dals, curries, curds, and diced paneer/vegetables). You can toggle instantaneously between Indian (katori/tbsp/pinch), Metric (g/ml), and US Imperial (oz/cup) while preserving exact calories, protein, and ₹ cost.",
  },
  {
    number: "03",
    question: "How does the Kinetic Loop Parallel Meal Prep scheduler work?",
    answer:
      "When you select 2 to 4 recipes (for example Dal Tadka, Air-Fryer Paneer Tikka, and Jeera Rice), our LangGraph dependency scheduler identifies passive wait windows (marinating, pressure cooking, simmering) and slots active chopping and tadka tempering inside them — cutting total kitchen time by up to 38%.",
  },
  {
    number: "04",
    question: "Can I remix a recipe to be Jain-friendly or High-Protein in one click?",
    answer:
      "Yes. Inside the Recipe Studio, 1-click AI Remix pills transform any dish into High-Protein (+40% protein via paneer/soya/Greek curd), Jain-friendly (removing onion, garlic, and root tubers in favor of hing, ginger, and fennel), Vegan, or an Air-Fryer version (-65% oil).",
  },
  {
    number: "05",
    question: "How does Quick-Commerce cart export work for Indian households?",
    answer:
      "Our grocery engine aggregates and de-duplicates ingredients across your entire 7-day meal plan (merging 2 onions on Tuesday + 1.5 onions on Friday into 3.5 onions), groups them by supermarket aisle, and generates one-click search deep-links for Swiggy Instamart, Blinkit, Zepto, and BigBasket.",
  },
  {
    number: "06",
    question: "Does Hands-Free Voice Sous Chef keep my phone screen awake?",
    answer:
      "Yes. Voice Sous Chef engages the browser Screen Wake Lock API so your display never dims while your hands are covered in dough or masala, and listens continuously for commands like 'Next step', 'Repeat', 'How much cumin?', or 'Set a timer for 8 minutes'.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "“Cooking a 4-part North Indian thali on a Tuesday night used to take 75 minutes and three cold pans. Kinetic Loop interleaved the pressure cooker window with my air-fryer paneer — everything hit the table hot in 42 minutes.”",
    author: "Ananya Krishnan",
    role: "Product Lead & Home Chef, Bengaluru",
  },
  {
    quote:
      "“The 1-click Jain & High-Protein remix on imported Instagram Reels is magic. My parents get their no-onion-garlic dal while I hit 135g daily protein under ₹2,400 a week.”",
    author: "Rohan Mehta",
    role: "Founder, Mumbai",
  },
  {
    quote:
      "“Scanning my grandmother's handwritten masala card into normalized katori measurements and exporting the missing spices straight to Blinkit saved our Sunday family lunch.”",
    author: "Meera Nair",
    role: "Culinary Creator, Kochi",
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
  children,
}: EloqwntLandingShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [showreelPlaying, setShowreelPlaying] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Interactive "Tell us about your next stage" AI Concierge state
  const [chefName, setChefName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [macroTarget, setMacroTarget] = useState("2000 kcal • 130g Protein");
  const [cuisinePref, setCuisinePref] = useState("Indian Thali + Global");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "High-Protein Remix",
    "Indian Thali Slots",
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

  // Emil Kowalski rule: Never animate keyboard-initiated command palette toggles
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
    setTimeout(() => {
      jumpToStudioTab("planner");
    }, 350);
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
    shortNum: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "hub",
      shortNum: "01",
      label: "Recipe Studio & AI Remix",
      icon: <Flame className="h-3.5 w-3.5" />,
    },
    {
      id: "planner",
      shortNum: "02",
      label: "Thali Planner & Quick Cart",
      icon: <CalendarRange className="h-3.5 w-3.5" />,
    },
    {
      id: "kinetic-prep",
      shortNum: "03",
      label: "Kinetic Prep DAG",
      icon: <GitMerge className="h-3.5 w-3.5" />,
    },
    {
      id: "sous-chef",
      shortNum: "04",
      label: "Voice Sous Chef",
      icon: <Mic className="h-3.5 w-3.5" />,
    },
    {
      id: "pantry",
      shortNum: "05",
      label: "Pantry & Barcode Rescue",
      icon: <PackageCheck className="h-3.5 w-3.5" />,
    },
    {
      id: "social",
      shortNum: "07",
      label: "Cookbooks & Communities",
      icon: <BookOpen className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div
      id="top"
      className="min-h-screen bg-[#ECEEF0] text-zinc-950 selection:bg-zinc-950 selection:text-white"
    >
      {/* Minimalist Architectural Sticky Top Bar on #ECEEF0 */}
      <header className="sticky top-0 z-40 bg-[#ECEEF0]/85 backdrop-blur-xl border-b border-zinc-300/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a
              href="#top"
              className="text-xl font-bold tracking-[-0.04em] text-zinc-950 flex items-center gap-1.5"
            >
              <span>misefood</span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
            </a>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-zinc-600">
              <a
                href="#selected-work"
                className="hover:text-zinc-950 transition-colors"
              >
                Selected Modules
              </a>
              <a
                href="#capabilities"
                className="hover:text-zinc-950 transition-colors"
              >
                Capabilities (08)
              </a>
              <a
                href="#live-studio"
                className="hover:text-zinc-950 transition-colors flex items-center gap-1.5 text-zinc-950 font-semibold"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Studio
              </a>
              <a href="#faq" className="hover:text-zinc-950 transition-colors">
                FAQ
              </a>
              <a
                href="#concierge"
                className="hover:text-zinc-950 transition-colors"
              >
                AI Concierge
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Unit Switcher Pill (Indian Katori / Metric / US) */}
            <div className="hidden sm:flex items-center bg-white/90 p-1 rounded-full border border-zinc-200/90 text-[11px] shadow-sm">
              <Scale className="h-3 w-3 text-zinc-500 ml-2 mr-1" />
              {(
                [
                  { id: "indian", label: "Katori (IN)" },
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
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/90 text-xs text-zinc-600 hover:text-zinc-950 shadow-sm active:scale-[0.97]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600 flex items-center gap-0.5">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenOcrModal}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-zinc-50 text-zinc-950 border border-zinc-300/90 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-transform duration-150 ease-emil-out active:scale-[0.97]"
            >
              <ScanText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import Recipe</span>
              <span className="sm:hidden">Import</span>
            </button>

            <button
              type="button"
              onClick={() => jumpToStudioTab("hub")}
              className="px-4 sm:px-5 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-2.5 shadow-sm transition-transform duration-150 ease-emil-out active:scale-[0.97]"
            >
              <span>Open Studio</span>
              <span className="h-2 w-2 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-16 space-y-6">
        {/* =====================================================================
            SHEET 1 (00:00): HERO & SHOWREEL FLOATING WHITE ISLAND SHEET
           ===================================================================== */}
        <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Showreel Container matching 00:00 */}
            <div className="lg:col-span-5">
              <div className="rounded-[26px] bg-[#F2F3F5] p-3.5 sm:p-4 space-y-3">
                <div
                  onClick={() => setShowreelPlaying((prev) => !prev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setShowreelPlaying((prev) => !prev);
                  }}
                  className="group relative rounded-[18px] bg-[#07080A] aspect-[16/10] overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {/* Subtle dark topographic/culinary ambient glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(245,158,11,0.18),transparent_55%),radial-gradient(circle_at_75%_75%,rgba(244,63,94,0.16),transparent_55%)]" />

                  {!showreelPlaying ? (
                    <>
                      <span className="text-base sm:text-lg font-medium tracking-tight text-white/80 select-none">
                        Hi, we&apos;re misefood.
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl transition-transform duration-200 ease-emil-out group-hover:scale-105 active:scale-95">
                          <Play className="h-5 w-5 fill-zinc-950 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-white/80">
                        01:24 • 4K Tour
                      </div>
                    </>
                  ) : (
                    <div className="relative z-10 w-full h-full p-5 flex flex-col justify-between text-white bg-black/60 backdrop-blur-sm">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                          LIVE AI SOUS CHEF TOUR
                        </span>
                        <span className="text-zinc-400">Click to pause</span>
                      </div>
                      <div className="space-y-2 my-auto">
                        <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                          Step 2 of 4 • Active + Passive Overlap
                        </p>
                        <p className="text-sm sm:text-base font-medium leading-snug">
                          “While Toor Dal pressure-cooks for 12 minutes, air-fry
                          your marinated Malai Paneer cubes at 200°C.”
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
                          Enter Voice Mode →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1.5 pt-1 pb-0.5">
                  <span className="text-sm font-medium text-zinc-950">
                    MiseFood Showreel
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Mise + Samsung Food Architecture
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Headline, Dual Paragraphs & Black Pill CTA matching 00:00 */}
            <div className="lg:col-span-7 lg:pl-6 space-y-6">
              <ScrollHeadlineReveal
                as="h1"
                className="text-3xl sm:text-4xl lg:text-[44px]"
                lines={[
                  "Every home kitchen hits the",
                  "same gap — between what you",
                  "save and what lands hot on the table.",
                ]}
              />

              <div className="space-y-4 text-sm sm:text-[15px] text-zinc-600 leading-[1.68] max-w-2xl">
                <p>
                  MiseFood is an AI culinary platform for Indian and global
                  households at every turning point — weeknight tiffins,
                  high-protein macro targets, Sunday family thalis, or zero-waste
                  fridge rescues. We&apos;ve seen what happens when saved
                  Instagram Reels, cookbook photos, and grocery lists live in
                  silos: masalas burn while rice cools, budgets drift, and
                  ingredients expire.
                </p>
                <p>
                  We close that gap by turning raw links, handwritten notes, and
                  pantry stock into synchronized parallel timelines — through
                  katori-native precision, LangGraph scheduling, pgvector taste
                  matching, and 10-minute quick-commerce carts.
                </p>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => jumpToStudioTab("hub")}
                  className="px-6 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium inline-flex items-center gap-3 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                >
                  <span>Explore Live Studio</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </button>

                <button
                  type="button"
                  onClick={onOpenOcrModal}
                  className="px-5 py-3.5 rounded-full bg-[#F2F3F5] hover:bg-zinc-200/80 text-zinc-900 text-sm font-medium inline-flex items-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                >
                  <ScanText className="h-4 w-4" />
                  <span>Import URL / Reel / OCR</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION HEADER 1 ON STONE CANVAS (00:00 - 00:01): "• Selected Work"
           ===================================================================== */}
        <div
          id="selected-work"
          className="pt-12 pb-6 px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className="lg:col-span-5 flex items-center gap-2.5 text-sm font-medium text-zinc-900 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
            <span>Selected Work &amp; Core Engines</span>
          </div>
          <div className="lg:col-span-7">
            <ScrollHeadlineReveal
              className="text-3xl sm:text-4xl lg:text-[42px]"
              lines={[
                "Seven culinary engines that closed the",
                "execution gap and what changed.",
              ]}
            />
          </div>
        </div>

        {/* =====================================================================
            SHEET 2 (00:01 - 00:05): ALTERNATING 2-COLUMN SHOWCASES WHITE ISLAND
           ===================================================================== */}
        <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-20 lg:space-y-28">
          {/* CASE 1 (00:01 - Vertus AI layout): Text Left, Visual Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                  <span>Universal Importer &amp; OCR, IN / Global</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  Recipe Studio AI
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  Multi-modal extraction engine operating at household scale —
                  stripping blog clutter, YouTube Shorts transcripts, Instagram
                  Reels, and handwritten family cards into strict normalized
                  schemas with 1-click Jain, High-Protein, Vegan, and Air-Fryer
                  remixes.
                </p>

                {/* 3 Metric Callouts matching "$1Bln | Top 1 | 51.15%" */}
                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      150ml
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      KATORI NATIVE CONVERSION
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      Top 1
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      GEMINI 3.8 FLASH OCR
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      65.0%
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      OIL SAVED IN AIR-FRY REMIX
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
                  <span>Explore</span>
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

          {/* CASE 2 (00:03 - TitanX layout): Visual Left, Text Right */}
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
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                  <span>Kinetic Loop Engine, Parallel DAG</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  Kinetic PrepX
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  Kinetic PrepX — Multi-recipe dependency scheduler delivering
                  38% faster meal prep with its Active/Passive Overlap Engine,
                  merging 2 to 4 dishes into a single interleaved Gantt timeline
                  so every bowl finishes hot at the exact same minute.
                </p>

                {/* 3 Metric Callouts matching "$27M | 250%+ | 1.5k+" */}
                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      42m
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      3-DISH MERGED RUNTIME
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      250%+
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      PASSIVE WINDOW UTILIZATION
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      4 Dishes
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      SIMULTANEOUS HOT FINISH
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
                  <span>Explore</span>
                  <span className="transition-transform duration-200 ease-emil-out group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* CASE 3 (00:04 - Metapic layout): Text Left, Visual Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                  <span>Indian Plate &amp; Macro Logic, ₹ Budget</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  ThaliMacro
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  ThaliMacro is our composite-slot weekly meal planner —
                  supporting full 4-component Indian Thalis (Rice/Roti +
                  Dal/Gravy + Sabji + Curd) alongside Western single-dish bowls,
                  solved from natural-language protein, calorie, and ₹ budget
                  constraints.
                </p>

                {/* 3 Metric Callouts matching "50%+ | 100k+ | 4:1" */}
                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      130g+
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      DAILY PROTEIN TARGETING
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      ₹2.5k
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      WEEKLY BUDGET CAP SOLVER
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      4:1
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      COMPOSITE THALI SLOTS
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
                  <span>Explore</span>
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

          {/* CASE 4 (00:05 - AlphaLedger layout): Visual Left, Text Right */}
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
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                  <span>Quick-Commerce &amp; Vector Pantry, IN</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-zinc-950">
                  MiseLedger
                </h3>

                <p className="text-sm sm:text-[15px] text-zinc-600 leading-[1.65]">
                  768-dimensional pgvector pantry engine that matches your
                  fridge leftovers against saved recipes, depletes quantities on
                  &ldquo;Mark Cooked&rdquo;, and exports de-duplicated supermarket
                  aisle carts to Swiggy Instamart, Blinkit, Zepto, and
                  BigBasket.
                </p>

                {/* 3 Metric Callouts matching "$950M+ | 1.9K | $98.7M" */}
                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      768d
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      PGVECTOR SIMILARITY
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      4 Apps
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      10-MIN CART DEEP-LINKS
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-4xl font-normal tracking-tight text-zinc-950">
                      ₹660
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-zinc-400 mt-1.5 leading-snug">
                      WEEKLY LEFTOVER RESCUE
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
                  <span>Explore</span>
                  <span className="transition-transform duration-200 ease-emil-out group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Centered Pill CTA matching "All projects" at 00:05 */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={() => jumpToStudioTab("hub")}
              className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium transition-transform duration-150 ease-emil-out active:scale-[0.97]"
            >
              All 7 Interactive Modules
            </button>
          </div>
        </section>

        {/* =====================================================================
            SECTION HEADER 2 ON STONE CANVAS (00:05): "• Who we work with"
           ===================================================================== */}
        <div
          id="capabilities"
          className="pt-12 pb-6 px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className="lg:col-span-5 flex items-center gap-2.5 text-sm font-medium text-zinc-900 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
            <span>Who we cook with &amp; Capabilities</span>
          </div>
          <div className="lg:col-span-7">
            <ScrollHeadlineReveal
              className="text-3xl sm:text-4xl lg:text-[42px]"
              lines={[
                "We work with ambitious home kitchens,",
                "fitness planners, and culinary creators.",
              ]}
            />
          </div>
        </div>

        {/* =====================================================================
            SHEET 3 (00:06 - 00:07): NUMBERED 01-08 SCROLL-STAGGER SERVICES LIST
           ===================================================================== */}
        <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
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

          <div className="pt-10 flex justify-center">
            <button
              type="button"
              onClick={() => jumpToStudioTab("sous-chef")}
              className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium transition-transform duration-150 ease-emil-out active:scale-[0.97]"
            >
              Launch Hands-Free Voice Sous Chef
            </button>
          </div>
        </section>

        {/* =====================================================================
            LIVE INTERACTIVE 7-MODULE WORKSPACE SHEET (#live-studio)
           ===================================================================== */}
        <div
          id="live-studio"
          ref={studioSectionRef as React.RefObject<HTMLDivElement>}
          className="pt-12 pb-4 px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-20"
        >
          <div className="lg:col-span-5 flex items-center gap-2.5 text-sm font-medium text-zinc-900 pt-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Interactive Culinary Workspace</span>
          </div>
          <div className="lg:col-span-7">
            <ScrollHeadlineReveal
              className="text-3xl sm:text-4xl lg:text-[42px]"
              lines={[
                "Switch between all 7 live AI modules",
                "without leaving your kitchen flow.",
              ]}
            />
          </div>
        </div>

        <section className="rounded-[32px] sm:rounded-[40px] bg-[#0C0D0E] text-parchment p-4 sm:p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-zinc-900/80 space-y-6">
          {/* Studio Top Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {studioTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-2 shrink-0 transition-all duration-150 active:scale-[0.97] ${
                    activeTab === item.id
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-60">
                    {item.shortNum}
                  </span>
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === "sous-chef" && activeTimers.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Timer className="h-2.5 w-2.5" />
                      {activeTimers.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenOcrModal}
              className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
            >
              <ScanText className="h-3.5 w-3.5" />
              <span>Import URL / YT / Reel / OCR</span>
            </button>
          </div>

          {/* Live Module Canvas */}
          <div>{children}</div>
        </section>

        {/* =====================================================================
            SHEET 4 (00:07 - 00:08): NUMBERED FAQ ACCORDION ISLAND SHEET
           ===================================================================== */}
        <section
          id="faq"
          className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mt-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Sticky FAQ Header matching 00:07 */}
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
                Everything you need to know about katori normalization, parallel
                meal prep scheduling, voice wake-lock, and quick-commerce cart
                exports.
              </p>
            </div>

            {/* Right Numbered 01-06 Accordion Rows matching 00:07 - 00:08 */}
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
                            : "bg-[#F2F3F5] text-zinc-900 group-hover:bg-zinc-200"
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
            TESTIMONIAL PROGRESS BAR & CAROUSEL CONTROLS (00:09)
           ===================================================================== */}
        <div className="px-2 sm:px-6 py-8 space-y-5">
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
            {/* Segmented progress bar matching 00:09 */}
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
            SECTION HEADER 3 ON STONE CANVAS (00:09): "• Contact us / AI Concierge"
           ===================================================================== */}
        <div
          id="concierge"
          className="pt-6 pb-6 px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className="lg:col-span-5 flex items-center gap-2.5 text-sm font-medium text-zinc-900 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
            <span>AI Meal Concierge</span>
          </div>
          <div className="lg:col-span-7">
            <ScrollHeadlineReveal
              className="text-3xl sm:text-4xl lg:text-[42px]"
              lines={[
                "The right sous chef at the right moment",
                "changes everything.",
              ]}
            />
          </div>
        </div>

        {/* =====================================================================
            SHEET 5 (00:09 - 00:10): "TELL US ABOUT YOUR NEXT STAGE" FORM SHEET
           ===================================================================== */}
        <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 lg:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left Column matching 00:09 - 00:10 */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
              <div className="space-y-6">
                <span className="inline-block px-4 py-2 rounded-full border border-zinc-200 text-xs text-zinc-500">
                  Start a culinary plan
                </span>
                <h3 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] leading-[1.1] text-zinc-950">
                  Tell us about your next meal stage.
                </h3>
              </div>

              <div className="space-y-3 pt-4">
                <p className="text-xs font-medium text-zinc-900">
                  Powered by &amp; Verified:
                </p>
                <div className="flex items-center gap-2.5">
                  <span
                    title="Gemini 3.8 Flash + Embedding 2"
                    className="h-11 w-11 rounded-full bg-[#F2F3F5] text-zinc-950 font-bold text-sm flex items-center justify-center"
                  >
                    G
                  </span>
                  <span
                    title="LangGraph Multi-Agent DAG"
                    className="h-11 w-11 rounded-full bg-[#F2F3F5] text-zinc-950 font-bold text-sm flex items-center justify-center"
                  >
                    ⚡
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column Form matching 00:09 - 00:10 */}
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
                    Household / Kitchen
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
                    Daily Macro Target
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
                    Cuisine Split
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

              {/* "I'm interested in..." selectable pills matching 00:10 */}
              <div className="space-y-3">
                <label className="block text-xs text-zinc-500">
                  I&apos;m interested in...
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "High-Protein Remix",
                    "Indian Thali Slots",
                    "Jain / No Onion-Garlic",
                    "Kinetic Parallel Prep",
                    "Veganize",
                    "10-Min Quick Cart",
                  ].map((pill) => {
                    const active = selectedInterests.includes(pill);
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => toggleInterest(pill)}
                        className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-[0.97] ${
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

              {/* "Weekly Grocery Budget (INR)" selectable pills matching 00:10 */}
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
                          className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-[0.97] ${
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

              {/* "Tell us about your fridge leftovers & constraints" underline textarea */}
              <div className="space-y-2 border-b border-zinc-200 pb-3">
                <label className="block text-xs text-zinc-500">
                  Tell us about your fridge leftovers &amp; schedule
                </label>
                <textarea
                  rows={2}
                  value={conciergePrompt}
                  onChange={(e) => setConciergePrompt(e.target.value)}
                  placeholder="Write something concise... e.g., Use leftover 250g paneer on Tuesday, non-veg on Wed/Fri/Sun."
                  className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-300 focus:outline-none resize-none"
                />
              </div>

              {/* Full-width Black Pill Submit Button matching 00:10 */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.99]"
              >
                {conciergeSubmitted ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Opening Multi-Slot Thali Planner...</span>
                  </>
                ) : (
                  <span>Submit &amp; Generate 7-Day Plan</span>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* =====================================================================
            FOOTER (00:11 - 00:16): MULTI-COLUMN CASCADE REVEAL FOOTER ON #ECEEF0
           ===================================================================== */}
        <footer ref={footerRef} className="pt-14 pb-8 px-2 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 pb-14">
            {/* Col 1: Platform */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <p className="text-xs font-semibold text-zinc-950">Platform:</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "About", tab: "hub" as ActiveTab },
                  { label: "Recipe Studio", tab: "hub" as ActiveTab },
                  { label: "Thali Planner", tab: "planner" as ActiveTab },
                  { label: "Kinetic DAG", tab: "kinetic-prep" as ActiveTab },
                  { label: "Voice Sous Chef", tab: "sous-chef" as ActiveTab },
                  { label: "Pantry Rescue", tab: "pantry" as ActiveTab },
                  { label: "Cookbooks", tab: "social" as ActiveTab },
                  { label: "Communities", tab: "social" as ActiveTab },
                  { label: "Testimonials", tab: "hub" as ActiveTab },
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

            {/* Col 2: AI Engines */}
            <div className="col-span-1 md:col-span-3 space-y-4">
              <p className="text-xs font-semibold text-zinc-950">AI Engines:</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  "URL & Reel Scraper",
                  "Gemini 3.8 Vision OCR",
                  "150ml Katori Converter",
                  "LangGraph Meal Solver",
                  "Parallel Prep Scheduler",
                  "pgvector Taste Matcher",
                  "EAN-13 Barcode Scanner",
                  "10-Min Quick-Commerce Sync",
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
                    <button
                      type="button"
                      onClick={() => jumpToStudioTab("hub")}
                      className="text-zinc-600 hover:text-zinc-950 transition-colors text-left"
                    >
                      {label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Col 3: Cuisines & Diets */}
            <div className="col-span-2 md:col-span-3 space-y-4">
              <p className="text-xs font-semibold text-zinc-950">
                Cuisines &amp; Diets:
              </p>
              <ul className="space-y-2.5 text-sm">
                {[
                  "North & South Indian Thali",
                  "High-Protein (+40% P)",
                  "Jain (No Onion-Garlic)",
                  "Plant-Based / Vegan",
                  "Air-Fryer Low-Oil",
                  "Mediterranean & Asian",
                  "Weeknight 20-Min Tiffins",
                  "Zero-Waste Fridge Rescue",
                  "Quick-Commerce Households",
                  "Collaborative Family Boxes",
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
                      delay: reduceMotion ? 0 : i * 0.04 + 0.08,
                      ease: EMIL_EASE_OUT,
                    }}
                    className="text-zinc-600"
                  >
                    {label}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Col 4: Subscribe & Socials matching 00:11 - 00:16 */}
            <div className="col-span-2 md:col-span-4 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-zinc-950">
                  Import a recipe URL or subscribe to weekly updates
                </p>
                <div className="flex items-center border-b border-zinc-300 pb-2.5">
                  <input
                    type="text"
                    placeholder="Paste YouTube / Reel link or your email"
                    className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
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
                  By continuing, you agree to our{" "}
                  <span className="underline text-zinc-600">
                    Culinary Data Policy
                  </span>
                  . All recipes normalize strictly into gram &amp; katori units.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-zinc-950">
                  Quick-Commerce &amp; Socials:
                </p>
                <div className="flex items-center gap-2.5">
                  {["SW", "BL", "ZP", "IG", "YT"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => jumpToStudioTab("planner")}
                      className="h-10 w-10 rounded-full bg-white hover:bg-zinc-950 text-zinc-900 hover:text-white text-[11px] font-semibold flex items-center justify-center shadow-sm transition-colors active:scale-95"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar matching 00:13 - 00:16 */}
          <div className="pt-8 border-t border-zinc-300/80 flex flex-wrap items-center justify-between gap-4">
            <a
              href="#top"
              className="text-2xl font-bold tracking-[-0.04em] text-zinc-950"
            >
              misefood
            </a>

            <p className="text-xs text-zinc-500">
              © 2026 MiseFood AI. All rights reserved.{" "}
              <span className="mx-1.5 text-zinc-950">•</span>{" "}
              <span className="text-zinc-800 font-medium">
                Indian &amp; Global Culinary OS
              </span>
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

      {/* Instant Command Palette (Zero animation on keyboard trigger per Emil's rule) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
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
                placeholder="Jump to recipe, normalized ingredient, or AI module..."
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
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Import Recipe from URL / YouTube / Instagram Reel / OCR
                  </span>
                  <span className="text-xs text-zinc-400">
                    Universal Importer
                  </span>
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
                    <GitMerge className="h-4 w-4 text-purple-600" />
                    Open Kinetic Loop Multi-Recipe Parallel Timeline
                  </span>
                  <span className="text-xs text-zinc-400">2-4 Dishes</span>
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
