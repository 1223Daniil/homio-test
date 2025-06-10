import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Загружаем переменные окружения
dotenv.config();

// Константы
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com";
const CHUNK_SIZE = 5000; // Размер блока текста для отправки (в символах)
const MAX_RETRIES = 3; // Максимальное количество попыток при ошибке
const RETRY_DELAY = 2000; // Задержка между повторными попытками (в миллисекундах)

// Путь к директории с локализациями
const LOCALES_DIR = path.join(process.cwd(), "src/locales");

interface TranslationOptions {
  sourceFile: string;
  targetFile: string;
  targetLanguage: string;
  chunkSize?: number;
}

/**
 * Разделяет JSON на части для обработки
 */
function splitJsonToChunks(
  json: object,
  chunkSize: number = CHUNK_SIZE
): string[] {
  const jsonString = JSON.stringify(json, null, 2);
  const chunks: string[] = [];

  // Функция для разделения строки на части с сохранением структуры JSON
  function splitStringToChunks(str: string, size: number): string[] {
    const result: string[] = [];
    let currentChunk = "";
    let currentSize = 0;
    let openBraces = 0;
    let openBrackets = 0;

    // Проходим посимвольно по строке
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      currentChunk += char;
      currentSize++;

      // Считаем открывающие и закрывающие скобки
      if (char === "{") openBraces++;
      else if (char === "}") openBraces--;
      else if (char === "[") openBrackets++;
      else if (char === "]") openBrackets--;

      // Если достигли нужного размера и находимся на уровне закрытых скобок, завершаем чанк
      if (
        currentSize >= size &&
        openBraces === 0 &&
        openBrackets === 0 &&
        (i === str.length - 1 ||
          str[i + 1] === "," ||
          str[i + 1] === "}" ||
          str[i + 1] === "]")
      ) {
        // Добавляем в текущий чанк все до следующей запятой/закрывающей скобки
        let j = i + 1;
        while (
          j < str.length &&
          str[j] !== "," &&
          str[j] !== "}" &&
          str[j] !== "]"
        ) {
          currentChunk += str[j];
          j++;
        }

        // Если есть запятая, добавим ее
        if (j < str.length && str[j] === ",") {
          currentChunk += ",";
        }

        result.push(currentChunk);
        currentChunk = "";
        currentSize = 0;
        i = j;
      }
    }

    // Добавляем оставшуюся часть, если есть
    if (currentChunk.trim()) {
      result.push(currentChunk);
    }

    return result;
  }

  // Если JSON объект, разделяем по свойствам верхнего уровня
  if (jsonString.startsWith("{")) {
    // Получаем содержимое без внешних фигурных скобок
    const content = jsonString.slice(1, -1).trim();
    if (content) {
      const parts = splitStringToChunks(content, chunkSize);

      // Добавляем фигурные скобки к каждой части
      parts.forEach(part => {
        chunks.push(`{${part}}`);
      });
    } else {
      chunks.push("{}");
    }
  } else {
    // Если это не объект, просто разделяем на равные части
    let i = 0;
    while (i < jsonString.length) {
      chunks.push(jsonString.slice(i, i + chunkSize));
      i += chunkSize;
    }
  }

  return chunks;
}

/**
 * Проверяет, что ключи в переводе соответствуют исходным ключам
 */
function verifyTranslationKeys(
  source: object,
  translation: object
): { isValid: boolean; missingKeys: string[] } {
  const sourceKeys = getAllKeys(source);
  const translationKeys = getAllKeys(translation);

  const missingKeys = sourceKeys.filter(key => !translationKeys.includes(key));

  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
}

/**
 * Получает все ключи объекта (включая вложенные) в формате "parent.child.grandchild"
 */
function getAllKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        keys = keys.concat(getAllKeys(obj[key], newKey));
      } else {
        keys.push(newKey);
      }
    }
  }

  return keys;
}

/**
 * Отправляет запрос к DeepSeek API для перевода текста
 */
async function translateWithDeepSeek(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    const response = await axios.post(
      `${DEEPSEEK_API_URL}/v1/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Ты профессиональный переводчик. Переведи следующий JSON с русского на ${targetLanguage}. Сохрани все ключи JSON неизменными, переведи только значения. Сохрани все специальные символы, переменные и форматирование.`
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    const translatedText = response.data.choices[0].message.content;

    // Проверяем, что полученный текст - валидный JSON
    try {
      JSON.parse(translatedText);
      return translatedText;
    } catch (err) {
      // Если текст не является валидным JSON, пытаемся извлечь JSON из него
      const jsonMatch =
        translatedText.match(/```json([\s\S]*?)```/) ||
        translatedText.match(/```([\s\S]*?)```/) ||
        translatedText.match(/\{[\s\S]*\}/);

      if (jsonMatch && jsonMatch[0]) {
        const extractedJson = jsonMatch[1]
          ? jsonMatch[1].trim()
          : jsonMatch[0].trim();
        // Проверяем, что извлеченный текст - валидный JSON
        JSON.parse(extractedJson);
        return extractedJson;
      }

      throw new Error("Не удалось получить валидный JSON из ответа");
    }
  } catch (err) {
    const error = err as Error;
    console.error("Ошибка при запросе к DeepSeek API:", error.message);
    if (axios.isAxiosError(err) && err.response) {
      console.error("Ответ API:", err.response.data);
    }
    throw error;
  }
}

/**
 * Переводит JSON файл локализации
 */
async function translateLocalizationFile(
  options: TranslationOptions
): Promise<void> {
  const {
    sourceFile,
    targetFile,
    targetLanguage,
    chunkSize = CHUNK_SIZE
  } = options;

  try {
    console.log(`🔍 Загрузка исходного файла: ${sourceFile}`);
    const sourceData = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

    // Создаем целевой файл если он не существует или очищаем его
    fs.writeFileSync(targetFile, "{}", "utf8");

    // Разделяем JSON на части
    const chunks = splitJsonToChunks(sourceData, chunkSize);
    console.log(`📊 Файл разделен на ${chunks.length} частей`);

    let resultJson = {};

    // Переводим каждую часть
    for (let i = 0; i < chunks.length; i++) {
      console.log(`⏳ Перевод части ${i + 1}/${chunks.length}`);
      const chunkJson = JSON.parse(chunks[i]);

      let translatedChunkText = "";
      let success = false;
      let attempts = 0;

      // Повторяем попытки в случае ошибки
      while (!success && attempts < MAX_RETRIES) {
        try {
          attempts++;
          translatedChunkText = await translateWithDeepSeek(
            chunks[i],
            targetLanguage
          );
          success = true;
        } catch (err) {
          const error = err as Error;
          console.error(
            `❌ Ошибка при переводе части ${i + 1}, попытка ${attempts}/${MAX_RETRIES}: ${error.message}`
          );

          if (attempts < MAX_RETRIES) {
            console.log(
              `⏱️ Ожидание ${RETRY_DELAY / 1000} секунд перед повторной попыткой...`
            );
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          } else {
            throw new Error(
              `Не удалось перевести часть ${i + 1} после ${MAX_RETRIES} попыток`
            );
          }
        }
      }

      // Проверяем, что переведенный JSON валидный
      try {
        const translatedChunk = JSON.parse(translatedChunkText);

        // Проверяем, что все ключи сохранены
        const verification = verifyTranslationKeys(chunkJson, translatedChunk);
        if (!verification.isValid) {
          console.warn(
            `⚠️ Внимание: в переводе отсутствуют ключи: ${verification.missingKeys.join(", ")}`
          );
          console.log("Повторный перевод этой части...");
          i--; // Повторяем перевод этой части
          continue;
        }

        // Объединяем с результатом
        resultJson = { ...resultJson, ...translatedChunk };

        // Сохраняем промежуточный результат
        fs.writeFileSync(
          targetFile,
          JSON.stringify(resultJson, null, 2),
          "utf8"
        );
        console.log(
          `✅ Часть ${i + 1}/${chunks.length} переведена и сохранена`
        );
      } catch (err) {
        const error = err as Error;
        console.error(
          `❌ Ошибка при обработке переведенного JSON части ${i + 1}: ${error.message}`
        );
        console.log("Повторный перевод этой части...");
        i--; // Повторяем перевод этой части
      }
    }

    console.log(`🎉 Перевод завершен! Результат сохранен в ${targetFile}`);
  } catch (err) {
    const error = err as Error;
    console.error(`❌ Ошибка при переводе файла: ${error.message}`);
    throw error;
  }
}

/**
 * Основная функция
 */
async function main() {
  const args = process.argv.slice(2);
  const usage = `
Использование: 
  ts-node translator.ts [язык] [исходный-файл] [целевой-файл]

Примеры:
  ts-node translator.ts en src/locales/ru.json src/locales/en.json
  ts-node translator.ts th src/locales/ru.json src/locales/th.json
  `;

  if (args.length < 1) {
    console.log(usage);
    process.exit(1);
  }

  const targetLanguage = args[0];
  const sourceFile = args[1] || path.join(LOCALES_DIR, "ru.json");
  const targetFile =
    args[2] || path.join(LOCALES_DIR, `${targetLanguage}.json`);

  console.log(`
🌐 Переводчик файлов локализации
------------------------------
Исходный файл: ${sourceFile}
Целевой файл: ${targetFile}
Целевой язык: ${targetLanguage}
------------------------------
  `);

  try {
    await translateLocalizationFile({
      sourceFile,
      targetFile,
      targetLanguage,
      chunkSize: CHUNK_SIZE
    });
  } catch (err) {
    const error = err as Error;
    console.error("❌ Критическая ошибка:", error.message);
    process.exit(1);
  }
}

// Запуск основной функции
if (require.main === module) {
  main();
}

export { translateLocalizationFile };
