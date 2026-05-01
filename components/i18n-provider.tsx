"use client";

import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { useEffect, useState, ReactNode } from "react";
import { useResolvedLanguage } from "@/store";
import { Locale } from "@ziziyi/utils";
import { getTimeZone } from "@/i18n/config";

// Cache for loaded messages
const messagesCache: Partial<Record<Locale, AbstractIntlMessages>> = {};

// Load messages for a locale (with fallback to English)
async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  // Normalize locale for file loading (e.g. es-419 -> es) if specific file doesn't exist
  // But first try exact match
  if (messagesCache[locale]) {
    return messagesCache[locale]!;
  }

  try {
    const messages = (await import(`@/messages/${locale}.json`)).default;
    messagesCache[locale] = messages;
    return messages;
  } catch {
    // If es-419 fails, try es
    if (locale.includes("-")) {
      const baseLocale = locale.split("-")[0] as Locale;
      try {
        const messages = (await import(`@/messages/${baseLocale}.json`)).default;
        messagesCache[locale] = messages;
        return messages;
      } catch (e) {}
    }

    // Fallback to English if locale file doesn't exist
    if (locale !== Locale.EN) {
      console.warn(
        `Messages for locale "${locale}" not found, falling back to English`,
      );
      return loadMessages(Locale.EN);
    }
    // Return empty object if even English fails
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
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  useEffect(() => {
    // Load messages when locale changes
    loadMessages(locale).then((loadedMessages) => {
      setMessages(loadedMessages);
      setCurrentLocale(locale);
    });
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={currentLocale}
      messages={messages}
      timeZone={getTimeZone(currentLocale)}
      onError={() => {}} // Silence missing message errors in production/dev if desired
      getMessageFallback={({ key, namespace }) => {
        // Fallback to the key itself if message is missing
        return namespace ? `${namespace}.${key}` : key;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
