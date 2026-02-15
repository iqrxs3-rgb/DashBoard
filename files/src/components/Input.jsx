import { cn } from '../utils/helpers'

export const Input = ({
  label,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 bg-discord-darker border border-discord-lighter rounded-lg text-white',
          'focus:outline-none focus:border-discord-blurple transition-colors',
          'placeholder-gray-500',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-discord-danger',
          className
        )}
        disabled={disabled}
        {...props}
      />
      {error && <p className="text-discord-danger text-sm mt-1">{error}</p>}
    </div>
  )
}