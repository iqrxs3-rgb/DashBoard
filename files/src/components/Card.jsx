import { cn } from '../utils/helpers'

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-discord-lighter rounded-lg border border-discord-bg',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}