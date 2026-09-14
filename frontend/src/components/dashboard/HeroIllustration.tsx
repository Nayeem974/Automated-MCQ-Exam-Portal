// Original flat-vector illustration composed for the welcome banner —
// a student at a laptop with a graduation cap and an exam checklist.
// No external assets/stock imagery; pure inline SVG so it themes cleanly.
export default function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* soft glow blob behind everything */}
      <ellipse cx="230" cy="180" rx="150" ry="100" fill="white" fillOpacity="0.08" />
      <circle cx="120" cy="70" r="46" fill="white" fillOpacity="0.08" />

      {/* clipboard, back-right */}
      <g transform="translate(268 60)">
        <rect x="0" y="14" width="108" height="146" rx="14" fill="white" />
        <rect x="30" y="0" width="48" height="24" rx="8" fill="#4F24C6" />
        <rect x="38" y="6" width="32" height="10" rx="5" fill="white" fillOpacity="0.5" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(16 ${44 + i * 34})`}>
            <rect width="24" height="24" rx="7" fill="#EDE6FF" />
            <path
              d="M5 12.5L10 17.5L19 7"
              stroke="#6D3DF5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="34" y="6" width="58" height="6" rx="3" fill="#E4DBFF" />
            <rect x="34" y="16" width="40" height="6" rx="3" fill="#EDE6FF" />
          </g>
        ))}
      </g>

      {/* alarm clock, front-right */}
      <g transform="translate(300 190)">
        <circle cx="34" cy="34" r="34" fill="#FBBF24" />
        <circle cx="34" cy="34" r="26" fill="#FFF7E0" />
        <path d="M34 34 L34 18" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 34 L46 40" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
        <circle cx="34" cy="34" r="2.5" fill="#B45309" />
        <path d="M10 8 L2 -2" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
        <path d="M58 8 L66 -2" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* "Practice attempt scored" chip, upper-left of character */}
      <g transform="translate(40 96)">
        <rect x="0" y="0" width="128" height="56" rx="16" fill="white" />
        <circle cx="26" cy="28" r="14" fill="#6D3DF5" />
        <path d="M20 28l4.5 4.5L33 23" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="48" y="14" width="64" height="7" rx="3.5" fill="#DCD2FF" />
        <rect x="48" y="26" width="50" height="7" rx="3.5" fill="#DCD2FF" />
        <rect x="48" y="38" width="58" height="7" rx="3.5" fill="#EDE6FF" />
      </g>

      {/* character body */}
      <g transform="translate(120 60)">
        {/* chair/desk shadow */}
        <ellipse cx="70" cy="228" rx="86" ry="14" fill="black" fillOpacity="0.08" />

        {/* legs + laptop base */}
        <rect x="18" y="176" width="104" height="16" rx="8" fill="#2A2440" />
        <path d="M30 176 L46 130 L96 130 L112 176 Z" fill="#3A3158" />

        {/* laptop screen */}
        <rect x="42" y="96" width="58" height="40" rx="4" fill="#EDE6FF" />
        <rect x="46" y="100" width="50" height="30" rx="2" fill="#4F24C6" />

        {/* torso (hoodie) */}
        <path
          d="M20 176 C16 130 34 96 70 96 C106 96 124 130 120 176 Z"
          fill="#5B2FDE"
        />
        <path d="M55 96 C60 112 80 112 85 96" stroke="#4F24C6" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="70" cy="150" r="5" fill="#4F24C6" />

        {/* arms */}
        <path d="M22 150 C6 140 2 118 14 104" stroke="#5B2FDE" strokeWidth="18" strokeLinecap="round" />
        <path d="M118 150 C134 140 138 118 126 104" stroke="#5B2FDE" strokeWidth="18" strokeLinecap="round" />
        <circle cx="12" cy="100" r="10" fill="#F3C89E" />
        <circle cx="128" cy="100" r="10" fill="#F3C89E" />

        {/* head */}
        <circle cx="70" cy="56" r="34" fill="#F3C89E" />
        <path
          d="M36 52 C36 22 104 22 104 52 C104 40 92 30 70 30 C48 30 36 40 36 52Z"
          fill="#2A2440"
        />
        {/* face */}
        <circle cx="58" cy="58" r="3.4" fill="#2A2440" />
        <circle cx="82" cy="58" r="3.4" fill="#2A2440" />
        <path d="M60 70 C65 75 75 75 80 70" stroke="#2A2440" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* graduation cap, tilted above head */}
        <g transform="translate(30 6) rotate(-8)">
          <rect x="18" y="18" width="44" height="10" rx="3" fill="#1E1B2E" />
          <path d="M0 14 L40 0 L80 14 L40 28 Z" fill="#2A2440" />
          <circle cx="80" cy="14" r="3" fill="#FBBF24" />
          <path d="M80 14 L80 34" stroke="#FBBF24" strokeWidth="2" />
        </g>
      </g>

      {/* handwritten "Good luck!" flourish */}
      <g transform="translate(345 108)" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M0 24 C4 6 14 2 18 14 C21 24 30 8 34 2" />
        <path d="M2 34 Q20 44 38 32" strokeDasharray="1 7" />
      </g>
    </svg>
  );
}
