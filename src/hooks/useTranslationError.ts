"use client";

import { useEffect } from "react";
import { TranslationError } from "@/utils/translations/types";

interface MissingTranslation {
  locale: string;
  key: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

interface TranslationErrorPayload {
  timestamp: string;
  total: number;
  translations: MissingTranslation[];
}

const missingTranslations = new Set<string>();
const ERROR_ENDPOINT = "/api/translations/missing/";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function saveMissingTranslation(
  key: string, 
  locale: string, 
  context?: Record<string, unknown>
) {
  const entry = `${locale}:${key}`;

  if (!missingTranslations.has(entry)) {
    missingTranslations.add(entry);

    const translations = Array.from(missingTranslations).map(item => {
      const [loc, k] = item.split(":");
      return { 
        locale: loc, 
        key: k,
        context,
        timestamp: new Date().toISOString()
      };
    });

    const payload: TranslationErrorPayload = {
      timestamp: new Date().toISOString(),
      total: translations.length,
      translations
    };

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch(ERROR_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Успешно сохранено
        return;
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          console.error("Failed to save missing translation after retries:", {
            key,
            locale,
            error
          });
          break;
        }
        // Экспоненциальная задержка перед повторной попыткой
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries))
        );
      }
    }
  }
}

export function useTranslationError() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Обработка ошибок TranslationError
      if (error instanceof TranslationError) {
        event.preventDefault();
        event.stopPropagation();
        
        saveMissingTranslation(
          error.key,
          error.locale,
          error.context
        ).catch(console.error);
        return;
      }

      // Обработка стандартных ошибок перевода
      if (error?.message?.includes("MISSING_MESSAGE")) {
        event.preventDefault();
        event.stopPropagation();

        const match = error.message.match(
          /Could not resolve `([^`]+)` in messages for locale `([^`]+)`/
        );
        
        if (match) {
          const [_, key, locale] = match;
          saveMissingTranslation(key, locale).catch(console.error);
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Обработка отклоненных промисов с ошибками перевода
      if (error instanceof TranslationError || 
          error?.message?.includes("MISSING_MESSAGE")) {
        event.preventDefault();
        handleError(new ErrorEvent('error', { error }));
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);
}
