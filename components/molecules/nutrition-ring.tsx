'use client';

import { useMemo } from 'react';

interface NutritionRingProps {
  protein: number;
  carbs: number;
  fats: number;
  size?: number;
  strokeWidth?: number;
}

export function NutritionRing({
  protein,
  carbs,
  fats,
  size = 120,
  strokeWidth = 12,
}: NutritionRingProps) {
  const total = protein + carbs + fats;

  const percentages = useMemo(() => {
    if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
    return {
      protein: (protein / total) * 100,
      carbs: (carbs / total) * 100,
      fats: (fats / total) * 100,
    };
  }, [protein, carbs, fats, total]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate stroke dash offsets for each segment
  const _proteinOffset = 0;
  const carbsOffset = (percentages.protein / 100) * circumference;
  const fatsOffset = carbsOffset + (percentages.carbs / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-label="Nutrition breakdown">
        <title>Nutrition breakdown</title>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
          opacity={0.2}
        />

        {/* Protein arc (blue) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(221, 83%, 53%)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percentages.protein / 100) * circumference}
          strokeLinecap="round"
        />

        {/* Carbs arc (green) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(142, 76%, 36%)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - carbsOffset - (percentages.carbs / 100) * circumference}
          strokeLinecap="round"
          style={{
            strokeDashoffset:
              circumference - carbsOffset - (percentages.carbs / 100) * circumference,
          }}
        />

        {/* Fats arc (orange) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(25, 95%, 53%)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - fatsOffset - (percentages.fats / 100) * circumference}
          strokeLinecap="round"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-bold">{total}g</p>
        <p className="text-xs text-muted-foreground">total</p>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(221,83%,53%)]" />
            <span>Protein</span>
          </div>
          <span className="font-medium">{protein}g</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(142,76%,36%)]" />
            <span>Carbs</span>
          </div>
          <span className="font-medium">{carbs}g</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(25,95%,53%)]" />
            <span>Fats</span>
          </div>
          <span className="font-medium">{fats}g</span>
        </div>
      </div>
    </div>
  );
}
