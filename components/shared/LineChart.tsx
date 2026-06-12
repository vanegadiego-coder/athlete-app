'use client';

interface Point {
  label: string;
  value: number;
}

interface Props {
  points: Point[];
  targetLine?: number;
  height?: number;
  unit?: string;
  inverted?: boolean;
}

export default function LineChart({ points, targetLine, height = 72, inverted = false }: Props) {
  if (points.length < 2) return null;
  const vals = points.map(p => p.value).filter(v => v > 0);
  if (!vals.length) return null;

  const min = Math.min(...vals) * 0.95;
  const max = Math.max(...vals) * 1.05;
  const range = max - min || 1;
  const w = 320;
  const padX = 12;
  const usableW = w - padX * 2;
  const step = usableW / (points.length - 1);

  function toY(v: number) {
    const pct = (v - min) / range;
    return height - pct * height;
  }

  const pathData = points
    .filter(p => p.value > 0)
    .map((p, i) => {
      const idx = points.indexOf(p);
      const x = padX + idx * step;
      const y = toY(p.value);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${height + 20}`} preserveAspectRatio="xMidYMid meet">
        {targetLine && (
          <line x1={padX} y1={toY(targetLine)} x2={w - padX} y2={toY(targetLine)} stroke="#52525B" strokeWidth="1" strokeDasharray="3 3" />
        )}

        <path d={pathData} fill="none" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => p.value > 0 && (
          <g key={i}>
            <circle cx={padX + i * step} cy={toY(p.value)} r="2.5" fill="#FAFAFA" />
            <text x={padX + i * step} y={height + 14} textAnchor="middle" fontSize="9" fill="#52525B" fontFamily="system-ui">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
