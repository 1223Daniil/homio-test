import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-default-900">
          404 - Страница не найдена
        </h1>
        <p className="text-default-600 mb-8 max-w-md mx-auto">
          Запрашиваемая страница не существует или была перемещена
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
