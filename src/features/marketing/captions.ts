export type ContentType = "teaser" | "bts" | "countdown" | "reveal" | "styling" | "ugc";
export type Platform = "instagram" | "tiktok";
export type Language = "en" | "ar";

export const contentTypes: { id: ContentType; label: string; objective: string }[] = [
  { id: "teaser", label: "Teaser", objective: "Build the waitlist" },
  { id: "bts", label: "Behind the scenes", objective: "Build trust in quality" },
  { id: "countdown", label: "Launch countdown", objective: "Drive launch-day reminders" },
  { id: "reveal", label: "Product reveal", objective: "Drive first sales" },
  { id: "styling", label: "Styling", objective: "Show versatility" },
  { id: "ugc", label: "Customer love", objective: "Build social proof" },
];

/** The raw parts of a post, before formatting for a platform. */
export type CaptionCopy = { hook: string; body: string; cta: string; tags: string[] };
type Copy = CaptionCopy;

/** Business facts sent to the caption route for live generation (no secrets). */
export type CaptionContext = {
  business: string;
  location: string;
  positioning: string;
  targetCustomer: string;
  priceRange: string;
  channels: string[];
};

const copy: Record<ContentType, Record<Language, Copy>> = {
  teaser: {
    en: {
      hook: "Something we've been quietly making in Dubai…",
      body: "Six designs. Premium crepe. Cut and finished in small runs, here in Dubai. We've spent months getting the drape, the sleeves and every detail exactly right.",
      cta: "Join the waitlist for early access — link in bio.",
      tags: ["#ComingSoon", "#NewBrand"],
    },
    ar: {
      hook: "شيء نصنعه بهدوء في دبي…",
      body: "ستة تصاميم. قماش كريب فاخر. تُفصَّل وتُشطَّب بكميات محدودة هنا في دبي. أمضينا شهوراً لنُتقن الانسدال والأكمام وكل التفاصيل.",
      cta: "انضمّي إلى قائمة الانتظار للحصول على وصول مبكر — الرابط في البايو.",
      tags: ["#قريبا", "#علامة_جديدة"],
    },
  },
  bts: {
    en: {
      hook: "From a single sketch to the first fitting.",
      body: "Meet the hands behind our first collection. Every abaya is cut, pinned and finished by our tailor in Dubai — just six pieces per design, so each one gets the attention it deserves.",
      cta: "Follow along — launch is only weeks away.",
      tags: ["#BehindTheScenes", "#SlowFashion"],
    },
    ar: {
      hook: "من رسمة واحدة إلى أول قياس.",
      body: "تعرّفي على الأيادي التي تصنع مجموعتنا الأولى. كل عباية تُقصّ وتُثبّت وتُشطّب على يد خيّاطنا في دبي — ست قطع فقط لكل تصميم، لتحظى كل قطعة بالاهتمام الذي تستحقه.",
      cta: "تابعينا — موعد الإطلاق بات قريباً.",
      tags: ["#خلف_الكواليس", "#تفصيل_يدوي"],
    },
  },
  countdown: {
    en: {
      hook: "7 days to go.",
      body: "Every day this week we'll share one detail from the collection — a sleeve, a seam, a fabric. Can you guess which design it belongs to?",
      cta: "Tap the reminder so you don't miss launch day.",
      tags: ["#LaunchCountdown", "#ComingSoon"],
    },
    ar: {
      hook: "باقي ٧ أيام.",
      body: "كل يوم هذا الأسبوع سنشاركك تفصيلاً واحداً من المجموعة — كُمّاً أو خياطة أو قماشاً. هل تستطيعين تخمين التصميم؟",
      cta: "فعّلي التذكير حتى لا يفوتك يوم الإطلاق.",
      tags: ["#العد_التنازلي", "#قريبا"],
    },
  },
  reveal: {
    en: {
      hook: "It's here. Our first collection is live.",
      body: "Six premium abayas in fluid crepe, finished with subtle hand detailing. AED 690–850. Made in Dubai in limited runs — once a design sells out, it may not return in the same fabric.",
      cta: "Shop now — link in bio. Complimentary gift wrap for waitlist orders.",
      tags: ["#NewCollection", "#ShopNow"],
    },
    ar: {
      hook: "وصلت. مجموعتنا الأولى متوفرة الآن.",
      body: "ست عبايات فاخرة من الكريب الانسيابي بلمسات يدوية ناعمة. من ٦٩٠ إلى ٨٥٠ درهماً. صُنعت في دبي بكميات محدودة — وعندما ينفد التصميم قد لا يعود بنفس القماش.",
      cta: "تسوّقي الآن — الرابط في البايو. تغليف هدايا مجاني لطلبات قائمة الانتظار.",
      tags: ["#مجموعة_جديدة", "#تسوقي_الآن"],
    },
  },
  styling: {
    en: {
      hook: "One abaya, three ways.",
      body: "Office: a structured bag and loafers. Evening: gold accessories and a statement heel. Weekend: white sneakers and a crossbody. Same abaya — premium crepe that moves with you.",
      cta: "Which look is yours? Tell us below 👇",
      tags: ["#AbayaStyling", "#OOTD"],
    },
    ar: {
      hook: "عباية واحدة، ثلاث إطلالات.",
      body: "للعمل: حقيبة أنيقة وحذاء لوفر. للمساء: إكسسوارات ذهبية وكعب لافت. لعطلة نهاية الأسبوع: حذاء رياضي أبيض وحقيبة كروس. نفس العباية — كريب فاخر يتحرك معك.",
      cta: "أي إطلالة تشبهك؟ أخبرينا في التعليقات 👇",
      tags: ["#تنسيق_العباية", "#إطلالة_اليوم"],
    },
  },
  ugc: {
    en: {
      hook: "Worn by you.",
      body: "Seeing our first collection out in the world means everything. Thank you to everyone who shared their look — this is exactly why we make every piece in small runs, with care.",
      cta: "Tag us in your photos for a chance to be featured.",
      tags: ["#WornByYou", "#CustomerLove"],
    },
    ar: {
      hook: "بإطلالتكِ أنتِ.",
      body: "رؤية مجموعتنا الأولى بينكم تعني لنا الكثير. شكراً لكل من شاركتنا إطلالتها — ولهذا نصنع كل قطعة بكميات محدودة وبعناية.",
      cta: "أشيري إلينا في صورك لفرصة الظهور على صفحتنا.",
      tags: ["#بإطلالتكم", "#آراء_العملاء"],
    },
  },
};

const baseTags: Record<Language, string[]> = {
  en: ["#ModestFashion", "#AbayaDubai", "#MadeInDubai", "#UAEBrand"],
  ar: ["#عبايات", "#عبايات_دبي", "#أزياء_محتشمة", "#صنع_في_دبي"],
};

const visuals: Record<ContentType, string> = {
  teaser: "Slow-motion close-up of black crepe catching the light; end on a folded sleeve.",
  bts: "Tailor pinning a sleeve, scissors through crepe, then a quick fitting-mirror shot.",
  countdown: "Story with a countdown sticker over a single detail shot.",
  reveal: "Collection walk-through reel, then a carousel with each design, price and sizes.",
  styling: "Three quick outfit changes on the same abaya, 3–4 seconds each.",
  ugc: "Carousel of customer photos (with permission) and one short review.",
};

export type GeneratedPost = {
  text: string;
  visual: string;
  bestTime: string;
};

/** Lays out a post for Instagram (full caption) or TikTok (on-screen hook + short caption). */
export function formatPost(c: CaptionCopy, platform: Platform, language: Language, extraTags: string[] = []) {
  const tags = [...c.tags, ...extraTags];
  return platform === "instagram"
    ? [c.hook, "", c.body, "", c.cta, "", tags.join(" ")].join("\n")
    : [
        language === "ar" ? `نص على الشاشة: ${c.hook}` : `On-screen text: ${c.hook}`,
        "",
        // Caption opens with the body's first sentence so it doesn't repeat the on-screen hook.
        `${c.body.split(/(?<=[.!?؟])\s/)[0]} ${c.cta}`,
        "",
        tags.slice(0, 4).join(" "),
      ].join("\n");
}

/** Hand-written demo captions for the abaya scenario. */
export function generatePost(type: ContentType, platform: Platform, language: Language): GeneratedPost {
  const c = copy[type][language];
  const text = formatPost(c, platform, language, baseTags[language]);
  return {
    text,
    visual: visuals[type],
    bestTime: platform === "instagram" ? "Thu–Sat, 8–10pm UAE time" : "Daily, 7–10pm UAE time",
  };
}
