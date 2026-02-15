import { cn } from '../utils/helpers'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-discord-blurple text-white hover:bg-blue-600 disabled:bg-gray-600',
    secondary: 'bg-discord-lighter text-white hover:bg-gray-600 disabled:bg-gray-700',
    danger: 'bg-discord-danger text-white hover:bg-red-600 disabled:bg-gray-600',
    success: 'bg-discord-success text-white hover:bg-green-600 disabled:bg-gray-600',
    outline: 'border border-discord-lighter text-white hover:bg-discord-lighter disabled:opacity-50',
    ghost: 'text-white hover:bg-discord-lighter disabled:opacity-50',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}