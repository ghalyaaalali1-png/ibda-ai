import type { Locale } from "../config";

const n = (v: number) => v.toLocaleString("en-US");
const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** Filled in from the founder's answers, already in the interface language. */
export type StageContext = { business: string; location: string | null; budget: string | null };

type StageCopy = { title: string; result: string; activities: Record<string, string> };

/**
 * English interface copy. Every other language must provide the same keys
 * (see Dictionary). Business data from Claude or the demo is not in here.
 */
export const en = {
  locale: "en" as Locale,

  fmt: {
    aed: (amount: number) => `${amount < 0 ? "−" : ""}AED ${n(Math.abs(amount))}`,
    aedRange: (min: number, max: number) => `AED ${n(min)}–${n(max)}`,
    number: n,
    /** "a, b and c" */
    list: (items: string[]) =>
      items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`,
  },

  common: {
    brand: "KHITTA",
    brandArabic: "خِطّة",
    homeLabel: "KHITTA home",
    tagline: "AI Business Launch Agent",
    startMyBusiness: "Start My Business",
    languageLabel: "Language",
    backToHome: "Back to home",
    startOver: "Start over",
    opensInNewTab: "(opens in a new tab)",
    close: "Close",
    copy: "Copy",
    copied: "Copied",
    agentSpeaker: "KHITTA:",
    userSpeaker: "You:",
    typing: "KHITTA is typing…",
    businessPlan: "Business Plan",
    suppliers: "Suppliers",
    marketing: "Marketing",
    marketingPlan: "Marketing Plan",
    launchPack: "Launch Pack",
    workspace: "Workspace",
    agentWorkspace: "Agent Workspace",
    backToBusinessPlan: "Back to Business Plan",
    backToBusinessPlanLabel: "Back to business plan",
    backToSuppliers: "Back to Suppliers",
    backToMarketingPlan: "Back to Marketing Plan",
    nextStep: "Next step",
    finalStep: "Final step",
    requestQuote: "Request quote",
    targetCustomer: "Target customer",
    goal: "Goal: ",
    week: (w: number) => `Week ${w}`,
  },

  meta: {
    title: "KHITTA — AI Business Launch Agent",
    description:
      "KHITTA turns your business idea into a launch-ready plan — feasibility, pricing, suppliers, UAE setup and marketing.",
    pages: {
      start: { title: "Start My Business", description: "Tell KHITTA your business idea and it will prepare your analysis." },
      analysis: { title: "Agent Workspace", description: "Watch KHITTA work through your business launch analysis." },
      plan: { title: "Business Plan", description: "Your launch-ready business plan, prepared by KHITTA." },
      suppliers: { title: "Suppliers", description: "Sourcing options KHITTA researched and ranked for your launch." },
      marketing: { title: "Marketing Plan", description: "Your launch marketing plan, prepared by KHITTA from your business plan." },
      launchPack: {
        title: "Launch Pack",
        description: "Your business launch pack, consolidated by KHITTA from your plan, suppliers, requirements and marketing.",
      },
    },
  },

  nav: {
    howItWorks: "How it Works",
    whatWeDo: "What KHITTA Does",
    forUae: "For UAE Entrepreneurs",
    main: "Main",
    mobile: "Mobile",
    footer: "Footer",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    copyright: (year: number) => `© ${year} KHITTA. Made in the UAE.`,
  },

  landing: {
    demoIdea: "I want to launch an online abaya brand in Dubai with a budget of AED 30,000.",
    hero: {
      titleStart: "Turn your business idea into a",
      titleHighlight: "launch-ready plan.",
      subtitle:
        "From feasibility and pricing to suppliers, UAE setup and marketing — KHITTA helps you figure out what to do next.",
      seeHowItWorks: "See How It Works",
    },
    agentFlow: {
      name: "KHITTA Agent",
      analyzing: "Analyzing",
      planReady: "Plan ready",
      label: "KHITTA agent process: Business Idea, Market Research, Feasibility, Suppliers, UAE Setup, Launch Plan",
      steps: [
        { label: "Business Idea", detail: "Online abaya brand · Dubai · AED 30k" },
        { label: "Market Research", detail: "Mapping competitors & price points" },
        { label: "Feasibility", detail: "Demand, costs & break-even modelled" },
        { label: "Suppliers", detail: "Fabric, tailoring & packaging options" },
        { label: "UAE Setup", detail: "E-commerce licensing options outlined" },
        { label: "Launch Plan", detail: "90-day go-to-market roadmap" },
      ],
      launchBudget: "Launch budget",
      targetMargin: "Target gross margin",
    },
    capabilities: {
      eyebrow: "What KHITTA Does",
      titleStart: "One agent.",
      titleHighlight: "Every launch decision.",
      description:
        "KHITTA doesn't just hand you information. It works through your launch — researching, analyzing, calculating, finding, guiding and planning — until you know exactly what to do.",
      items: [
        {
          verb: "Research & Analyze",
          title: "Feasibility & Market Research",
          description:
            "KHITTA researches demand, competition and risk, then analyzes whether your idea holds up — before you spend a dirham.",
          outputs: ["Demand signals", "Competitor map", "Risk check"],
        },
        {
          verb: "Calculate",
          title: "Costs, Pricing & Margins",
          description:
            "KHITTA calculates startup costs, unit economics and a price that actually leaves you a margin — all in AED.",
          outputs: ["Startup budget", "Unit economics", "Break-even"],
        },
        {
          verb: "Find",
          title: "Supplier Discovery",
          description:
            "KHITTA finds supplier options for what you need to sell or build, and tells you what to ask before you commit.",
          outputs: ["Shortlist", "Price ranges", "MOQs"],
        },
        {
          verb: "Guide",
          title: "UAE Business Setup",
          description:
            "Mainland or free zone, which activity, which documents — guidance based on current requirements and official sources.",
          outputs: ["Setup options", "Licensing steps", "Checklist"],
        },
        {
          verb: "Plan",
          title: "Marketing & Launch Plan",
          description: "KHITTA plans your positioning, channels and week-by-week actions to win your first customers.",
          outputs: ["Positioning", "Channel mix", "90-day plan"],
        },
      ],
    },
    howItWorks: {
      eyebrow: "How KHITTA Works",
      title: "From idea to plan in three steps.",
      description: "No spreadsheets to set up, no consultants to brief. Share your idea and the agent does the work.",
      steps: [
        {
          title: "Tell KHITTA your idea",
          description:
            "Describe what you want to build in a few sentences — in your own words. No business plan template required.",
        },
        {
          title: "KHITTA researches and analyzes it",
          description:
            "The agent works through your launch step by step — researching the market, analyzing feasibility, calculating costs, finding suppliers and checking UAE setup requirements.",
        },
        {
          title: "Get your launch-ready action plan",
          description:
            "Clear decisions, cost and pricing calculations, supplier options, UAE setup guidance and the exact next steps to take — in order.",
        },
      ],
      process: ["Research", "Analyze", "Calculate", "Find", "Guide", "Plan"],
      processLabel: "How the KHITTA agent works through your launch",
    },
    uae: {
      eyebrow: "For UAE Entrepreneurs",
      titleStart: "Built for founders",
      titleHighlight: "launching in the UAE.",
      description:
        "Generic business advice doesn't know the difference between a mainland license and a free zone. KHITTA guides you through it — step by step, in AED.",
      points: [
        {
          title: "Mainland or free zone?",
          description: "Compare the setup options that may suit your activity, budget and where you want to sell.",
        },
        {
          title: "Priced in AED",
          description: "License, visa, rent and inventory estimates in local currency — not generic global averages.",
        },
        {
          title: "Emirate-aware guidance",
          description:
            "Requirements and costs differ across Dubai, Abu Dhabi, Sharjah and beyond — KHITTA's guidance reflects that.",
        },
        {
          title: "Local sourcing",
          description: "Suppliers within the UAE and wider GCC, so you can move fast and keep lead times short.",
        },
      ],
      disclaimer:
        "KHITTA's UAE setup information is guidance based on current requirements and official sources — not legal advice. Confirm final requirements with the relevant licensing authority.",
    },
    finalCta: {
      title: "Your idea deserves a plan.",
      description:
        "Tell KHITTA what you want to launch. It researches, calculates and plans with you — then shows you exactly what to do next.",
    },
  },

  /** Labels and answer options for the founder's profile, by field id and stored value. */
  profile: {
    labels: {
      business: "Business",
      location: "Location",
      budget: "Budget",
      channel: "Sales channel",
      stage: "Stage",
      abayaType: "Type",
      priceRange: "Target price",
      designCount: "Launch designs",
      production: "Production",
    } as Record<string, string>,
    /** Stored answers are kept in English; this maps them for display (English shows them as stored). */
    values: {} as Record<string, string>,
  },

  onboarding: {
    greeting:
      "Hi, I'm KHITTA. Tell me what you want to build, and I'll help you figure out whether it makes sense and how to launch it.",
    composerLabel: "Describe your business idea",
    composerPlaceholder: "Describe your business idea...",
    composerHint: "Enter to send · Shift + Enter for a new line",
    send: "Send idea",
    tryDemo: "Try the demo",
    reading: "Reading your idea…",
    known: { business: "business type", location: "location", budget: "budget", channel: "sales channel" } as Record<string, string>,
    acknowledgement: (known: string, questions: number) =>
      `Great — I already have your ${known}. I just need ${
        questions === 1 ? "one more detail" : "a few more details"
      } before I start.`,
    step: (step: number, total: number) => `Step ${step} of ${total}`,
    chooseAnswer: "Choose an answer",
    change: "Change",
    changeAnswer: (label: string) => `Change answer: ${label}`,
    thanks: "Thanks — that's everything I need.",
    summaryIntro: "Here's a quick summary before I begin. You can change anything that isn't right.",
    summaryTitle: "Here's what I understand",
    ready: "Ready",
    changeField: (label: string) => `Change ${label.toLowerCase()}`,
    startAnalysis: "Start Analysis",
    starting: "Starting analysis…",
    startFootnote:
      "KHITTA will research the market, calculate feasibility, find supplier options, review UAE setup requirements and build your launch plan.",
    progressLabel: "Onboarding progress",
    /** Question copy by question id; options are shown by stored value. */
    questions: {
      location: { prompt: "Which emirate are you planning to launch in?", helper: "Setup options and costs differ between emirates." },
      budget: { prompt: "Roughly what budget are you starting with?", helper: "I'll use this to check what's realistic for your launch." },
      abayaType: {
        prompt: "What type of abayas are you planning to sell?",
        helper: "This shapes your fabric costs, suppliers and who you're selling to.",
      },
      priceRange: { prompt: "What price range are you targeting?", helper: "I'll use this to check your margins against your budget." },
      designCount: {
        prompt: "How many designs do you want to launch with?",
        helper: "More designs means more upfront stock — I'll factor this into your costs.",
      },
      production: {
        prompt: "How do you plan to produce them?",
        helper: "Production is usually the biggest cost decision for a new abaya brand.",
      },
      channel: { prompt: "How do you plan to sell?", helper: "This changes your setup, costs and marketing approach." },
      stage: { prompt: "Where are you right now?", helper: "So I know where your plan should start." },
    } as Record<string, { prompt: string; helper: string }>,
    /** KHITTA's reaction to an answer, by question id and stored value. */
    reactions: {
      abayaType: {
        Everyday: "Everyday abayas — volume and repeat customers will matter.",
        Premium: "Premium — a strong position for an online-first brand.",
        Luxury: "Luxury — fabric quality and presentation will carry the brand.",
        "Modest fashion mix": "A modest fashion mix — that widens your audience.",
      },
      priceRange: {
        "Under AED 300": "Accessible pricing — margins will need careful costing.",
        "AED 300–600": "That range leaves room for both quality and margin.",
        "AED 600–1,000": "That gives healthy room for premium fabric and margin.",
        "AED 1,000+": "At that level, exclusivity and presentation become essential.",
      },
      designCount: {
        "3–5": "A focused first collection keeps inventory risk low.",
        "6–10": "A solid range — I'll check it fits your budget.",
        "10+": "Ambitious — I'll check how far your budget stretches.",
      },
    } as Record<string, Record<string, string>>,
  },

  analysis: {
    statusComplete: "Analysis complete",
    statusStopped: "Analysis stopped",
    statusWorking: "Analysis in progress",
    titleComplete: "Your launch plan is ready.",
    titleFailed: "I couldn't finish your analysis",
    titleWorking: "KHITTA is building your launch plan",
    subtitleComplete: "I've worked through your market, numbers, suppliers and UAE setup. Here's what I found.",
    subtitleFailed: "Something went wrong while preparing your plan. Your answers are saved, so you can try again.",
    subtitleWorking: "I'm researching your market, testing the numbers, finding options and checking what you'll need to launch.",
    errorTitle: "Analysis not completed",
    errorNoPlan: "No plan has been created for your business yet.",
    tryAgain: "Try again",
    startOverDifferent: "Start over with a different idea",
    stagesComplete: (done: number, total: number) => `${done} of ${total} stages complete`,
    stageOf: (stage: number, total: number) => `Stage ${stage} of ${total}`,
    progressLabel: "Analysis progress",
    readyTitle: "Everything is ready to review",
    readyFallback: "Costs, pricing, suppliers, UAE setup and a launch timeline.",
    viewPlan: "View My Business Plan",
    replay: "Replay analysis",
    logFailed: "The analysis couldn't be completed",
    logPending: "Finalising your assessment with Claude",
    initialAssessment: "Initial assessment",
    activityTitle: "Agent activity",
    activityCounts: (steps: number, types: number) => `${steps} steps · ${types} action types`,
    activityLog: "Agent activity log",
    allComplete: "All stages complete — launch plan assembled.",
    footerLive: "Analysis by Claude — figures are estimates",
    footerDemo: "Prototype analysis — demo data",
    stagesLabel: "Analysis stages",
    stageNumber: (i: number) => `Stage ${i}`,
    stageDone: "Done",
    stageWorking: "Working",
    stageNotCompleted: "Not completed",
    stageQueued: "Queued",
    actions: {
      Reviewing: "Reviewing",
      Researching: "Researching",
      Calculating: "Calculating",
      Comparing: "Comparing",
      "Checking sources": "Checking sources",
      Planning: "Planning",
      Assuming: "Assuming",
      "Needs input": "Needs input",
    } as Record<string, string>,
    feasibility: {
      FEASIBLE: "Feasible",
      FEASIBLE_WITH_CHANGES: "Feasible with changes",
      CURRENTLY_NOT_FEASIBLE: "Currently not feasible",
    },
    evidence: { USER_PROVIDED: "user provided", ESTIMATE: "estimate", NOT_YET_CONFIRMED: "not yet confirmed" },
    results: {
      targetCustomer: (headline: string) => `Target customer: ${headline}`,
      supplierCategories: (count: number) => `${count} supplier categories identified`,
      route: (name: string | null) => `Suggested route: ${name ?? "to be confirmed"}`,
      nextStep: (title: string) => `Next step: ${title}`,
    },
    /** Stage copy for the abaya demo. */
    abayaStages: (c: StageContext): Record<string, StageCopy> => ({
      understand: {
        title: "Understanding your business",
        result: "Launch profile confirmed",
        activities: { profile: "Reviewing your launch profile", choices: "Confirming product, price and production choices" },
      },
      market: {
        title: "Researching the UAE market",
        result: "Market, customer and price benchmarks reviewed",
        activities: {
          market: "Analyzing UAE modest fashion market",
          customer: "Reviewing target customer and positioning",
          competitors: "Checking competitor price ranges",
        },
      },
      feasibility: {
        title: "Calculating feasibility",
        result: "Startup costs, unit economics and break-even estimated",
        activities: {
          costs: "Estimating startup costs",
          budget: c.budget ? `Testing ${c.budget} budget` : "Testing your budget",
          unit: "Calculating unit economics",
          breakeven: "Estimating break-even",
        },
      },
      suppliers: {
        title: "Finding supplier options",
        result: "Fabric and tailoring options shortlisted",
        activities: {
          fabric: "Comparing UAE fabric suppliers",
          tailoring: "Reviewing tailoring options",
          moq: "Checking estimated MOQs and lead times",
        },
      },
      setup: {
        title: "Checking UAE setup requirements",
        result: "Setup options and requirements outlined",
        activities: {
          activity: "Reviewing e-commerce activity requirements",
          options: "Comparing suitable setup options",
          official: "Checking relevant official-source guidance",
        },
      },
      plan: {
        title: "Building your launch plan",
        result: "Budget, timeline and marketing priorities ready",
        activities: {
          allocation: "Creating budget allocation",
          timeline: "Building launch timeline",
          marketing: "Preparing marketing priorities",
        },
      },
    }),
    /** Industry-neutral stage copy for any other business. */
    genericStages: (c: StageContext): Record<string, StageCopy> => ({
      understand: {
        title: "Understanding your business",
        result: "Launch profile confirmed",
        activities: { profile: "Reviewing your launch profile", choices: "Confirming your budget, channel and launch stage" },
      },
      market: {
        title: "Researching the UAE market",
        result: "Market, customer and price benchmarks reviewed",
        activities: {
          market: `Analyzing demand for your ${c.business} in ${c.location ?? "the UAE"}`,
          customer: "Reviewing target customer and positioning",
          competitors: "Checking typical competitor price ranges",
        },
      },
      feasibility: {
        title: "Calculating feasibility",
        result: "Startup costs, unit economics and break-even estimated",
        activities: {
          costs: "Estimating startup costs",
          budget: c.budget ? `Testing your ${c.budget} budget` : "Testing your budget",
          unit: "Calculating unit economics",
          breakeven: "Estimating break-even",
        },
      },
      suppliers: {
        title: "Finding supplier options",
        result: "Supplier options shortlisted",
        activities: {
          categories: "Identifying the supplier categories you need",
          types: `Comparing supplier types and price ranges in ${c.location ?? "the UAE"}`,
          moq: "Checking typical minimum orders and lead times",
        },
      },
      setup: {
        title: "Checking UAE setup requirements",
        result: "Setup options and requirements outlined",
        activities: {
          activity: "Reviewing licence activity requirements",
          options: "Comparing suitable setup options",
          approvals: "Flagging approvals to confirm with official sources",
        },
      },
      plan: {
        title: "Building your launch plan",
        result: "Budget, timeline and marketing priorities ready",
        activities: {
          allocation: "Creating budget allocation",
          timeline: "Building launch timeline",
          marketing: "Preparing marketing priorities",
        },
      },
    }),
  },

  /** Stand-in for a results screen while loading, or when the analysis isn't available. */
  status: {
    screens: {
      plan: "Business Plan",
      suppliers: "Suppliers",
      marketing: "Marketing Plan",
      launchPack: "Launch Pack",
      workspace: "Agent Workspace",
    },
    loading: (screen: string) => `Loading your ${screen.toLowerCase()}…`,
    unavailableTitle: "Your analysis isn't ready",
    unavailableBody: (screen: string) =>
      `KHITTA couldn't finish analysing your business, so there's no ${screen.toLowerCase()} to show yet. Your answers are saved — run the analysis again.`,
    translating: (screen: string) => `Translating your ${screen.toLowerCase()} into English…`,
    translationFailedTitle: "Your plan couldn't be translated",
  },

  /** Messages from the API routes, shown as they are in English. */
  errors: {} as Record<string, string>,
  genericError: "Something went wrong. Please try again.",

  sources: {
    verifyPortal: "Verify through the official UAE government portal (u.ae)",
    officialSource: (name: string) => `Official source: ${name}`,
    government: (scope: string) => `${scope} government`,
    federal: "Federal",
  },

  plan: {
    planReady: "Plan ready",
    backToWorkspace: "Back to agent workspace",
    preparedBy: "Prepared by KHITTA",
    title: "Your launch plan",
    sourceLive: "Prepared by Claude from your answers — figures are estimates, not yet verified",
    sourceDemo: "Prototype analysis — demo data",
    decision: {
      label: "Overall decision",
      scale: "Decision scale",
      viability: "Viability / 100",
      verdicts: { GO: "GO", CAUTION: "CAUTION", "NO-GO": "NO-GO" },
    },
    ideaTitle: "Business idea",
    tiles: {
      budget: "Startup budget",
      allocated: (allocated: string, reserve: string) => `${allocated} allocated · ${reserve} reserve`,
      price: "Recommended price",
      heroPrice: (price: string, unit: string) => `Hero price ${price} per ${unit}`,
      margin: "Est. gross margin",
      grossProfit: (amount: string, unit: string) => `${amount} gross profit per ${unit}`,
      breakEven: "Break-even",
      sales: (count: number, months: number | null) => `≈${n(count)} sales${months !== null ? ` in ${months} months` : ""}`,
      covers: (count: number) => `${n(count)}/month covers running costs`,
      loses: "each sale loses money at this price",
    },
    month: (m: number) => `Month ${m}`,
    beyondMonth: (m: number) => `Beyond month ${m}`,
    costs: {
      title: "Estimated startup costs",
      of: (spend: string, total: string) => `${spend} of ${total}`,
      split: "Startup budget split by cost category",
      caption: "Startup cost breakdown",
      category: "Category",
      amount: "Amount",
      share: "Share of budget",
      reserve: "Cash reserve",
      reserveNote: "Buffer for reorders and surprises",
    },
    unit: {
      title: "Pricing & unit economics",
      sellingPrice: "Recommended selling price",
      per: (unit: string, price: string) => `Per ${unit} at ${price}`,
      kept: (pct: number) => `${pct}% kept after all costs`,
      loses: "Each sale loses money at this price",
      split: (costs: string, contribution: string) => `Costs ${costs}, contribution ${contribution}`,
      contribution: "Contribution per sale",
    },
    breakEven: {
      title: "Break-even estimate",
      axis: "Cumulative cash, AED",
      cover: (count: number, costs: string) => `${n(count)} sales/month cover ${costs} running costs`,
      loses: (costs: string) => `Each sale loses money, so no volume covers ${costs} running costs`,
      chart: (from: string, to: string, months: number, month: number | null) =>
        `Cumulative cash from ${from} at launch to ${to} by month ${months}, ${
          month === null ? "not breaking even in that period" : `breaking even in month ${month}`
        }.`,
      launch: "Launch",
      monthShort: (m: number) => `M${m}`,
      marker: "Break-even",
      salesCount: (count: number) => `${count} sales`,
      toRecover: "Startup spend to recover",
      runningCosts: "Monthly running costs",
    },
    risks: { title: "Key risks", severity: { High: "High", Medium: "Medium", Low: "Low" } },
    market: {
      title: "Market opportunity",
      bands: (unit: string) => `${unit} price bands, AED`,
      yourRange: "Your recommended range",
    },
    setup: {
      title: "UAE setup & licensing",
      activity: "Likely licence activity: ",
      path: "Your likely setup path",
      stages: {
        activity: "Business activity",
        route: "Setup route",
        authority: "Authority",
        approvals: "Approvals",
        establishment: "Establishment",
        next: "Next action",
      },
      routes: "Setup routes to compare",
      suggested: "Suggested",
      levels: { likely: "Likely required", depends: "May be required", confirm: "Needs official confirmation" },
      sources: "Official sources to verify with",
      disclaimer:
        "Planning guidance only — not legal, tax or regulatory advice. KHITTA can't issue licences, submit applications or contact authorities for you. Requirements, eligibility and fees change and depend on your situation, so confirm them with the relevant authority before you act.",
    },
    nextActions: { title: "Recommended next actions", startHere: "Start here" },
    upcoming: {
      eyebrow: "Continue your plan",
      title: "Next parts of your launch plan",
      ready: "Ready",
      upNext: "Up next",
      titles: { suppliers: "Suppliers", marketing: "Marketing Plan", launch: "Launch Pack" } as Record<string, string>,
      launchDescription: "Everything in one place: readiness, key figures, supplier shortlist, requirements and a launch checklist.",
      launchIncludes: ["Launch readiness", "Final checklist", "Still to verify"],
    },
    /** Text the plan builder adds around Claude's figures. */
    built: {
      evidence: { USER_PROVIDED: "Your figure", ESTIMATE: "Estimate", NOT_YET_CONFIRMED: "To confirm" },
      scaled: "Cost estimates exceeded it and were scaled to fit",
      priceBelowCost: "Estimated price doesn't cover unit costs",
      noBreakEven: (months: number) => `No break-even within ${months} months (estimate)`,
      priceBandsNote: "Estimates — not yet researched",
      feeToConfirm: "Fee requires official confirmation",
    },
    demo: { priceBandsNote: "Demo estimates" },
  },

  suppliers: {
    rfqCount: (count: number, sent: number) => `${count} RFQ${count > 1 ? "s" : ""} · ${sent} sent`,
    sourcedBy: "Sourced by KHITTA",
    title: "Suppliers for your launch",
    browseTitle: "All options, ranked by fit",
    categoriesLabel: "Supplier categories",
    shortlist: {
      recommendedBy: "Recommended by KHITTA",
      title: "Your launch sourcing shortlist",
      criteria: (criteria: string, budget: string) =>
        `One pick per category, chosen for ${criteria} and fit with your ${budget} budget.`,
      estimate: "First-run sourcing estimate",
      within: (allocation: string, label: string) => `Within your plan's ${allocation} for ${label}`,
      over: (amount: string) => `${amount} over your plan's sourcing allocation`,
    },
    matchSr: " out of 100 KHITTA match",
    card: {
      pick: "KHITTA pick",
      overseas: "Overseas",
      match: "KHITTA match",
      price: "Est. price",
      moq: "MOQ",
      leadTime: "Lead time",
      bestFor: "Best for: ",
      openRfq: "Open RFQ",
      compareLimit: "You can compare up to 4 suppliers",
      comparing: "Comparing",
      compare: "Compare",
      rfqSent: "RFQ marked sent",
      rfqDrafted: "RFQ drafted",
    },
    compare: {
      title: "Compare suppliers",
      selected: (count: number) => `${count} of 4 selected`,
      mixed: " · pick one category for like-for-like highlights",
      emptyStart: "Add suppliers with",
      emptyButton: "Compare",
      emptyEnd: "to see cost, MOQ, lead time and fit side by side.",
      caption: "Supplier comparison",
      supplier: "Supplier",
      category: "Category",
      fit: "KHITTA fit",
      bestFor: "Best for",
      watchOut: "Watch out",
      best: "Best",
      remove: (name: string) => `Remove ${name} from comparison`,
    },
    format: {
      noMinimum: "No minimum",
      weeks: (min: number, max: number) => (min === max ? `${max} weeks` : `${min}–${max} weeks`),
      days: (min: number, max: number) => `${min}–${max} days`,
    },
    rfq: {
      closeLabel: "Close RFQ",
      draftedBy: "Supplier enquiry · drafted by KHITTA",
      using: "Using your business plan",
      tone: "Tone",
      tones: { formal: "formal", concise: "concise" },
      drafting: "Drafting your enquiry from the plan…",
      subject: "Subject",
      message: "Message",
      copyMessage: "Copy message",
      markSent: "Mark as sent",
      markedSent: "Marked as sent",
      /** The enquiry itself, in the interface language. */
      draft: {
        subject: (offering: string, brand: string) => `Quote request: ${offering.toLowerCase()} for ${brand}`,
        yourName: "[Your name]",
        concise: {
          greeting: (name: string | null) => (name ? `Hi ${name} team,` : "Hi there,"),
          intro: (brand: string, location: string, need: string) => `I'm launching ${brand} in ${location} and I'm looking for ${need}.`,
          ask: "Could you share:",
          close: (launchWindow: string) => `We're aiming to launch ${launchWindow}. Thanks — happy to visit or jump on a call.`,
          signOff: "Best regards,",
        },
        formal: {
          greeting: (name: string | null) => (name ? `Dear ${name} team,` : "Dear Sir or Madam,"),
          intro: (brand: string, location: string, positioning: string) => `I am the founder of ${brand} based in ${location}. ${positioning}`,
          request: (need: string) => `We would like to request a quotation for ${need}.`,
          ask: "Could you please confirm the following:",
          close: (launchWindow: string, isType: boolean) =>
            `We are planning to launch ${launchWindow}, so we would appreciate your quotation and availability at your earliest convenience. ${
              isType ? "We would be glad to arrange a call or meeting to discuss further." : "We would also be glad to visit your premises to review samples."
            }`,
          signOff: "Kind regards,",
          footer: "[Brand name] · [Phone] · [Email]",
        },
        fallback: { need: "a quotation for your products or services", questions: ["Unit price", "Minimum order", "Lead time", "Delivery"] },
        /** The abaya demo's requests: `designs` designs × `pieces` pieces = `total`. */
        demo: {
          fabric: (designs: number, pieces: number, total: number) => ({
            need: `fabric for a first collection of ${designs} designs (${pieces} pieces each, ${total} pieces in total)`,
            questions: [
              "Price per metre for your premium black crepe and nida, including any colour options",
              "Minimum cut per colour, and whether you can supply around 20–25 m per colour",
              "Availability of swatches before we order",
              "Current lead time and whether the same lot can be reserved for reorders",
            ],
          }),
          tailoring: (designs: number, pieces: number, total: number) => ({
            need: `sampling and production for ${designs} abaya designs, with a small initial run of ${pieces} pieces per design (${total} pieces)`,
            questions: [
              "Cost per sample and per production piece, including pattern making",
              `Whether you accept ${pieces} pieces per design as a minimum`,
              "Lead time for samples and for the first production run",
              "Your quality checks and how alterations or defects are handled",
            ],
          }),
          embellishment: (_designs: number, _pieces: number, total: number) => ({
            need: `trims or embellishment for 1–2 signature designs within a ${total}-piece first collection`,
            questions: [
              "Price per metre or per panel for subtle, premium detailing",
              "Minimum order and whether you can supply around 10 m",
              "Whether samples can be sent to our tailor for a fitting",
              "Lead time and colour-matching options",
            ],
          }),
          packaging: (_designs: number, _pieces: number, total: number) => ({
            need: `premium gift boxes for a first run of ${total} pieces, with a simple foil logo`,
            questions: [
              "Price per box at 50 and 100 units, including logo printing",
              "Available sizes for a folded abaya, and insert or tissue options",
              "Artwork requirements and a proof before production",
              "Lead time and delivery within Dubai",
            ],
          }),
        },
      },
    },
    continueDescription: "Positioning, launch channels and a 90-day calendar to win your first customers.",
    continueTo: "Continue to Marketing Plan",
    /** Text the supplier builder adds around Claude's supplier planning. */
    built: {
      intro: (count: number, categories: string, business: string) =>
        `I compared ${count} supplier types across ${categories}, then ranked them for the first launch of your ${business} on your budget.`,
      sourceNote: "Supplier types, not specific businesses — prices are estimates",
      badge: "Supplier type",
      badgePlural: "Supplier types",
      contactNote:
        "This is a supplier type, not a specific business — find suppliers of this type, then copy the message to send it to them.",
      criteria: "low minimums, lead time",
      startupSpend: "startup spend",
      highlights: {
        budget: (amount: string) => `Budget ${amount}`,
        price: (range: string, unit: string) => `Price ${range} per ${unit}`,
        location: (location: string) => `Based in ${location}`,
        launch: (weeks: number | null) => `Launch ${weeks ? `in ${weeks} weeks` : "in the coming weeks"}`,
      },
      /** How the founder's business is described in the supplier enquiry. */
      brief: {
        brand: (business: string) => `a new ${business}`,
        positioning: (range: string, unit: string) => `We are preparing to launch, with a planned price of ${range} per ${unit}.`,
        launchWindow: (weeks: number | null) => (weeks ? `within the next ${weeks} weeks` : "in the coming weeks"),
      },
    },
    demo: {
      intro: (count: number) =>
        `I compared ${count} supplier options across fabric, tailoring, embellishment and packaging, then ranked them for a premium first run of 36 pieces on your budget.`,
      sourceNote: "Prototype supplier data — demo, not verified suppliers",
      badge: "Demo supplier",
      badgePlural: "Demo suppliers",
      contactNote:
        "Demo supplier — contact details aren't included in prototype data. Copy the message to send it to a real supplier.",
      criteria: "low minimums, premium finishing",
      allocationLabel: "stock and packaging",
      highlights: ["6 designs × 6 pieces = 36", "Retail AED 600–1,000", "Premium positioning", "Launch in 8 weeks"],
    },
  },

  marketing: {
    plannedBy: "Planned by KHITTA",
    title: "Your launch marketing plan",
    strategy: {
      label: "Marketing strategy summary",
      objective: "Launch objective",
      positioning: "Brand positioning",
      value: "Value proposition",
      channels: "Recommended channels",
      priority: { Primary: "Primary", Support: "Support" },
    },
    calendar: {
      title: "90-day marketing calendar",
      summary: (weeks: number, launchWeek: number | undefined) =>
        `${weeks} weeks${launchWeek ? ` · launch in week ${launchWeek}` : ""}`,
      phasesLabel: "Campaign phases",
      phases: { prelaunch: "Pre-launch", launch: "Launch", growth: "Growth" },
      weeks: (first: number, last: number) => (first === last ? `Week ${first}` : `Weeks ${first}–${last}`),
      week: "Week",
      tags: { Content: "Content", Creators: "Creators", Ads: "Ads", Community: "Community", Setup: "Setup", Review: "Review" },
    },
    budget: {
      title: "Marketing budget allocation",
      total: (amount: string) => `${amount} total`,
      noNewSpend: (lines: number) =>
        `No new spend — this splits the ${
          lines === 1 ? "marketing line" : `${lines === 2 ? "two" : lines} marketing lines`
        } already in your business plan.`,
      fromPlan: "from plan",
      split: (line: string) => `${line} split`,
      breakdown: (line: string) => `${line} breakdown`,
    },
    content: {
      title: "Content plan",
      platforms: (names: string[]) => (names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`),
      rhythm: "Rhythm: ",
    },
    launchMonth: {
      title: "Launch month content calendar",
      summary: (posts: number, first?: number, last?: number) =>
        `${posts} posts${first && last ? ` · weeks ${first}–${last} of your plan` : ""}`,
      weeksLabel: "Launch month weeks",
      copied: "Caption copied",
      copyCaption: (topic: string) => `Copy caption: ${topic}`,
      footnote: "Captions are drafts for you to review and publish. Replace anything in [brackets] with your own details.",
    },
    inspiration: {
      title: "Competitor inspiration",
      works: "What works",
      adapt: "Make it yours",
      avoid: "Avoid",
      footnote:
        "Patterns from kinds of businesses, not specific accounts — KHITTA hasn't researched named competitors yet. Look at real examples yourself and never copy their content.",
    },
    generator: {
      eyebrow: "AI content generator",
      title: "Generate a ready-to-post caption",
      description: "KHITTA writes from your positioning, price range and launch timeline — pick what you need.",
      contentType: "Content type",
      types: {
        teaser: { label: "Teaser", objective: "Build the waitlist" },
        bts: { label: "Behind the scenes", objective: "Build trust in quality" },
        countdown: { label: "Launch countdown", objective: "Drive launch-day reminders" },
        reveal: { label: "Product reveal", objective: "Drive first sales" },
        styling: { label: "Styling", objective: "Show versatility" },
        ugc: { label: "Customer love", objective: "Build social proof" },
      } as Record<string, { label: string; objective: string }>,
      productInUse: "Product in use",
      platform: "Platform",
      language: "Language",
      generating: "Generating…",
      again: "Generate again",
      generate: "Generate Content",
      instagramPost: "Instagram post",
      tiktokVideo: "TikTok video",
      idleStart: "Choose a content type and press",
      idleEnd: ". Your caption will appear here.",
      thinking: "Writing from your strategy…",
      retry: "Try again in a moment.",
      visual: "Suggested visual",
      bestTime: "Best time to post",
      estimate: "estimate",
      demoEstimate: "demo estimate",
    },
    kpis: {
      title: "Launch KPIs",
      estimated: "Estimated targets",
      demo: "Demo targets",
      check: (when: string) => `Check: ${when}`,
    },
    nextMove: { eyebrow: "KHITTA recommended next move", draft: "Draft my first teaser post" },
    continueDescription: "Your plan, suppliers, requirements and marketing in one launch checklist, with what's still to verify.",
    continueTo: "Continue to Launch Pack",
    /** Text the marketing builder adds around Claude's marketing plan. */
    built: {
      intro: (business: string, location: string, range: string, unit: string, launchWeek: number | undefined) =>
        `Built from your business plan: your ${business} in ${location}, priced at ${range} per ${unit}${
          launchWeek ? `, a launch in week ${launchWeek}` : ""
        } and the marketing budget already in your plan.`,
      sourceNote: "Prototype plan — targets are estimates",
      footnote: (costs: string) => `From month 2, marketing is funded from sales within your ${costs} monthly running costs. Estimates.`,
      suggestedBudget: "Suggested marketing budget (estimate)",
      themes: {
        teaser: "Teaser & pre-launch",
        launch: "Launch week",
        education: "Education & value",
        proof: "Reviews & social proof",
      },
      firstMonth: {
        label: "First-month sales",
        when: "End of month 1",
        signal: "Matches the business plan's month-1 estimate",
      },
      /** Short post labels (days, formats) shown in the interface language when Claude kept them in English. */
      postLabels: {} as Record<string, string>,
    },
    demo: {
      intro:
        "Built from your business plan: premium positioning at AED 690–850, 6 designs, a Dubai launch in week 8 and the marketing budget you already have.",
      sourceNote: "Prototype plan — targets are demo estimates",
      footnote: "From month 2, ads are funded from sales within your AED 2,500 monthly running costs. Demo estimates.",
    },
  },

  launchPack: {
    title: "Your business launch pack",
    sourceLive: "Built from KHITTA's analysis of your answers — figures are estimates, not yet verified",
    sourceDemo: "Prototype launch pack — demo data",
    readiness: {
      caption: "Launch readiness",
      labels: { ready: "Ready to launch", conditions: "Proceed with conditions", "needs-work": "Needs work" },
      note: "Based only on what KHITTA has already generated for this business — not a guarantee of success.",
    },
    summary: { title: "Executive summary", positioning: "Positioning", assessment: "KHITTA's assessment" },
    pricing: {
      title: "Pricing recommendation",
      price: "Recommended price",
      typical: (price: string, unit: string, kept: string) => `Typical price ${price} per ${unit} · ${kept} kept per sale after costs`,
      footnote: "Estimates — confirm with real supplier quotes and early sales.",
    },
    suppliers: {
      title: "Supplier shortlist",
      caption: "Shortlisted suppliers with estimated first orders",
      category: "Category",
      supplier: "Supplier",
      minimum: "Minimum order",
      leadTime: "Lead time",
      firstOrder: "First order (est.)",
      total: (total: string, plan: string, label: string) => `Total ${total} vs plan ${plan} for ${label}`,
      over: (amount: string) => `${amount} over`,
      within: "Within plan",
    },
    requirements: {
      title: "Requirements & licensing checklist",
      activity: "Likely activity: ",
      route: "Suggested route: ",
      fee: " — fee requires official confirmation",
    },
    marketing: {
      title: "4-week marketing launch",
      posts: (posts: number, planWeek?: number) => `${posts} posts${planWeek ? ` · plan week ${planWeek}` : ""}`,
      budget: "Launch marketing budget",
      open: "Open the full marketing plan →",
    },
    checklist: {
      title: "Final launch checklist",
      before: "Before launch",
      launch: "Launch week",
      after: "After launch",
      footnote: "Every item comes from your plan, suppliers, requirements or marketing outputs — the tag shows which.",
    },
    outstanding: {
      title: "Still to answer or verify",
      count: (items: number) => `${items} items`,
      kinds: { "Question for you": "Question for you", "To verify": "To verify", Assumption: "Assumption" } as Record<string, string>,
    },
    from: {
      Assessment: "Assessment",
      Plan: "Plan",
      Suppliers: "Suppliers",
      Requirements: "Requirements",
      Marketing: "Marketing",
    } as Record<string, string>,
    disclaimer:
      "This launch pack is planning guidance based on the information and estimates available — not financial, legal or investment advice. KHITTA can't issue licences, submit applications, contact suppliers or publish content for you. Verify requirements with the relevant authority and replace estimates with real quotes before you commit money.",
    /** Text the launch-pack builder writes from earlier outputs. */
    built: {
      assessment: (headline: string) => `KHITTA's assessment: ${headline}`,
      assessmentChanges: (headline: string) => `KHITTA's assessment: feasible with changes — ${headline}`,
      priceBelowCost: "The planned price doesn't cover the estimated cost per sale",
      noBreakEven: (months: number) => `No break-even within ${months} months on current estimates`,
      overAllocation: (amount: string) => `Supplier estimates are ${amount} over the plan's sourcing allocation`,
      toConfirm: (count: number) => `${count} setup requirement${count > 1 ? "s need" : " needs"} official confirmation`,
      openQuestions: (count: number) => `${count} open question${plural(count, "", "s")} for you`,
      partial: "Some information is still missing or unverified",
      noConditions: "No open conditions in KHITTA's analysis",
      requestQuotes: "Request quotes from your shortlisted suppliers",
      arrange: (item: string) => `Arrange: ${item}`,
      teaserWeek: (goal: string) => `Run your teaser week: ${goal}`,
      checkIfNeeded: (item: string) => `Check if needed: ${item}`,
      estimate: "Estimate",
      notConfirmed: "Not yet confirmed",
      estimatesNote: "Startup costs, prices, unit costs and monthly sales are estimates",
      estimatesWhy: "Replace them with real quotes and early sales data",
      noBreakEvenNote: (months: number) => `On current estimates the business doesn't break even within ${months} months`,
      noBreakEvenWhy: "Revisit pricing, costs or sales once you have real figures",
      quotesWhy: "Get real quotes, samples and terms before ordering",
      overNote: (amount: string) => `Supplier estimates exceed the sourcing allocation by ${amount}`,
      overWhy: "Adjust quantities or the budget split",
    },
  },
};

export type Dictionary = typeof en;
