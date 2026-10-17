export type Locale = "ps" | "en";

export const LOCALES: Locale[] = ["ps", "en"];
export const DEFAULT_LOCALE: Locale = "ps";
export const LOCALE_COOKIE = "sehatyar-locale";

export type MessageKey =
  | "brandName"
  | "tagline"
  | "whatDoYouWant"
  | "healthQuestions"
  | "whatIsThisMedicine"
  | "chooseCategory"
  | "chooseQuestion"
  | "noQuestionsYet"
  | "answer"
  | "back"
  | "home"
  | "disclaimer"
  | "clinicBadge"
  | "emergencyBadge"
  | "audioUnavailable"
  | "playAudio"
  | "stopAudio"
  | "medicineHint"
  | "language"
  | "languagePs"
  | "languageEn"
  | "loading"
  | "loadError"
  | "retry"
  | "notFound"
  | "emptyCategories"
  | "wasThisHelpful"
  | "feedbackYes"
  | "feedbackNo"
  | "feedbackThanks"
  | "feedbackError";

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  ps: {
    brandName: "صحت یار",
    tagline: "روغتیا پوښتنې او د درملو پېژندنه — په ساده پښتو کې",
    whatDoYouWant: "څه غواړئ وکړئ؟",
    healthQuestions: "روغتیا پوښتنې",
    whatIsThisMedicine: "دا درمل څه دی؟",
    chooseCategory: "کټګوري غوره کړئ",
    chooseQuestion: "پوښتنه غوره کړئ",
    noQuestionsYet: "په دې برخه کې لا پوښتنې نشته.",
    answer: "ځواب",
    back: "شاته",
    home: "کور",
    disclaimer:
      "دا اپلیکیشن یوازې معلومات ورکوي. دا ډاکټر نه دی او درمل نه تجویز کوي. که ناروغي سخته وي، کلینیک یا روغتون ته لاړ شئ.",
    clinicBadge: "کلینیک ته لاړ شئ",
    emergencyBadge: "بیړنی حالت",
    audioUnavailable: "غږ لا نشته",
    playAudio: "غږ واورئ",
    stopAudio: "ودروئ",
    medicineHint: "د درملو پیک عکس واخلئ یا نوم ولیکئ",
    language: "ژبه",
    languagePs: "پښتو",
    languageEn: "English",
    loading: "مهرباني وکړئ انتظار وکړئ…",
    loadError: "معلومات ونه لوستل شول. انټرنېټ وګورئ او بیا هڅه وکړئ.",
    retry: "بیا هڅه",
    notFound: "دا پاڼه ونه موندل شوه.",
    emptyCategories: "لا کټګورۍ نشته.",
    wasThisHelpful: "دا ځواب ګټور و؟",
    feedbackYes: "هو",
    feedbackNo: "نه",
    feedbackThanks: "مننه — ستاسو نظر مو واخیست.",
    feedbackError: "نظر ونه لیږل شو. بیا هڅه وکړئ.",
  },
  en: {
    brandName: "SehatYar",
    tagline: "Health questions and medicine pack help — in clear language",
    whatDoYouWant: "What would you like to do?",
    healthQuestions: "Health questions",
    whatIsThisMedicine: "What is this medicine?",
    chooseCategory: "Choose a category",
    chooseQuestion: "Choose a question",
    noQuestionsYet: "No questions in this section yet.",
    answer: "Answer",
    back: "Back",
    home: "Home",
    disclaimer:
      "This app gives information only. It is not a doctor and does not prescribe medicine. For serious illness, go to a clinic or hospital.",
    clinicBadge: "Go to a clinic",
    emergencyBadge: "Emergency",
    audioUnavailable: "Audio not available yet",
    playAudio: "Play audio",
    stopAudio: "Stop",
    medicineHint: "Photograph a medicine pack or type the name",
    language: "Language",
    languagePs: "پښتو",
    languageEn: "English",
    loading: "Please wait…",
    loadError: "Could not load content. Check your connection and try again.",
    retry: "Try again",
    notFound: "This page was not found.",
    emptyCategories: "No categories yet.",
    wasThisHelpful: "Was this answer helpful?",
    feedbackYes: "Yes",
    feedbackNo: "No",
    feedbackThanks: "Thank you — your feedback was saved.",
    feedbackError: "Could not send feedback. Please try again.",
  },
};

export function t(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key];
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ps" || value === "en";
}
