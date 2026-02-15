import { cn } from '../utils/helpers'

export const Table = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-discord-bg">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-300"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-discord-bg hover:bg-discord-darker/50 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className="px-6 py-3 text-sm text-gray-300"
                >
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}