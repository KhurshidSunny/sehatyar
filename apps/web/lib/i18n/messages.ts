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
  | "feedbackError"
  | "takePhoto"
  | "choosePhoto"
  | "changePhoto"
  | "submitPhoto"
  | "photoPreviewAlt"
  | "photoTooLarge"
  | "photoInvalidType"
  | "ocrFailed"
  | "ocrNoMatch"
  | "ocrMatches"
  | "ocrConfidence"
  | "confidenceHigh"
  | "confidenceMedium"
  | "confidenceLow"
  | "ocrTextLabel"
  | "ocrTextEmpty"
  | "ocrTapHint"
  | "medicineUses"
  | "medicineWarnings"
  | "capturePhoto"
  | "cancelCamera";

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
    takePhoto: "عکس واخلئ",
    choosePhoto: "له ګالري څخه عکس غوره کړئ",
    changePhoto: "بل عکس",
    submitPhoto: "درمل وپلټئ",
    photoPreviewAlt: "د درملو پیک عکس",
    photoTooLarge: "عکس ډېر لوی دی. یو کوچنی عکس وکاروئ.",
    photoInvalidType: "یوازې د عکس فایل وکاروئ.",
    ocrFailed: "عکس ونه لوستل شو. بیا هڅه وکړئ یا بل عکس وکاروئ.",
    ocrNoMatch:
      "د درمل نوم په عکس کې ونه موندل شو. د کڅوړې لیبل روښانه او نږدې عکس واخلئ.",
    ocrMatches: "نږدې درمل",
    ocrConfidence: "باور",
    confidenceHigh: "لوړ",
    confidenceMedium: "منځنی",
    confidenceLow: "ټیټ",
    ocrTextLabel: "له عکس څخه لوستل شوی متن",
    ocrTextEmpty: "(هیڅ انګلیسي متن ونه لوستل شو — روښانه عکس واخلئ)",
    ocrTapHint: "د جزئیاتو لپاره یو درمل وټاکئ",
    medicineUses: "معمولاً د څه لپاره کارول کیږي",
    medicineWarnings: "خبرتیاوې",
    capturePhoto: "عکس واخلئ",
    cancelCamera: "کیمرا بند کړئ",
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
    takePhoto: "Take a photo",
    choosePhoto: "Choose a photo from gallery",
    changePhoto: "Choose another photo",
    submitPhoto: "Look up medicine",
    photoPreviewAlt: "Medicine pack photo",
    photoTooLarge: "That photo is too large. Choose a smaller one.",
    photoInvalidType: "Please choose an image file.",
    ocrFailed: "Could not read the photo. Try again or choose another image.",
    ocrNoMatch:
      "No medicine name found in this photo. Take a clear, close photo of the pack label.",
    ocrMatches: "Possible matches",
    ocrConfidence: "Confidence",
    confidenceHigh: "High",
    confidenceMedium: "Medium",
    confidenceLow: "Low",
    ocrTextLabel: "Text read from the photo",
    ocrTextEmpty: "(No English text was read — try a sharper, closer photo)",
    ocrTapHint: "Tap a medicine to see details",
    medicineUses: "Commonly used for",
    medicineWarnings: "Warnings",
    capturePhoto: "Capture photo",
    cancelCamera: "Close camera",
  },
};

export function t(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key];
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ps" || value === "en";
}
