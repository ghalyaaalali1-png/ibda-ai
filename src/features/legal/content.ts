import type { Locale } from "@/i18n/config";

/**
 * Privacy policy and terms of use, in both languages. Written to match what
 * KHITTA actually does with data (see docs/khitta-v2/guide). Have them reviewed
 * by a UAE lawyer before launch, and keep them in step with the product.
 */

export type LegalSection = { heading: string; paragraphs?: string[]; items?: string[] };
export type LegalDocument = { title: string; updated: string; intro: string; sections: LegalSection[] };
export type LegalPageId = "privacy" | "terms";

export const CONTACT_EMAIL = "hello@khitta.ae";

const privacyEn: LegalDocument = {
  title: "Privacy policy",
  updated: "Last updated: 9 November 2026",
  intro:
    "This policy explains what information KHITTA collects when you use it, why, and the choices you have. We collect only what we need to prepare and keep your business plans.",
  sections: [
    {
      heading: "What we collect",
      items: [
        "Account details: your email address, your name if you give it, and your password (stored securely by our sign-in provider; we never see it). If you continue with Google, we receive your name and email address from Google.",
        "Business information: the idea you describe and your answers (for example location, budget and sales channel).",
        "Plans: the business plan, supplier, marketing and launch sections prepared for you, every saved version, and any translation of them.",
        "Usage records: when a plan was prepared or updated, in which language, and whether it succeeded.",
      ],
    },
    {
      heading: "How we use it",
      items: [
        "To prepare, save, update and translate your plans, and to show them to you.",
        "To let you sign in, reset your password and keep your projects private to you.",
        "To protect the service, for example by limiting how many plans can be requested in an hour.",
      ],
      paragraphs: ["We do not sell your information, and we do not use it for advertising."],
    },
    {
      heading: "Who processes it",
      items: [
        "Anthropic (Claude): your idea and answers are sent to Claude to prepare your plan. They are used to produce the response, not to advertise to you.",
        "Supabase: stores your account and projects, and handles sign-in.",
        "Google: only if you choose to continue with Google.",
      ],
      paragraphs: ["Each provider processes information under its own terms and security measures."],
    },
    {
      heading: "Without an account",
      paragraphs: [
        "If you use KHITTA without signing in, your idea and plan are kept only in your browser tab and disappear when you close it. They still pass through Claude to prepare the plan.",
      ],
    },
    {
      heading: "Cookies and browser storage",
      items: [
        "A cookie that remembers your language (English or Arabic).",
        "Sign-in cookies that keep you logged in.",
        "Temporary browser storage that holds a plan in progress.",
      ],
      paragraphs: ["We do not use advertising or tracking cookies."],
    },
    {
      heading: "Keeping and deleting your information",
      paragraphs: [
        "Your projects are kept while your account exists. You can delete any project from My projects at any time; this permanently removes it with its plan and history. To delete your whole account, contact us.",
        "To limit misuse, your network address may be held in memory for up to an hour; it is not stored with your account.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "Each account can only read its own projects; this is enforced by the database itself. Connections are encrypted, and secret keys stay on our servers. No system is perfectly secure, so please use a strong password that you don't use elsewhere.",
      ],
    },
    {
      heading: "Your choices",
      items: [
        "See and edit your business information at any time with Edit details.",
        "Delete projects yourself, or ask us to delete your account.",
        "Ask us what information we hold about you.",
      ],
    },
    {
      heading: "Changes and contact",
      paragraphs: [
        "If we change this policy, we will update the date above. For any privacy question or request, email us at " +
          CONTACT_EMAIL +
          ".",
      ],
    },
  ],
};

const privacyAr: LegalDocument = {
  title: "سياسة الخصوصية",
  updated: "آخر تحديث: 9 نوفمبر 2026",
  intro:
    "توضح هذه السياسة المعلومات التي تجمعها خِطّة عند استخدامك لها، وسبب جمعها، والخيارات المتاحة لك. نجمع فقط ما نحتاجه لإعداد خطط مشروعك وحفظها.",
  sections: [
    {
      heading: "ما الذي نجمعه",
      items: [
        "بيانات الحساب: بريدك الإلكتروني، واسمك إن أدخلته، وكلمة المرور (يحفظها مزوّد تسجيل الدخول بشكل آمن، ولا نطّلع عليها). إذا سجّلت الدخول عبر Google، نستلم اسمك وبريدك الإلكتروني من Google.",
        "معلومات المشروع: الفكرة التي تصفها وإجاباتك (مثل الموقع والميزانية وقناة البيع).",
        "الخطط: خطة العمل وأقسام الموردين والتسويق والإطلاق المُعدّة لك، وكل نسخة محفوظة منها، وأي ترجمة لها.",
        "سجلات الاستخدام: متى أُعدّت الخطة أو حُدّثت، وبأي لغة، وهل نجحت العملية.",
      ],
    },
    {
      heading: "كيف نستخدمها",
      items: [
        "لإعداد خططك وحفظها وتحديثها وترجمتها، وعرضها لك.",
        "لتمكينك من تسجيل الدخول وإعادة تعيين كلمة المرور، وإبقاء مشاريعك خاصة بك.",
        "لحماية الخدمة، مثل تحديد عدد الخطط التي يمكن طلبها في الساعة.",
      ],
      paragraphs: ["لا نبيع معلوماتك، ولا نستخدمها لأغراض إعلانية."],
    },
    {
      heading: "من يعالج هذه المعلومات",
      items: [
        "Anthropic ‏(Claude): تُرسل فكرتك وإجاباتك إلى Claude لإعداد خطتك، وتُستخدم لإنتاج الرد فقط، لا للإعلانات.",
        "Supabase: يحفظ حسابك ومشاريعك، ويتولى تسجيل الدخول.",
        "Google: فقط إذا اخترت تسجيل الدخول عبر Google.",
      ],
      paragraphs: ["يعالج كل مزوّد المعلومات وفق شروطه وإجراءات الأمان الخاصة به."],
    },
    {
      heading: "الاستخدام دون حساب",
      paragraphs: [
        "إذا استخدمت خِطّة دون تسجيل الدخول، تبقى فكرتك وخطتك في نافذة المتصفح فقط وتختفي عند إغلاقها، مع أنها تمر عبر Claude لإعداد الخطة.",
      ],
    },
    {
      heading: "ملفات تعريف الارتباط وتخزين المتصفح",
      items: [
        "ملف يحفظ لغتك المختارة (العربية أو الإنجليزية).",
        "ملفات تسجيل الدخول التي تبقيك متصلاً بحسابك.",
        "تخزين مؤقت في المتصفح يحفظ الخطة أثناء إعدادها.",
      ],
      paragraphs: ["لا نستخدم ملفات تعريف ارتباط إعلانية أو للتتبّع."],
    },
    {
      heading: "الاحتفاظ بمعلوماتك وحذفها",
      paragraphs: [
        "نحتفظ بمشاريعك ما دام حسابك قائماً. يمكنك حذف أي مشروع من «مشاريعي» في أي وقت، فيُحذف نهائياً مع خطته وسجلّه. لحذف حسابك بالكامل، تواصل معنا.",
        "للحدّ من إساءة الاستخدام، قد يُحتفظ بعنوان الشبكة الخاص بك في الذاكرة لمدة تصل إلى ساعة، ولا يُحفظ مع حسابك.",
      ],
    },
    {
      heading: "الأمان",
      paragraphs: [
        "لا يستطيع أي حساب قراءة إلا مشاريعه، وتفرض قاعدة البيانات ذلك بنفسها. الاتصالات مشفّرة، والمفاتيح السرية تبقى على خوادمنا. لا يوجد نظام آمن تماماً، لذا ننصحك باستخدام كلمة مرور قوية لا تستخدمها في مكان آخر.",
      ],
    },
    {
      heading: "خياراتك",
      items: [
        "الاطلاع على معلومات مشروعك وتعديلها في أي وقت من «تعديل التفاصيل».",
        "حذف مشاريعك بنفسك، أو طلب حذف حسابك.",
        "سؤالنا عن المعلومات التي نحتفظ بها عنك.",
      ],
    },
    {
      heading: "التغييرات والتواصل",
      paragraphs: [
        "إذا غيّرنا هذه السياسة، سنحدّث التاريخ أعلاه. لأي سؤال أو طلب يتعلق بالخصوصية، راسلنا على " + CONTACT_EMAIL + ".",
      ],
    },
  ],
};

const termsEn: LegalDocument = {
  title: "Terms of use",
  updated: "Last updated: 9 November 2026",
  intro:
    "These terms apply when you use KHITTA. By using KHITTA or creating an account, you agree to them. If you don't agree, please don't use the service.",
  sections: [
    {
      heading: "What KHITTA is",
      paragraphs: [
        "KHITTA is an AI planning tool that helps founders in the UAE prepare a business launch plan. Plans are prepared by an AI model (Claude) from the information you give, with calculations made by KHITTA.",
      ],
    },
    {
      heading: "Planning guidance, not advice",
      items: [
        "KHITTA provides planning guidance only. It is not financial, legal, tax, investment or licensing advice.",
        "Figures are estimates unless you provided them, and may be wrong or out of date.",
        "Licences, fees, eligibility and requirements must be confirmed with the relevant official authority before you act or pay.",
        "No plan guarantees success. Decisions you make based on a plan are your own.",
      ],
    },
    {
      heading: "Your account",
      paragraphs: [
        "Keep your password private and use an email address you control. You are responsible for activity on your account. Tell us if you think someone else has used it.",
      ],
    },
    {
      heading: "Your content",
      paragraphs: [
        "The business information you enter and the plans prepared for you are yours. You allow us to store and process them only to provide KHITTA to you, as described in the privacy policy.",
      ],
    },
    {
      heading: "Fair use",
      items: [
        "Don't misuse the service: no attempts to access other people's data, disrupt the service or get around its limits.",
        "Don't enter information you aren't allowed to share, or unlawful content.",
        "We may limit how often plans can be requested, and may suspend accounts that misuse the service.",
      ],
    },
    {
      heading: "Availability and changes",
      paragraphs: [
        "We work to keep KHITTA available and accurate, but it is provided as it is and may change, pause or have errors. We may update these terms; the date above shows the latest version.",
      ],
    },
    {
      heading: "Responsibility",
      paragraphs: [
        "To the extent the law allows, KHITTA is not responsible for losses that come from relying on a plan, from information that turned out to be inaccurate, or from the service being unavailable.",
      ],
    },
    {
      heading: "Law and contact",
      paragraphs: [
        "These terms are governed by the laws of the United Arab Emirates. For any question about them, email us at " + CONTACT_EMAIL + ".",
      ],
    },
  ],
};

const termsAr: LegalDocument = {
  title: "شروط الاستخدام",
  updated: "آخر تحديث: 9 نوفمبر 2026",
  intro:
    "تنطبق هذه الشروط عند استخدامك خِطّة. باستخدامك خِطّة أو إنشائك حساباً، فإنك توافق عليها. إذا لم توافق، يُرجى عدم استخدام الخدمة.",
  sections: [
    {
      heading: "ما هي خِطّة",
      paragraphs: [
        "خِطّة أداة تخطيط تعمل بالذكاء الاصطناعي، تساعد روّاد الأعمال في الإمارات على إعداد خطة لإطلاق مشاريعهم. يُعدّ الخطط نموذج ذكاء اصطناعي (Claude) بناءً على المعلومات التي تقدّمها، وتُجري خِطّة الحسابات.",
      ],
    },
    {
      heading: "إرشادات للتخطيط، وليست استشارة",
      items: [
        "تقدّم خِطّة إرشادات للتخطيط فقط، وليست استشارة مالية أو قانونية أو ضريبية أو استثمارية أو متعلقة بالترخيص.",
        "الأرقام تقديرية ما لم تكن أنت من قدّمها، وقد تكون غير دقيقة أو غير محدّثة.",
        "يجب تأكيد التراخيص والرسوم والأهلية والمتطلبات مع الجهة الرسمية المختصة قبل أي إجراء أو دفع.",
        "لا تضمن أي خطة النجاح، والقرارات التي تتخذها بناءً عليها مسؤوليتك.",
      ],
    },
    {
      heading: "حسابك",
      paragraphs: [
        "حافظ على سرية كلمة المرور، واستخدم بريداً إلكترونياً تملكه. أنت مسؤول عن أي نشاط في حسابك، وأخبرنا إذا ظننت أن أحداً غيرك استخدمه.",
      ],
    },
    {
      heading: "محتواك",
      paragraphs: [
        "معلومات المشروع التي تدخلها والخطط المُعدّة لك ملك لك. وتسمح لنا بحفظها ومعالجتها فقط لتقديم خِطّة لك، كما توضح سياسة الخصوصية.",
      ],
    },
    {
      heading: "الاستخدام العادل",
      items: [
        "لا تُسئ استخدام الخدمة: لا محاولات للوصول إلى بيانات الآخرين، أو تعطيل الخدمة، أو تجاوز حدودها.",
        "لا تُدخل معلومات لا يحق لك مشاركتها، أو أي محتوى مخالف للقانون.",
        "قد نحدّد عدد مرات طلب الخطط، وقد نوقف الحسابات التي تُسيء استخدام الخدمة.",
      ],
    },
    {
      heading: "توفّر الخدمة والتغييرات",
      paragraphs: [
        "نعمل على إبقاء خِطّة متاحة ودقيقة، لكنها تُقدّم كما هي، وقد تتغيّر أو تتوقف مؤقتاً أو تحدث فيها أخطاء. قد نحدّث هذه الشروط، ويوضح التاريخ أعلاه أحدث نسخة.",
      ],
    },
    {
      heading: "المسؤولية",
      paragraphs: [
        "في الحدود التي يسمح بها القانون، لا تتحمّل خِطّة مسؤولية الخسائر الناتجة عن الاعتماد على خطة، أو عن معلومات تبيّن أنها غير دقيقة، أو عن عدم توفّر الخدمة.",
      ],
    },
    {
      heading: "القانون والتواصل",
      paragraphs: [
        "تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة. لأي سؤال بشأنها، راسلنا على " + CONTACT_EMAIL + ".",
      ],
    },
  ],
};

const documents: Record<LegalPageId, Record<Locale, LegalDocument>> = {
  privacy: { en: privacyEn, ar: privacyAr },
  terms: { en: termsEn, ar: termsAr },
};

export const legalDocument = (page: LegalPageId, locale: Locale) => documents[page][locale];
