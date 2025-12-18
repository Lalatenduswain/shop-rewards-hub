/**
 * Stat Card Component
 *
 * Dashboard statistics card with value, trend indicator, and icon.
 */

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: number; // Percentage growth (positive or negative)
  icon?: React.ReactNode;
  loading?: boolean;
  suffix?: string; // e.g., "%", "USD", "items"
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  trend,
  icon,
  loading = false,
  suffix,
  onClick,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  const isClickable = !!onClick;
  const CardWrapper = isClickable ? 'button' : 'div';

  return (
    <CardWrapper
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
        isClickable
          ? 'hover:shadow-md transition-shadow cursor-pointer text-left w-full'
          : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
            {suffix && (
              <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-1">
                {suffix}
              </span>
            )}
          </p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend > 0 ? (
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : trend < 0 ? (
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14"
                  />
                </svg>
              )}
              <span
                className={`text-sm font-medium ${
                  trend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : trend < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {trend > 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                vs previous period
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
