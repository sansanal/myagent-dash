interface VLPTechLogoProps {
  size?: number;
  className?: string;
}

export const VLPTechLogo = ({ size = 80, className = "" }: VLPTechLogoProps) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* V logo with connection points */}
      <svg 
        width={size} 
        height={size * 0.8} 
        viewBox="0 0 200 160" 
        className="mb-3"
      >
        {/* Left arm of V */}
        <path
          d="M20 20 L80 140 L100 120 L50 20 Z"
          fill="hsl(var(--primary))"
          className="drop-shadow-sm"
        />
        
        {/* Right arm of V */}
        <path
          d="M180 20 L150 20 L100 120 L120 140 Z"
          fill="hsl(var(--primary))"
          className="drop-shadow-sm"
        />
        
        {/* Connection nodes */}
        {/* Top left node */}
        <circle cx="35" cy="20" r="6" fill="hsl(var(--primary))" />
        
        {/* Top right node */}
        <circle cx="165" cy="20" r="6" fill="hsl(var(--primary))" />
        
        {/* Bottom center nodes */}
        <circle cx="90" cy="130" r="6" fill="hsl(var(--primary))" />
        <circle cx="110" cy="130" r="6" fill="hsl(var(--primary))" />
        
        {/* Connection lines */}
        <line x1="35" y1="20" x2="90" y2="130" stroke="hsl(var(--primary))" strokeWidth="3" opacity="0.6" />
        <line x1="165" y1="20" x2="110" y2="130" stroke="hsl(var(--primary))" strokeWidth="3" opacity="0.6" />
      </svg>
      
      {/* Company name */}
      <div className="text-center">
        <div className="text-2xl font-bold tracking-wider text-primary mb-1">
          VLP TECH
        </div>
        <div className="text-sm font-medium text-muted-foreground tracking-wide">
          AI AGENT PLATFORM
        </div>
      </div>
    </div>
  );
};