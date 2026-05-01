"use client";

import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { useEffect, useState, ReactNode } from "react";
import { useResolvedLanguage } from "@/store";
import { Locale } from "@ziziyi/utils";
import { getTimeZone } from "@/i18n/config";

// Static imports for major languages to ensure they are bundled correctly in static export
// This solves the issue where dynamic imports with variables fail in production
const staticMessages: Partial<Record<string, () => Promise<any>>> = {
  "en": () => import("@/messages/en.json"),
  "es": () => import("@/messages/es.json"),
  "zh-CN": () => import("@/messages/zh-CN.json"),
  "zh-TW": () => import("@/messages/zh-TW.json"),
  "ja": () => import("@/messages/ja.json"),
  "ko": () => import("@/messages/ko.json"),
  "fr": () => import("@/messages/fr.json"),
  "de": () => import("@/messages/de.json"),
  "it": () => import("@/messages/it.json"),
  "pt-BR": () => import("@/messages/pt-BR.json"),
  "ru": () => import("@/messages/ru.json"),
};

// Cache for loaded messages
const messagesCache: Partial<Record<string, AbstractIntlMessages>> = {};

// Load messages for a locale (with fallback to English)
async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  if (messagesCache[locale]) {
    return messagesCache[locale]!;
  }

  try {
    // Try static map first (guaranteed to be bundled)
    if (staticMessages[locale]) {
      const messages = (await staticMessages[locale]!()).default;
      messagesCache[locale] = messages;
      return messages;
    }

    // Fallback to dynamic import for other languages
    const messages = (await import(`@/messages/${locale}.json`)).default;
    messagesCache[locale] = messages;
    return messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale "${locale}":`, error);
    
    // Fallback logic for regions (e.g. es-419 -> es)
    if (locale.includes("-")) {
      const baseLocale = locale.split("-")[0];
      return loadMessages(baseLocale);
    }

    // Ultimate fallback to English
    if (locale !== "en") {
      return loadMessages("en");
    }
    
    return {};
  }
}

interface I18nProviderProps {
  children: ReactNode;
  initialMessages: AbstractIntlMessages;
}

export function I18nProvider({ children, initialMessages }: I18nProviderProps) {
  const locale = useResolvedLanguage();
  const [messages, setMessages] =
    useState<AbstractIntlMessages>(initialMessages);
  const [currentLocale, setCurrentLocale] = useState<string>(locale);

  useEffect(() => {
    // Sync initial messages if locale matches the one from build
    if (locale === "en" && initialMessages && Object.keys(initialMessages).length > 0) {
      setMessages(initialMessages);
      setCurrentLocale("en");
      return;
    }

    // Load messages when locale changes
    let isMounted = true;
    loadMessages(locale).then((loadedMessages) => {
      if (isMounted) {
        setMessages(loadedMessages);
        setCurrentLocale(locale);
      }
    });
    return () => { isMounted = false; };
  }, [locale, initialMessages]);

  return (
    <NextIntlClientProvider
      locale={currentLocale}
      messages={messages}
      timeZone={getTimeZone(currentLocale)}
      onError={() => {}} 
      getMessageFallback={({ key, namespace }) => {
        return namespace ? `${namespace}.${key}` : key;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
