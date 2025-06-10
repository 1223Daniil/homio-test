export default function BelowFoldLoading() {
  return (
    <>
      {/* Скелетон для специальных предложений */}
      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mb-8"></div>

      {/* Скелетон для мастер-плана */}
      <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mt-8"></div>

      {/* Скелетон для удобств */}
      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mt-8"></div>

      {/* Скелетон для информации о застройщике */}
      <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mt-12"></div>

      {/* Скелетон для карты */}
      <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mt-12"></div>

      {/* Скелетон для слайдера прогресса строительства */}
      <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mt-12"></div>

      {/* Скелетон для документов */}
      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mt-12"></div>
    </>
  );
}
