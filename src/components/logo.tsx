import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  iconOnly?: boolean
}

export function Logo({ className, showText = true, size = "md", iconOnly = false }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  const LogoIcon = ({ iconClassName }: { iconClassName?: string }) => (
    <svg
      className={iconClassName}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded square background */}
      <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#coursio-gradient)" />

      {/* Checkmark/tick mark */}
      <path
        d="M12 21L17 26L28 14"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="coursio-gradient" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  )

  if (iconOnly) {
    return <LogoIcon iconClassName={cn(sizeClasses[size], className)} />
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon iconClassName={sizeClasses[size]} />

      {showText && (
        <span className={cn("font-bold text-foreground", textSizes[size])}>
          coursio
        </span>
      )}
    </div>
  )
}

