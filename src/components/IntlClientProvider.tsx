"use client";

import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { logTranslation, formatTranslationKey, findTranslationValue } from "../i18n/utils";

interface Props {
  messages: any;
  locale: string;
  children: ReactNode;
  timeZone?: string;
  now?: Date;
}

export function IntlClientProvider({
  messages,
  locale,
  children,
  timeZone,
  now
}: Props) {
  logTranslation('IntlClientProvider initialized', {
    locale,
    hasMessages: !!messages,
    messageKeys: messages ? Object.keys(messages) : []
  });

  return (
    <NextIntlClientProvider
      messages={messages}
      locale={locale}
      onError={(error) => {
        logTranslation('Translation error', error);
        
        if (error instanceof Error && error.message.includes("MISSING_MESSAGE")) {
          const match = error.message.match(
            /Could not resolve `([^`]+)` in messages for locale `([^`]+)`/
          );
          if (match) {
            const [_, key] = match;
            logTranslation("🔍 Trying to resolve key:", key);
            
            // Try to find the value using our flexible search
            const value = findTranslationValue(messages, key);
            if (value) {
              logTranslation("✅ Found value:", value);
              return value;
            }

            // If not found, format the key as readable text
            return formatTranslationKey(key);
          }
        }
        return null;
      }}
      timeZone={timeZone}
      now={now}
      defaultTranslationValues={{
        highlight: (chunks) => <span className="highlight">{chunks}</span>
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
