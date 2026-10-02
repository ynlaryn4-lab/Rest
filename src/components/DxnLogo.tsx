export function DxnLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-full bg-[#111110] border border-[#d7ae55]/30 shadow-md p-1.5 ${className}`}>
      {/* Authentic DXN emblem: Red Sun, Green Sprout, Blue Waves */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="60" cy="60" r="58" fill="#0c0d0e" stroke="#252520" strokeWidth="1" />
        
        {/* Red Sun Symbol */}
        <circle cx="60" cy="38" r="22" fill="#E21818" />
        
        {/* Green Sprout / Tree Leaves */}
        <path
          d="M60 30 C50 45 42 62 42 75 C48 76 54 74 60 70 C66 74 72 76 78 75 C78 62 70 45 60 30 Z"
          fill="#10B981"
        />
        <path
          d="M60 48 L60 74"
          stroke="#065F46"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Blue Flowing Water Bands */}
        <path
          d="M34 84 C48 80 72 80 86 84 C84 89 74 91 60 91 C46 91 36 89 34 84 Z"
          fill="#2563EB"
        />
        <path
          d="M40 93 C50 90 70 90 80 93 C78 96 70 98 60 98 C50 98 42 96 40 93 Z"
          fill="#3B82F6"
        />

        {/* DXN Text subtle emblem banner or letters */}
        <text
          x="60"
          y="112"
          textAnchor="middle"
          fill="#d7ae55"
          fontSize="13"
          fontWeight="800"
          fontFamily="Manrope, sans-serif"
          letterSpacing="2.5"
        >
          DXN
        </text>
      </svg>
    </div>
  );
}
