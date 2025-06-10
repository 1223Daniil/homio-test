"use client";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-default-900">
          Что-то пошло не так
        </h1>
        <p className="text-default-600 mb-8 max-w-md mx-auto">
          Произошла ошибка. Пожалуйста, попробуйте еще раз.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    </div>
  );
}
