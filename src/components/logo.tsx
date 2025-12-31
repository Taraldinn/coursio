import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
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

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle with gradient */}
        <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
        
        {/* Letter C */}
        <path
          d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Book/Pages lines inside C */}
        <line x1="15" y1="15" x2="18" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="20" x2="18" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="25" x2="18" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span className={cn("font-bold text-foreground", textSizes[size])}>
          coursioo
        </span>
      )}
    </div>
  )
}

