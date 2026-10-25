import { demoPlan } from "@/features/plan/demoPlan";
import type { MarketingPlan } from "./types";

/**
 * Prototype marketing plan for the abaya demo. Budget totals are read from
 * the business plan so the two screens can't disagree; targets are
 * illustrative estimates.
 */
const launchMarketing = demoPlan.costs.find((c) => c.id === "marketing")!;
const content = demoPlan.costs.find((c) => c.id === "content")!;
const firstMonthSales = demoPlan.breakEven.cashflow.find((p) => p.month === 1)!.sales;

export const demoMarketing: MarketingPlan = {
  strategy: {
    objective: `Open a 300-person waitlist before launch, sell ${firstMonthSales} pieces in month 1 and stay on track for break-even in month ${demoPlan.breakEven.month}.`,
    targetCustomer: demoPlan.market.targetCustomer,
    positioning:
      "Everyday luxury: designer-level fabric and finishing at AED 690–850, made in small Dubai runs.",
    valueProposition:
      "Premium crepe, tailored in Dubai in limited runs and finished like a designer piece — without designer pricing.",
    channels: [
      { name: "Instagram", role: "Home of the brand: reels, carousels and stories that sell", priority: "Primary" },
      { name: "Micro-creators", role: "Trusted first looks from Dubai and Abu Dhabi creators", priority: "Primary" },
      { name: "TikTok", role: "Discovery through styling and behind-the-scenes clips", priority: "Support" },
      { name: "WhatsApp & email waitlist", role: "Early access that converts on launch day", priority: "Support" },
      { name: "Paid social (Meta)", role: "Retarget engaged viewers once content is proven", priority: "Support" },
    ],
  },

  phases: [
    {
      id: "prelaunch",
      label: "Pre-launch",
      weeks: "Weeks 1–7",
      goal: "Build anticipation and a 300-person waitlist while the collection is made.",
      plan: [
        {
          week: 1,
          focus: "Foundations",
          actions: [
            { text: "Claim matching Instagram and TikTok handles; write a one-line bio", tag: "Setup" },
            { text: "Set up a link-in-bio waitlist page with early-access sign-up", tag: "Setup" },
          ],
        },
        {
          week: 2,
          focus: "Brand look",
          actions: [
            { text: "Create a moodboard and 3 grid templates from your fabric and colour palette", tag: "Content" },
            { text: "Follow and engage with 50 Dubai modest-fashion accounts", tag: "Community" },
          ],
        },
        {
          week: 3,
          focus: "First teasers",
          actions: [
            { text: "Post 3 teasers: fabric close-ups and a ‘coming soon’ reel", tag: "Content" },
            { text: "Shortlist 8 micro-creators (10k–50k followers) in Dubai and Abu Dhabi", tag: "Creators" },
          ],
        },
        {
          week: 4,
          focus: "Behind the scenes",
          actions: [
            { text: "Film sample fittings at the tailor for 2 BTS reels", tag: "Content" },
            { text: "Share the waitlist offer: early access + complimentary gift wrap", tag: "Community" },
          ],
        },
        {
          week: 5,
          focus: "Product shoot",
          actions: [
            { text: "Shoot all 6 designs: hero images, detail shots and 4 short reels", tag: "Content" },
            { text: "Send personal outreach to the 8 shortlisted creators", tag: "Creators" },
          ],
        },
        {
          week: 6,
          focus: "Design stories",
          actions: [
            { text: "Run a 6-part series — one post per design and the story behind it", tag: "Content" },
            { text: "Deliver gifted pieces to 5 confirmed creators", tag: "Creators" },
          ],
        },
        {
          week: 7,
          focus: "Countdown",
          actions: [
            { text: "Start a 7-day countdown in stories with daily design hints", tag: "Content" },
            { text: "Send the waitlist a private preview and launch-day time", tag: "Community" },
          ],
        },
      ],
    },
    {
      id: "launch",
      label: "Launch",
      weeks: "Weeks 8–9",
      goal: "Turn the waitlist and creator buzz into the first sales.",
      plan: [
        {
          week: 8,
          focus: "Launch week",
          actions: [
            { text: "Give the waitlist 24-hour early access, then open to everyone", tag: "Community" },
            { text: "Post the full collection reveal reel and a shoppable carousel", tag: "Content" },
            { text: "Creators publish first-look posts across launch week", tag: "Creators" },
            { text: "Start retargeting ads to video viewers and site visitors", tag: "Ads" },
          ],
        },
        {
          week: 9,
          focus: "Momentum",
          actions: [
            { text: "Post ‘3 ways to wear’ styling reels for the 2 best sellers", tag: "Content" },
            { text: "Reshare every customer and creator story", tag: "Community" },
            { text: "Move ad spend to the best-performing creative", tag: "Ads" },
          ],
        },
      ],
    },
    {
      id: "growth",
      label: "Growth",
      weeks: "Weeks 10–13",
      goal: "Build repeat buyers and social proof, then plan the next drop.",
      plan: [
        {
          week: 10,
          focus: "Social proof",
          actions: [
            { text: "Collect reviews and customer photos with a small thank-you note in each box", tag: "Community" },
            { text: "Turn the best customer photos into a ‘worn by you’ carousel", tag: "Content" },
          ],
        },
        {
          week: 11,
          focus: "Best sellers",
          actions: [
            { text: "Open pre-orders for the top-selling design before reordering", tag: "Community" },
            { text: "Scale the winning ad; pause anything above your CAC target", tag: "Ads" },
          ],
        },
        {
          week: 12,
          focus: "Second creator wave",
          actions: [
            { text: "Seed 3 new creators with the best sellers", tag: "Creators" },
            { text: "Create occasion content — office, evening and Ramadan/Eid looks", tag: "Content" },
          ],
        },
        {
          week: 13,
          focus: "Review & next drop",
          actions: [
            { text: "Review KPIs against targets and decide the next drop", tag: "Review" },
            { text: "Ask the waitlist which colours or styles they want next", tag: "Community" },
          ],
        },
      ],
    },
  ],

  contentPillars: [
    { id: "teasers", title: "Teasers", format: "Reels + stories", cadence: "3 / week", phase: "Weeks 3–7", idea: "Slow-motion fabric close-ups with a single line: ‘Made in Dubai. Coming soon.’" },
    { id: "bts", title: "Behind the scenes", format: "Reels · TikTok", cadence: "1–2 / week", phase: "Weeks 4–9", idea: "Your tailor pinning a sleeve, cutting crepe, the first sample fitting." },
    { id: "fabric", title: "Fabric & design stories", format: "Carousels", cadence: "1 per design", phase: "Week 6", idea: "Why this crepe, why this cut — the story behind each of the 6 designs." },
    { id: "styling", title: "Styling content", format: "Reels · TikTok", cadence: "2 / week", phase: "Weeks 8–13", idea: "‘One abaya, 3 ways’: office, evening and weekend." },
    { id: "reveal", title: "Product reveals", format: "Reel + carousel", cadence: "Launch day", phase: "Week 8", idea: "Full collection walk-through with prices and sizes in the caption." },
    { id: "countdown", title: "Launch countdown", format: "Stories", cadence: "Daily", phase: "Week 7", idea: "7 days, 7 design hints, with a reminder sticker for launch day." },
    { id: "creators", title: "Creator seeding", format: "Creator posts", cadence: "5 creators", phase: "Weeks 6–9", idea: "Unboxing and first wear in their own style — no script, just a brief." },
    { id: "ugc", title: "Customer / UGC", format: "Reposts · carousels", cadence: "Ongoing", phase: "Weeks 9–13", idea: "Reshare customer photos and reviews; feature a ‘worn by you’ post monthly." },
  ],

  postingRhythm: "4 feed posts and daily stories each week, with 2 TikToks reusing your best reels.",

  budget: [
    {
      planLine: launchMarketing.label,
      total: launchMarketing.amount,
      lines: [
        { label: "Paid social ads", amount: 1100, note: "Retargeting from launch week; ≈AED 35/day for 4–5 weeks" },
        { label: "Creator fees", amount: 900, note: "3 micro-creator posts; 2 more paid in gifted pieces" },
        { label: "Waitlist & launch offer", amount: 250, note: "Gift wrap for early-access orders" },
        { label: "Boost reserve", amount: 200, note: "Boost posts that are already performing" },
        { label: "Tools", amount: 150, note: "Scheduling and email for the waitlist" },
      ],
    },
    {
      planLine: content.label,
      total: content.amount,
      lines: [
        { label: "Product shoot", amount: 1200, note: "Model, photographer and edits for 6 designs" },
        { label: "Launch reels & BTS", amount: 500, note: "Short-form video editing" },
        { label: "Styling & location", amount: 300, note: "Props, accessories and location fee" },
      ],
    },
  ],

  kpis: [
    { label: "Waitlist sign-ups", target: "300 by launch", when: "Weekly, weeks 3–7", signal: "Under 150 by week 6 → add a creator or a giveaway" },
    { label: "Instagram followers", target: "1,500 by launch", when: "Weekly", signal: "Engagement matters more than raw count" },
    { label: "Website visits", target: "1,000 in month 1", when: "Daily in launch week", signal: "Low visits → more reels with a clear link-in-bio CTA" },
    { label: "Conversion rate", target: "≈1.2%", when: "Weekly after launch", signal: "Below 0.8% → check pricing page, sizing info and checkout" },
    { label: "Customer acquisition cost", target: "Under AED 100", when: "Weekly after launch", signal: `Must stay well below AED 405 contribution per sale` },
    { label: "First-month sales", target: `${firstMonthSales} pieces`, when: "End of month 1", signal: `Matches the business plan's month-1 forecast` },
  ],

  nextMove: {
    title: "Claim your handles and open the waitlist this week",
    why: "Everything in the pre-launch phase builds on the waitlist. Starting it now gives you 7 weeks to reach 300 sign-ups while your samples are being made.",
    steps: [
      "Claim the same handle on Instagram and TikTok",
      "Publish a simple waitlist page with early-access sign-up",
      "Post your first teaser — Ibda can draft it for you",
    ],
  },
};
