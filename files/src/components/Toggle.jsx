import { cn } from '../utils/helpers'

export const Toggle = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors',
          checked ? 'bg-discord-blurple' : 'bg-discord-bg',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </button>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
    </div>
  )
}