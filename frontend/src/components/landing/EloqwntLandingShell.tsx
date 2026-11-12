"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Check,
  Command,
  Copy,
  Flame,
  GitMerge,
  Laptop,
  Mic,
  PackageCheck,
  ScanText,
  Search,
  Smartphone,
  Sparkles,
  Terminal,
  Timer,
} from "lucide-react";
import type { ActiveTab } from "@/components/layout/AppShell";
import {
  MiseFoodGlyph,
  MiseFoodLogo,
} from "@/components/brand/MiseFoodLogo";
import {
  ImporterFeatureMockup,
  ParallelTimelineFeatureMockup,
  ThaliAndCartFeatureMockup,
} from "@/components/landing/ShowcaseMockups";
import { WeeklyMenuBuilder } from "@/components/planner/WeeklyMenuBuilder";
import type { ActiveCookingTimer, Recipe, UnitSystem } from "@/types/recipe";

interface EloqwntLandingShellProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unitSystem: UnitSystem;
  onChangeUnitSystem: (sys: UnitSystem) => void;
  onOpenOcrModal: () => void;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  activeTimers: ActiveCookingTimer[];
  onStartQuickTimer?: (label: string, seconds: number, stepNum: number) => void;
  children: React.ReactNode;
}

const FAQ_ITEMS: {
  number: string;
  question: string;
  answer: string;
}[] = [
  {
    number: "01",
    question: "How does MiseFood help me cook faster on weeknights?",
    answer:
      "Most recipe apps only store bookmarks. MiseFood strips clutter from blogs, Reels, and handwritten cards into structured ingredients, weaves 2 to 4 dishes into a single parallel timeline so nothing gets cold, and guides you hands-free by voice while you cook.",
  },
  {
    number: "02",
    question: "How does Indian Katori (150 ml) measurement conversion work?",
    answer:
      "A standard household katori holds 150 ml (approx. 150 g for cooked dals, curries, curds, and diced vegetables). You can switch between Katori, Metric (g/ml), and US Cups at any moment while calories, protein, and ₹ cost scale automatically.",
  },
  {
    number: "03",
    question: "How does Cook Together coordinate multiple dishes at once?",
    answer:
      "When you select 2 to 4 dishes—such as Dal Tadka, Air-Fryer Paneer Tikka, and Jeera Rice—MiseFood identifies passive wait windows like pressure-cooking or marinating and slots your chopping and tempering inside them, cutting active kitchen time by up to 38%.",
  },
  {
    number: "04",
    question: "Can I adapt any recipe to be Jain-friendly or High-Protein?",
    answer:
      "Yes. On any recipe, use the one-click adaptation pills to boost protein (+40% via paneer, soya, or Greek curd), make it Jain-friendly (replacing onion and garlic with hing, ginger, and fennel), make it plant-based, or convert deep-frying to an air-fryer (-65% oil).",
  },
  {
    number: "05",
    question: "How do 10-minute quick-commerce grocery links work?",
    answer:
      "Your weekly meal plan merges duplicate ingredients across all 7 days (combining 2 onions on Tuesday + 1.5 onions on Friday into 3.5 onions), subtracts what is already in your pantry, groups items by aisle, and opens them directly in Swiggy Instamart, Blinkit, Zepto, or BigBasket.",
  },
  {
    number: "06",
    question: "Will my phone screen turn off while using Voice Chef?",
    answer:
      "No. Voice Chef engages the browser Screen Wake Lock API so your display stays awake while your hands are covered in dough or masala, and listens continuously for spoken commands like 'Next step', 'Repeat', 'How much cumin?', or 'Set a timer for 8 minutes'.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "“Cooking a full North Indian thali on a Tuesday night used to take 75 minutes and three cold pans. MiseFood overlapped the pressure-cooker window with my air-fryer paneer—every bowl hit the table piping hot in 42 minutes.”",
    author: "Ananya Krishnan",
    role: "Product Lead & Home Chef, Bengaluru",
    initials: "AK",
    accentBg: "#3f6212",
  },
  {
    quote:
      "“Adapting saved Instagram Reels to Jain and High-Protein in one click is a lifesaver. My parents get their no-onion-garlic dal while I hit 135g daily protein under ₹2,400 a week.”",
    author: "Rohan Mehta",
    role: "Design Founder, Mumbai",
    initials: "RM",
    accentBg: "#C44D28",
  },
  {
    quote:
      "“Scanning my grandmother's handwritten masala card into 150ml katori measurements and sending the missing spices straight to Blinkit saved our Sunday family lunch.”",
    author: "Meera Nair",
    role: "Culinary Writer, Kochi",
    initials: "MN",
    accentBg: "#1E1612",
  },
];

const DOWNLOAD_PLATFORMS = [
  {
    id: "mobile-pwa",
    title: "iOS & Android Kitchen PWA",
    badge: "Wake-Lock Ready",
    description:
      "Install directly to your phone or tablet home screen for hands-free Voice Chef mode, camera OCR recipe card scanning, and 10-minute Instamart & Blinkit deep-links.",
    actionLabel: "Launch Mobile Kitchen Mode",
    targetTab: "sous-chef" as ActiveTab,
    icon: <Smartphone className="h-5 w-5 text-[#3f6212]" />,
  },
  {
    id: "desktop-studio",
    title: "macOS & Windows Web Studio",
    badge: "1440px Multi-Track",
    description:
      "Full side-by-side Recipe Studio, 4-dish Gantt timeline scheduler, 7-day composite Thali calendar, and instant ⌘K keyboard navigation.",
    actionLabel: "Open Desktop Studio",
    targetTab: "hub" as ActiveTab,
    icon: <Laptop className="h-5 w-5 text-[#3f6212]" />,
  },
  {
    id: "self-hosted-cli",
    title: "Docker & FastAPI Self-Hosted",
    badge: "Open Source Stack",
    description:
      "Run the complete Next.js 15 + FastAPI + PostgreSQL pgvector + Gemini 3.8 culinary engine locally with your own household recipe database.",
    actionLabel: "View GitHub Repository",
    href: "https://github.com/Ahm3dh-sham/misefood",
    icon: <Terminal className="h-5 w-5 text-[#3f6212]" />,
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
  onStartQuickTimer,
  children,
}: EloqwntLandingShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cliCopied, setCliCopied] = useState(false);

  const studioSectionRef = useRef<HTMLDivElement | null>(null);

  // Emil Kowalski rule: Never animate keyboard-initiated command palette toggles (100+ times/day)
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
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCopyCli = async () => {
    try {
      await navigator.clipboard.writeText(
        "git clone https://github.com/Ahm3dh-sham/misefood.git && cd misefood && docker compose up"
      );
      setCliCopied(true);
      setTimeout(() => setCliCopied(false), 2000);
    } catch {
      setCliCopied(false);
    }
  };

  const jumpToMenuBuilder = () => {
    document
      .getElementById("menu-builder")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      label: "Recipes & Remix",
      icon: <Flame className="h-3.5 w-3.5" />,
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
      label: "Pantry & Cart",
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
      className="min-h-screen bg-[#f1f3e6] text-[#000000] font-display"
    >
      {/* =====================================================================
          SECTION 1: ANNOUNCEMENT — One line across the top edge. With link.
         ===================================================================== */}
      <div
        role="region"
        aria-label="Product announcement"
        className="w-full bg-[#3f6212] text-[#fcfcfd] px-6 py-2.5"
      >
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs sm:text-sm">
          <span>
            New: 150ml Indian Katori scaling, 4-dish parallel prep timeline, and
            10-minute Instamart &amp; Blinkit cart export
          </span>
          <button
            type="button"
            onClick={() => jumpToStudioTab("hub")}
            className="font-semibold underline underline-offset-4 hover:opacity-90 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Try the live studio</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          SECTION 2: SITE HEADER — Brand, navigation and actions in a solid bar
          inset from the page edges. With 4 links and actions.
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#f1f3e6]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-[1200px] mx-auto rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand: Concept 1 Steam Toque & Harvest Bowl Logo */}
          <a
            href="#top"
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none"
          >
            <MiseFoodLogo
              variant="steam-negative"
              size={38}
              showWordmark={true}
              theme="light"
            />
          </a>

          {/* 4 Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-[#333333]"
          >
            <button
              type="button"
              onClick={() => jumpToStudioTab("hub")}
              className={`whitespace-nowrap hover:text-[#000000] transition-colors ${
                activeTab === "hub" ? "text-[#000000] font-semibold" : ""
              }`}
            >
              Recipes &amp; Remix
            </button>
            <button
              type="button"
              onClick={jumpToMenuBuilder}
              className="whitespace-nowrap hover:text-[#000000] transition-colors font-semibold text-[#3f6212]"
            >
              7-Day Menu
            </button>
            <button
              type="button"
              onClick={() => jumpToStudioTab("kinetic-prep")}
              className={`whitespace-nowrap hover:text-[#000000] transition-colors ${
                activeTab === "kinetic-prep"
                  ? "text-[#000000] font-semibold"
                  : ""
              }`}
            >
              Cook Together
            </button>
            <button
              type="button"
              onClick={() => jumpToStudioTab("sous-chef")}
              className={`whitespace-nowrap hover:text-[#000000] transition-colors flex items-center gap-1.5 ${
                activeTab === "sous-chef" || activeTab === "pantry"
                  ? "text-[#000000] font-semibold"
                  : ""
              }`}
            >
              <span>Voice &amp; Pantry</span>
              {activeTimers.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-[#3f6212] text-[#fcfcfd] tabular-nums">
                  {activeTimers.length}
                </span>
              )}
            </button>
          </nav>

          {/* Header Actions: Katori Unit Switcher + Search + Import + Primary CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label="Kitchen measurement units"
              className="hidden sm:inline-flex items-center bg-[#f1f3e6] p-0.5 rounded-full border border-[#d3d4c8] text-xs whitespace-nowrap shrink-0"
            >
              {(
                [
                  { id: "indian", label: "Katori (150ml)" },
                  { id: "metric", label: "Metric" },
                  { id: "imperial", label: "US" },
                ] as const
              ).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onChangeUnitSystem(u.id)}
                  className={`btn-press whitespace-nowrap px-2.5 py-1 rounded-full font-medium ${
                    unitSystem === u.id
                      ? "bg-[#3f6212] text-[#fcfcfd]"
                      : "text-[#333333] hover:text-[#000000]"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              aria-label="Search recipes and commands"
              className="btn-press hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-xs font-medium text-[#333333] hover:text-[#000000] whitespace-nowrap shrink-0"
            >
              <Search className="h-3.5 w-3.5" />
              <kbd className="font-mono text-[11px] text-[#4d4c4c] flex items-center">
                <Command className="h-2.5 w-2.5 mr-0.5" />K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenOcrModal}
              className="btn-press px-3.5 py-2 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] hover:border-[#3f6212] text-xs font-medium text-[#000000] hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ScanText className="h-3.5 w-3.5 text-[#3f6212]" />
              <span>Import Recipe</span>
            </button>

            <button
              type="button"
              onClick={() => jumpToStudioTab("hub")}
              className="btn-press px-4 py-2 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Open Kitchen Studio</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* =====================================================================
            FIRST SECTION: HERO — Stage layout on the alternate ground (#e9eade).
            Large display heading (70px desktop / 53px mobile), two actions,
            working Kitchen Studio, and key numbers.
           ===================================================================== */}
        <section className="bg-[#e9eade] pt-[85px] pb-[64px] lg:pt-[128px] lg:pb-[85px] px-6">
          <div className="max-w-[1200px] mx-auto">
            {/* Centered Stage Heading & Actions */}
            <div className="text-center max-w-[980px] mx-auto">
              <h1 className="text-[53px] lg:text-[70px] font-medium leading-[1.04] tracking-[-0.03em] text-[#000000]">
                From saved recipe links to
                <br className="hidden sm:inline" /> four dishes finishing hot
                <br className="hidden sm:inline" /> at the exact same minute.
              </h1>

              <p className="mt-6 text-[16px] text-[#333333] max-w-[660px] mx-auto leading-[1.6]">
                <strong>MiseFood</strong> strips clutter from blogs, Reels, and
                handwritten family cards into strict 150ml katori and gram
                measurements, schedules parallel cooking timelines, and guides
                you hands-free by voice.
              </p>

              {/* Two Actions: Primary #3f6212 + Secondary #f1f3e6 */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => jumpToStudioTab("hub")}
                  className="btn-press px-7 py-3.5 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] text-sm font-medium inline-flex items-center gap-2"
                >
                  <span>Cook in Live Studio</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenOcrModal}
                  className="btn-press px-7 py-3.5 rounded-full bg-[#f1f3e6] hover:border-[#3f6212] text-[#000000] border border-[#d3d4c8] text-sm font-medium inline-flex items-center gap-2"
                >
                  <ScanText className="h-4 w-4 text-[#3f6212]" />
                  <span>Import URL, Reel or Photo</span>
                </button>
              </div>
            </div>

            {/* Large Framed Working Product Interface (Live 6-Module MiseFood Studio) */}
            <div
              id="kitchen-studio"
              ref={studioSectionRef}
              className="mt-14 rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] p-4 sm:p-7 scroll-mt-24"
            >
              {/* Studio Module Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#d3d4c8]">
                <div
                  role="tablist"
                  aria-label="Kitchen Studio Modules"
                  className="flex items-center gap-1.5 overflow-x-auto pb-1"
                >
                  {studioTabs.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        role="tab"
                        aria-selected={isActive}
                        type="button"
                        onClick={() => onSelectTab(item.id)}
                        className={`btn-press px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shrink-0 ${
                          isActive
                            ? "bg-[#3f6212] text-[#fcfcfd]"
                            : "bg-[#e9eade] text-[#333333] hover:text-[#000000] border border-[#d3d4c8]"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.id === "sous-chef" && activeTimers.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#fcfcfd]/20 text-[#fcfcfd] flex items-center gap-1 tabular-nums">
                            <Timer className="h-2.5 w-2.5" />
                            {activeTimers.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenOcrModal}
                    className="btn-press px-3.5 py-1.5 rounded-full bg-[#e9eade] border border-[#d3d4c8] hover:border-[#3f6212] text-xs font-medium text-[#000000] inline-flex items-center gap-1.5"
                  >
                    <ScanText className="h-3.5 w-3.5 text-[#3f6212]" />
                    <span>+ Import Link / Photo</span>
                  </button>
                </div>
              </div>

              {/* Active Module Workspace */}
              <div>{children}</div>
            </div>

            {/* Trust Caption & Key Numbers */}
            <div className="mt-14 pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4d4c4c] text-center mb-8">
                Verified across Indian &amp; global home kitchens — normalized to
                the katori, gram, and rupee
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                <div className="text-center lg:border-r lg:border-[#d3d4c8] lg:pr-6">
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#000000] tabular-nums">
                    150 ml
                  </p>
                  <p className="text-sm font-semibold text-[#000000] mt-1">
                    Standard Indian Katori Scale
                  </p>
                  <p className="text-xs text-[#4d4c4c] mt-0.5">
                    Instant toggle between Katori, Metric &amp; US Cups
                  </p>
                </div>

                <div className="text-center lg:border-r lg:border-[#d3d4c8] lg:pr-6">
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#000000] tabular-nums">
                    38% Faster
                  </p>
                  <p className="text-sm font-semibold text-[#000000] mt-1">
                    Multi-Dish Parallel Prep
                  </p>
                  <p className="text-xs text-[#4d4c4c] mt-0.5">
                    Active prep slotted inside passive simmer windows
                  </p>
                </div>

                <div className="text-center lg:border-r lg:border-[#d3d4c8] lg:pr-6">
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#000000] tabular-nums">
                    5 Regions
                  </p>
                  <p className="text-sm font-semibold text-[#000000] mt-1">
                    Custom 7-Day Regional Menu
                  </p>
                  <p className="text-xs text-[#4d4c4c] mt-0.5">
                    North, South, East, West &amp; Northeast Indian
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#000000] tabular-nums">
                    4 Apps
                  </p>
                  <p className="text-sm font-semibold text-[#000000] mt-1">
                    Instamart, Blinkit, Zepto &amp; BB
                  </p>
                  <p className="text-xs text-[#4d4c4c] mt-0.5">
                    De-duplicated aisle cart exported in one click
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECOND SECTION: CUSTOM 7-DAY REGIONAL MEAL PLANNER
            Immediately follows the opening hero stage on #f1f3e6 ground.
           ===================================================================== */}
        <section
          id="menu-builder"
          className="bg-[#f1f3e6] pt-[85px] pb-[64px] lg:pt-[128px] lg:pb-[85px] px-6 scroll-mt-24"
        >
          <div className="max-w-[1200px] mx-auto">
            <WeeklyMenuBuilder />
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: FEATURES — Image and text rows swap sides.
            Paired on the alternate ground (#e9eade). With 3 rows of working UI mockups.
           ===================================================================== */}
        <section
          id="features"
          className="bg-[#e9eade] pt-[85px] pb-[64px] lg:pt-[128px] lg:pb-[85px] px-6"
        >
          <div className="max-w-[1200px] mx-auto space-y-20 lg:space-y-28">
            <div className="max-w-[760px]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3f6212] mb-3">
                How MiseFood Works
              </p>
              <h2 className="text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-[#000000]">
                Three kitchen engines that bridge saving a recipe and serving it
                hot.
              </h2>
            </div>

            {/* ROW 1: Text Left, Working UI Mockup Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <span className="inline-block px-3 py-1 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-xs font-semibold text-[#3f6212]">
                  01 • Import, Scale &amp; Adapt
                </span>
                <h3 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] leading-[1.12] text-[#000000]">
                  Turn any link, Reel, or handwritten card into exact katoris.
                </h3>
                <p className="text-[16px] text-[#333333] leading-[1.6]">
                  Paste a food blog URL, YouTube Short, or Instagram Reel—or
                  upload a photo of your grandmother&apos;s handwritten masala
                  card. MiseFood extracts every ingredient into structured
                  150ml katoris and grams, then adapts the dish to High-Protein,
                  Jain (No Onion-Garlic), Vegan, or Air-Fryer in one click.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onOpenOcrModal}
                    className="btn-press px-5 py-2.5 rounded-full bg-[#3f6212] text-[#fcfcfd] text-xs font-medium"
                  >
                    Import a Recipe Now
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToStudioTab("hub")}
                    className="btn-press px-5 py-2.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#000000] text-xs font-medium"
                  >
                    Explore Recipe Studio →
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ImporterFeatureMockup
                  onLaunch={() => jumpToStudioTab("hub")}
                  onOpenImporter={onOpenOcrModal}
                />
              </div>
            </div>

            {/* ROW 2: Working UI Mockup Left, Text Right (Swapped Sides) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <ParallelTimelineFeatureMockup
                  onLaunch={() => jumpToStudioTab("kinetic-prep")}
                  onStartQuickTimer={onStartQuickTimer}
                />
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
                <span className="inline-block px-3 py-1 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-xs font-semibold text-[#3f6212]">
                  02 • Multi-Dish Parallel Timing
                </span>
                <h3 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] leading-[1.12] text-[#000000]">
                  Weave 2 to 4 dishes into one timeline so nothing waits cold.
                </h3>
                <p className="text-[16px] text-[#333333] leading-[1.6]">
                  Cooking Dal Tadka, Paneer Tikka, and Jeera Rice one after
                  another takes 68 minutes and leaves two pans cold. Select your
                  dishes and MiseFood slots active chopping and tadka tempering
                  inside passive pressure-cooker and marination windows—cutting
                  total kitchen time to 42 minutes.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => jumpToStudioTab("kinetic-prep")}
                    className="btn-press px-5 py-2.5 rounded-full bg-[#3f6212] text-[#fcfcfd] text-xs font-medium"
                  >
                    Open Parallel Scheduler
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToStudioTab("sous-chef")}
                    className="btn-press px-5 py-2.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#000000] text-xs font-medium"
                  >
                    Launch Voice Chef →
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 3: Text Left, Working UI Mockup Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <span className="inline-block px-3 py-1 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-xs font-semibold text-[#3f6212]">
                  03 • Thali Macros &amp; 10-Min Carts
                </span>
                <h3 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] leading-[1.12] text-[#000000]">
                  Balance 4-part Indian thalis and export your aisle cart in one
                  tap.
                </h3>
                <p className="text-[16px] text-[#333333] leading-[1.6]">
                  Plan a full 7-day menu around composite Indian thalis
                  (Rice/Roti + Dal + Sabji + Curd) or quick single-bowl meals.
                  MiseFood automatically combines duplicate ingredients across
                  the week, subtracts your fridge inventory, and links every
                  item to Swiggy Instamart, Blinkit, Zepto, and BigBasket.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={jumpToMenuBuilder}
                    className="btn-press px-5 py-2.5 rounded-full bg-[#3f6212] text-[#fcfcfd] text-xs font-medium"
                  >
                    Build 7-Day Regional Menu
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToStudioTab("pantry")}
                    className="btn-press px-5 py-2.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#000000] text-xs font-medium"
                  >
                    Check Fridge &amp; Pantry →
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ThaliAndCartFeatureMockup
                  onLaunchPlanner={jumpToMenuBuilder}
                  onLaunchPantry={() => jumpToStudioTab("pantry")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: TESTIMONIALS — One quote per row, with the author's name
            and role in a separate column. With 3 quotes and avatars. On #f1f3e6.
           ===================================================================== */}
        <section
          id="testimonials"
          className="bg-[#f1f3e6] pt-[85px] pb-[64px] lg:pt-[128px] lg:pb-[85px] px-6"
        >
          <div className="max-w-[1200px] mx-auto space-y-12">
            <div className="max-w-[680px]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3f6212] mb-3">
                Home Kitchen Ledger
              </p>
              <h2 className="text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-[#000000]">
                What changes when your kitchen runs on one timeline.
              </h2>
            </div>

            <div className="divide-y divide-[#d3d4c8] border-y border-[#d3d4c8]">
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.author}
                  className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center"
                >
                  {/* Quote Column */}
                  <div className="lg:col-span-8">
                    <blockquote className="text-xl sm:text-2xl font-normal tracking-[-0.02em] leading-[1.45] text-[#000000]">
                      {item.quote}
                    </blockquote>
                  </div>

                  {/* Separate Author & Role Column with Illustrated Avatar */}
                  <div className="lg:col-span-4 flex items-center gap-4 lg:justify-start lg:pl-8">
                    <div
                      aria-hidden="true"
                      style={{ backgroundColor: item.accentBg }}
                      className="h-12 w-12 rounded-full text-[#fcfcfd] font-semibold text-sm flex items-center justify-center shrink-0 border border-[#d3d4c8]"
                    >
                      {item.initials}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#000000]">
                        {item.author}
                      </p>
                      <p className="text-sm text-[#4d4c4c]">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 6: DOWNLOAD — Lists a download for each platform (3 platforms),
            with the install command under them, paired on #f1f3e6 ground.
            Also preserves the interactive Personalized Weekly Meal Concierge.
           ===================================================================== */}
        <section
          id="download"
          className="bg-[#f1f3e6] pt-[85px] pb-[64px] lg:pt-[128px] lg:pb-[85px] px-6"
        >
          <div className="max-w-[1200px] mx-auto space-y-16">
            <div className="max-w-[740px]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3f6212] mb-3">
                Every Kitchen Surface
              </p>
              <h2 className="text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-[#000000]">
                Run MiseFood on your counter tablet, desktop, or home server.
              </h2>
            </div>

            {/* 3 Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DOWNLOAD_PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-6 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="h-10 w-10 rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] flex items-center justify-center">
                        {platform.icon}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-xs font-medium text-[#333333]">
                        {platform.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-[#000000]">
                      {platform.title}
                    </h3>

                    <p className="text-sm text-[#333333] leading-relaxed">
                      {platform.description}
                    </p>
                  </div>

                  {platform.href ? (
                    <a
                      href={platform.href}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-press w-full py-3 px-4 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] text-xs font-medium text-center"
                    >
                      {platform.actionLabel} →
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        jumpToStudioTab(platform.targetTab ?? "hub")
                      }
                      className="btn-press w-full py-3 px-4 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] text-xs font-medium text-center"
                    >
                      {platform.actionLabel} →
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Install Command Bar Under the 3 Platforms */}
            <div className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Terminal className="h-4 w-4 text-[#3f6212] shrink-0" />
                <code className="font-mono text-xs sm:text-sm text-[#000000] select-all">
                  git clone https://github.com/Ahm3dh-sham/misefood.git &amp;&amp;
                  cd misefood &amp;&amp; docker compose up
                </code>
              </div>

              <button
                type="button"
                onClick={() => void handleCopyCli()}
                className="btn-press px-4 py-2 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] hover:border-[#3f6212] text-xs font-medium text-[#000000] inline-flex items-center gap-1.5 shrink-0"
              >
                {cliCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#3f6212]" />
                    <span>Copied Command</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#333333]" />
                    <span>Copy Install Command</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 7: FAQ — Questions and answers in two columns, all visible
            at once. On the alternate ground (#e9eade). With 6 questions.
           ===================================================================== */}
        <section
          id="faq"
          className="bg-[#e9eade] pt-[85px] pb-[64px] lg:pt-[128px] lg:pb-[85px] px-6"
        >
          <div className="max-w-[1200px] mx-auto space-y-12">
            <div className="max-w-[680px]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3f6212] mb-3">
                Frequently Asked Questions
              </p>
              <h2 className="text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-[#000000]">
                Six answers on katoris, parallel timing, and voice cooking.
              </h2>
            </div>

            {/* All 6 Questions Visible at Once in Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.number}
                  className="rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] p-6 space-y-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-semibold text-[#3f6212] tabular-nums">
                      {item.number}
                    </span>
                    <h3 className="text-lg font-semibold text-[#000000] leading-snug">
                      {item.question}
                    </h3>
                  </div>
                  <p className="text-sm text-[#333333] leading-[1.65]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          SECTION 8: FOOTER — A full-width brand name, with grouped links above
          and social links, copyright and a note below.
          Paired on the alternate ground (#e9eade). With 3 link columns & social links.
         ===================================================================== */}
      <footer className="bg-[#e9eade] pt-[85px] pb-[64px] lg:pt-[128px] lg:pb-[85px] px-6">
        <div className="max-w-[1200px] mx-auto space-y-16">
          {/* Top: 3 Grouped Link Columns + Quick Import Trigger */}
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 border-t border-[#d3d4c8] pt-12">
            {/* Column 1 */}
            <div className="col-span-1 md:col-span-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#000000]">
                Kitchen Studio
              </p>
              <ul className="space-y-2.5 text-sm text-[#333333]">
                <li>
                  <button
                    type="button"
                    onClick={jumpToMenuBuilder}
                    className="hover:text-[#000000] transition-colors"
                  >
                    7-Day Regional Menu
                  </button>
                </li>
                {[
                  { label: "Recipes & AI Remix", tab: "hub" as ActiveTab },
                  {
                    label: "Cook Together Timeline",
                    tab: "kinetic-prep" as ActiveTab,
                  },
                  {
                    label: "Hands-Free Voice Chef",
                    tab: "sous-chef" as ActiveTab,
                  },
                  { label: "Pantry & Leftover Rescue", tab: "pantry" as ActiveTab },
                  { label: "Household Cookbooks", tab: "social" as ActiveTab },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => jumpToStudioTab(link.tab)}
                      className="hover:text-[#000000] transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div className="col-span-1 md:col-span-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#000000]">
                Dietary &amp; Unit Modes
              </p>
              <ul className="space-y-2.5 text-sm text-[#333333]">
                <li>
                  <button
                    type="button"
                    onClick={() => onChangeUnitSystem("indian")}
                    className="hover:text-[#000000] transition-colors"
                  >
                    150ml Indian Katori Scale
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onChangeUnitSystem("metric")}
                    className="hover:text-[#000000] transition-colors"
                  >
                    Metric Grams &amp; Milliliters
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onChangeUnitSystem("imperial")}
                    className="hover:text-[#000000] transition-colors"
                  >
                    US Cups &amp; Ounces
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => jumpToStudioTab("hub")}
                    className="hover:text-[#000000] transition-colors"
                  >
                    High-Protein (+40%) Remix
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => jumpToStudioTab("hub")}
                    className="hover:text-[#000000] transition-colors"
                  >
                    Jain (No Onion-Garlic)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => jumpToStudioTab("hub")}
                    className="hover:text-[#000000] transition-colors"
                  >
                    Air-Fryer (-65% Oil)
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="col-span-2 md:col-span-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#000000]">
                Quick-Commerce &amp; Stack
              </p>
              <ul className="space-y-2.5 text-sm text-[#333333]">
                <li>
                  <a
                    href="https://www.swiggy.com/instamart"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#000000] transition-colors"
                  >
                    Swiggy Instamart Export
                  </a>
                </li>
                <li>
                  <a
                    href="https://blinkit.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#000000] transition-colors"
                  >
                    Blinkit 10-Min Cart
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.zeptonow.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#000000] transition-colors"
                  >
                    Zepto Superfast Delivery
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.bigbasket.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#000000] transition-colors"
                  >
                    BigBasket Monthly Stock
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Ahm3dh-sham/misefood"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#000000] transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Import CTA Column */}
            <div className="col-span-2 md:col-span-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#000000]">
                Import Any Recipe
              </p>
              <p className="text-xs text-[#333333] leading-relaxed">
                Paste a blog URL, YouTube Short, Instagram Reel, or upload a
                cookbook photo to normalize into 150ml katoris.
              </p>
              <button
                type="button"
                onClick={onOpenOcrModal}
                className="btn-press w-full py-2.5 px-4 rounded-full bg-[#3f6212] text-[#fcfcfd] text-xs font-medium inline-flex items-center justify-center gap-2"
              >
                <ScanText className="h-3.5 w-3.5" />
                <span>Open Recipe Importer</span>
              </button>
            </div>
          </div>

          {/* Middle: Full-Width Brand Name Statement with Concept 1 Steam Toque & Harvest Bowl */}
          <div className="py-6 border-y border-[#d3d4c8] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <MiseFoodGlyph variant="steam-negative" size={76} />
              <span className="text-[64px] sm:text-[112px] lg:text-[148px] font-bold tracking-[-0.04em] leading-none text-[#000000] select-none">
                misefood.
              </span>
            </div>

            <button
              type="button"
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="btn-press h-12 w-12 rounded-full bg-[#3f6212] text-[#fcfcfd] flex items-center justify-center shrink-0"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom: Social Links, Copyright & Note */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#4d4c4c]">
            <div className="space-y-1">
              <p className="font-medium text-[#000000]">
                © 2026 MiseFood. Built for everyday Indian &amp; global home
                kitchens.
              </p>
              <p>
                Note: Every ingredient normalizes into `{`{ name, quantity, unit, aisle_category, preparation_note, nutrition_meta }`}` with live 150ml katori scaling.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 font-medium text-[#333333]">
              <a
                href="https://github.com/Ahm3dh-sham/misefood"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#000000] underline underline-offset-4"
              >
                GitHub
              </a>
              <button
                type="button"
                onClick={() => jumpToStudioTab("hub")}
                className="hover:text-[#000000]"
              >
                Recipe Studio
              </button>
              <button
                type="button"
                onClick={jumpToMenuBuilder}
                className="hover:text-[#000000]"
              >
                7-Day Menu
              </button>
              <button
                type="button"
                onClick={() => jumpToStudioTab("sous-chef")}
                className="hover:text-[#000000]"
              >
                Voice Chef
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Instant Command Palette (Zero animation on keyboard trigger per Emil's rule) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#141314]/60 flex items-start justify-center pt-24 px-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] shadow-2xl overflow-hidden text-[#000000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#d3d4c8] bg-[#e9eade]">
              <Search className="h-4 w-4 text-[#000000]" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search recipes, ingredients, or kitchen tools..."
                className="w-full bg-transparent text-sm text-[#000000] placeholder:text-[#4d4c4c] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="text-xs px-2 py-0.5 rounded bg-[#f1f3e6] border border-[#d3d4c8] text-[#333333] hover:text-[#000000]"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-[#d3d4c8]">
              <div className="pb-2">
                <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-[#4d4c4c] font-semibold">
                  Quick Actions
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    onOpenOcrModal();
                  }}
                  className="w-full px-3 py-2 rounded-[6px] text-left text-sm text-[#000000] hover:bg-[#e9eade] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#3f6212]" />
                    Import Recipe from Link or Cookbook Photo
                  </span>
                  <span className="text-xs text-[#4d4c4c]">Import</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    jumpToStudioTab("kinetic-prep");
                  }}
                  className="w-full px-3 py-2 rounded-[6px] text-left text-sm text-[#000000] hover:bg-[#e9eade] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <GitMerge className="h-4 w-4 text-[#3f6212]" />
                    Cook 2–4 Dishes Together (Parallel Timeline)
                  </span>
                  <span className="text-xs text-[#4d4c4c]">Timeline</span>
                </button>
              </div>
              <div className="pt-2">
                <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-[#4d4c4c] font-semibold">
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
                    className="w-full px-3 py-2 rounded-[6px] text-left text-sm text-[#000000] hover:bg-[#e9eade] flex items-center justify-between"
                  >
                    <span className="truncate pr-3 font-medium">{r.title}</span>
                    <span className="text-xs text-[#333333] shrink-0 font-mono tabular-nums">
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
