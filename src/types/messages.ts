// ENABLE IN DEVELOPMENT ONLY

type Messages = typeof import("../locales/ru.json");
type EnMessages = typeof import("../locales/en.json");

type UnifiedMessages = Messages & EnMessages;

declare interface IntlMessages extends UnifiedMessages {}
