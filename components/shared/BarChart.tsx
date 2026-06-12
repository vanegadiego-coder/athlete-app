'use client';

interface Bar {
  label: string;
  value: number;
  isToday?: boolean;
}

interface Props {
  bars: Bar[];
  max: number;
  targetLine?: number;
  unit?: string;
  height?: number;
}

export default function BarChart({ bars, max, targetLine, unit = '', height = 72 }: Props) {
  if (!bars.length) return null;
  const effectiveMax = Math.max(max, 1);

  return (
    <div className="w-full">
      <svg width="100%" viewBox={`0 0 ${bars.length * 36} ${height + 20}`} preserveAspectRatio="xMidYMid meet">
        {targetLine && targetLine <= effectiveMax && (
          <line
            x1="0" y1={height - (targetLine / effectiveMax) * height}
            x2={bars.length * 36} y2={height - (targetLine / effectiveMax) * height}
            stroke="#52525B" strokeWidth="1" strokeDasharray="3 3"
          />
        )}

        {bars.map((bar, i) => {
          const barH = Math.max(2, (bar.value / effectiveMax) * height);
          const x = i * 36 + 6;
          const barW = 22;
          const y = height - barH;
          const fill = bar.isToday ? '#FAFAFA' : '#3F3F46';

          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={fill} rx="2" />
              <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize="9" fill="#52525B" fontFamily="system-ui">
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
