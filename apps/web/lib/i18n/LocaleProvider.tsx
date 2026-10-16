"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  t,
  type Locale,
  type MessageKey,
} from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
  dir: "rtl" | "ltr";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  const fromStorage = window.localStorage.getItem(LOCALE_COOKIE);
  if (isLocale(fromStorage)) {
    return fromStorage;
  }
  const cookieMatch = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  const fromCookie = cookieMatch?.split("=")[1];
  if (isLocale(fromCookie)) {
    return fromCookie;
  }
  return DEFAULT_LOCALE;
}

function persistLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_COOKIE, locale);
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const dir = locale === "ps" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.translate = false;
    document.documentElement.classList.add("notranslate");
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => t(locale, key),
      dir: locale === "ps" ? "rtl" : "ltr",
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
