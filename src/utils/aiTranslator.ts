import { OpenAI } from "openai";
import { locales } from "@/config/i18n";

const findArrayRegex = /\[([\s\S]*?)\]/;

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_URL,
  apiKey: process.env.DEEPSEEK_API_KEY
});

export async function translateText(
  object: any,
  errorMessage?: string,
  attempt: number = 1,
  maxAttempts: number = 3
) {
  if (attempt > maxAttempts) {
    console.error(
      `Превышено максимальное количество попыток перевода (${maxAttempts})`
    );
    return null;
  }

  let systemContext = `You help translate the JSON object into the following languages: Russian, English. I emphasize: you must return only an array with translations in objects and nothing more, and each object must contain a locale field, which will contain the code of the language, the translation of which is contained there. Before giving an answer, check the correctness of the answer very carefully, including the correctness of the json, so that all brackets are closed, and the number of elements in the main array is equal to ${locales.length}.`;

  let userPrompt = `You need to translate this object ${JSON.stringify(
    object
  )} into the following languages: ${locales.join(", ")}`;

  if (errorMessage && attempt > 1) {
    userPrompt += `\n\nPrevious attempt failed with error: ${errorMessage}. Please check and correct your response. This is attempt ${attempt} of ${maxAttempts}.`;
  }

  console.log(
    `Попытка перевода #${attempt}${errorMessage ? " после ошибки" : ""}`
  );
  console.log(JSON.stringify(object));

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemContext },
        { role: "user", content: userPrompt }
      ]
    });

    if (!response.choices[0] || !response.choices[0].message.content) {
      const error = "Не получен ответ от API";
      console.error(error);
      return await translateText(object, error, attempt + 1, maxAttempts);
    }

    try {
      const arrayRegex = findArrayRegex.exec(
        response.choices[0].message.content
      );

      if (arrayRegex && arrayRegex[1]) {
        const jsonArray = `[${arrayRegex[1]}]`;
        console.log("Extracted JSON string:", jsonArray);
        try {
          return JSON.parse(jsonArray);
        } catch (jsonError: any) {
          const error = `Ошибка парсинга извлеченного JSON: ${jsonError.message}`;
          console.error(error);
          return await translateText(object, error, attempt + 1, maxAttempts);
        }
      }

      const content = response.choices[0].message.content.trim();

      if (content.startsWith("[") && content.endsWith("]")) {
        console.log("Using direct JSON parsing", content);
        try {
          return JSON.parse(content);
        } catch (jsonError: any) {
          const error = `Ошибка парсинга прямого JSON: ${jsonError.message}`;
          console.error(error);
          return await translateText(object, error, attempt + 1, maxAttempts);
        }
      }

      const error = "Не удалось извлечь JSON массив из ответа";
      console.error(error);
      return await translateText(object, error, attempt + 1, maxAttempts);
    } catch (jsonError: any) {
      const error = `Общая ошибка обработки JSON: ${jsonError.message}`;
      console.error(error);
      return await translateText(object, error, attempt + 1, maxAttempts);
    }
  } catch (error: any) {
    const errorMsg = `Ошибка API: ${error.message}`;
    console.error(errorMsg);
    return await translateText(object, errorMsg, attempt + 1, maxAttempts);
  }
}
