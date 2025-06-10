import LogRocket from "logrocket";
import logrocketConfig from "@/config/logrocket";

/**
 * Инициализирует LogRocket для отслеживания пользовательских сессий.
 * Вызывается только на стороне клиента для предотвращения ошибок SSR.
 */
export const initLogRocket = () => {
  if (typeof window === "undefined") {
    return; // Не выполняем на стороне сервера
  }

  // Инициализируем LogRocket с идентификатором проекта
  LogRocket.init("b6zjmk/skt");
};

export default LogRocket;
