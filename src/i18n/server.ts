import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { getDictionary } from "./index";

/** The interface language chosen with the language switcher, or English. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

/** The dictionary for the current request's interface language. */
export async function getServerDictionary() {
  return getDictionary(await getLocale());
}
