import { motion } from 'framer-motion';
import { scoreTone } from '../../lib/format';

const toneStroke: Record<ReturnType<typeof scoreTone>, string> = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export default function ScoreRing({
  percentage,
  size = 128,
  strokeWidth = 12,
  label,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F2EEFF" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneStroke[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-ink-900">{Math.round(clamped)}%</span>
        {label && <span className="text-[11px] font-medium text-ink-400">{label}</span>}
      </div>
    </div>
  );
}
