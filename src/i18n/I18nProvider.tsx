"use client";

import { createContext, useContext, type ReactNode } from "react";
import { directionOf, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./index";

type I18n = { locale: Locale; dir: "ltr" | "rtl"; t: Dictionary };

const I18nContext = createContext<I18n | null>(null);

/** Gives client components the interface language chosen on the server (from the language cookie). */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, dir: directionOf(locale), t: getDictionary(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider.");
  return value;
}
