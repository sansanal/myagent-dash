interface VLPTechLogoProps {
  size?: number;
  className?: string;
}

export const VLPTechLogo = ({ size = 80, className = "" }: VLPTechLogoProps) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Hexagon with network nodes */}
      <svg 
        width={size} 
        height={size * 0.9} 
        viewBox="0 0 200 180" 
        className="mb-2"
      >
        {/* Hexagon border */}
        <path
          d="M100 10 L170 50 L170 130 L100 170 L30 130 L30 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-primary"
        />
        
        {/* Inner hexagon */}
        <path
          d="M100 25 L155 55 L155 125 L100 155 L45 125 L45 55 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-primary/60"
        />
        
        {/* Network nodes and connections */}
        {/* Top node */}
        <circle cx="100" cy="60" r="8" fill="currentColor" className="text-primary" />
        
        {/* Top-right node */}
        <circle cx="130" cy="75" r="8" fill="currentColor" className="text-primary" />
        
        {/* Right node */}
        <circle cx="140" cy="110" r="8" fill="currentColor" className="text-primary" />
        
        {/* Bottom-right node */}
        <circle cx="115" cy="135" r="8" fill="currentColor" className="text-primary" />
        
        {/* Bottom node */}
        <circle cx="100" cy="120" r="8" fill="currentColor" className="text-primary" />
        
        {/* Bottom-left node */}
        <circle cx="85" cy="135" r="8" fill="currentColor" className="text-primary" />
        
        {/* Left node */}
        <circle cx="60" cy="110" r="8" fill="currentColor" className="text-primary" />
        
        {/* Top-left node */}
        <circle cx="70" cy="75" r="8" fill="currentColor" className="text-primary" />
        
        {/* Connections */}
        <line x1="100" y1="60" x2="130" y2="75" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="130" y1="75" x2="140" y2="110" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="140" y1="110" x2="115" y2="135" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="115" y1="135" x2="100" y2="120" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="100" y1="120" x2="85" y2="135" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="85" y1="135" x2="60" y2="110" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="60" y1="110" x2="70" y2="75" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="70" y1="75" x2="100" y2="60" stroke="currentColor" strokeWidth="3" className="text-primary" />
        <line x1="100" y1="60" x2="100" y2="120" stroke="currentColor" strokeWidth="3" className="text-primary" />
      </svg>
      
      {/* Company name */}
      <div className="text-center">
        <div className="text-2xl font-bold tracking-wider text-foreground mb-1">
          VLPTECH
        </div>
        <div className="text-sm font-medium text-muted-foreground tracking-wide">
          AI AGENT PLATFORM
        </div>
      </div>
    </div>
  );
};