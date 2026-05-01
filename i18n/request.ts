import { Locale } from "@ziziyi/utils";
import { getRequestConfig } from "next-intl/server";
import { getTimeZone } from "./config";

const defaultLocale = Locale.EN;

// In a static export, getRequestConfig cannot use dynamic functions like requestLocale
// as they internally rely on headers(). We provide a static fallback for the build process.
export default getRequestConfig(async () => {
  const locale = defaultLocale;
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: getTimeZone(locale),
  };
});
