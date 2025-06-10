import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  let messages;
  try {
    messages = (await import(`@/locales/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to default locale
    messages = (await import(`@/locales/en.json`)).default;
  }

  return {
    messages,
    timeZone: "Asia/Bangkok",
    now: new Date()
  };
});
