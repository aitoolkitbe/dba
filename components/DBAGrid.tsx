"use client";

import { useMemo, useState } from "react";
import type { DBAAsset, Quadrant } from "@/lib/types";
import { quadrantOf, QUADRANT_META } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  assets: DBAAsset[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

/**
 * Fame × Uniqueness scatter plot with quadrant shading and draggable-feeling
 * dots. Pure SVG so it renders crisply at any size and is server-friendly.
 */
export function DBAGrid({ assets, selectedId, onSelect }: Props) {
  const size = 520;
  const padding = 40;
  const inner = size - padding * 2;

  const [hovered, setHovered] = useState<string | null>(null);

  const scored = useMemo(
    () => assets.filter((a) => a.scores !== undefined),
    [assets]
  );

  const project = (val: number, axis: "x" | "y") => {
    const t = Math.max(0, Math.min(100, val)) / 100;
    if (axis === "x") return padding + t * inner;
    // y is inverted in SVG
    return padding + (1 - t) * inner;
  };

  return (
    <div className="w-full">
      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
          {/* Quadrant shading */}
          <rect
            x={padding + inner / 2}
            y={padding}
            width={inner / 2}
            height={inner / 2}
            fill="#dcfce7"
            opacity={0.55}
          />
          <rect
            x={padding}
            y={padding}
            width={inner / 2}
            height={inner / 2}
            fill="#dbeafe"
            opacity={0.5}
          />
          <rect
            x={padding}
            y={padding + inner / 2}
            width={inner / 2}
            height={inner / 2}
            fill="#f1f5f9"
            opacity={0.55}
          />
          <rect
            x={padding + inner / 2}
            y={padding + inner / 2}
            width={inner / 2}
            height={inner / 2}
            fill="#fef9c3"
            opacity={0.5}
          />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((g) => (
            <g key={g}>
              <line
                x1={project(g, "x")}
                y1={padding}
                x2={project(g, "x")}
                y2={size - padding}
                stroke="#e5e7eb"
                strokeWidth={g === 50 ? 1.2 : 0.5}
                strokeDasharray={g === 50 ? "4 4" : "1 3"}
              />
              <line
                x1={padding}
                y1={project(g, "y")}
                x2={size - padding}
                y2={project(g, "y")}
                stroke="#e5e7eb"
                strokeWidth={g === 50 ? 1.2 : 0.5}
                strokeDasharray={g === 50 ? "4 4" : "1 3"}
              />
            </g>
          ))}

          {/* Quadrant labels */}
          <QuadrantLabel
            x={padding + 16}
            y={padding + 24}
            quadrant="investable"
          />
          <QuadrantLabel
            x={size - padding - 16}
            y={padding + 24}
            quadrant="winner"
            anchor="end"
          />
          <QuadrantLabel
            x={padding + 16}
            y={size - padding - 10}
            quadrant="ignorable"
          />
          <QuadrantLabel
            x={size - padding - 16}
            y={size - padding - 10}
            quadrant="taxi"
            anchor="end"
          />

          {/* Axes */}
          <text
            x={size / 2}
            y={size - 10}
            textAnchor="middle"
            fontSize="12"
            fill="#334155"
            fontWeight="600"
          >
            FAME → (% of category buyers who name your brand)
          </text>
          <text
            x={-size / 2}
            y={14}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize="12"
            fill="#334155"
            fontWeight="600"
          >
            UNIQUENESS → (% who name ONLY your brand)
          </text>

          {/* Dots */}
          {scored.map((a) => {
            const q = quadrantOf(a.scores) as Quadrant;
            const color = colorFor(q);
            const cx = project(a.scores!.fame, "x");
            const cy = project(a.scores!.uniqueness, "y");
            const isActive = selectedId === a.id || hovered === a.id;
            return (
              <g
                key={a.id}
                onMouseEnter={() => setHovered(a.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(a.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 13 : 9}
                  fill={color}
                  opacity={isActive ? 1 : 0.82}
                  stroke="#fff"
                  strokeWidth={2}
                />
                {a.visual && (
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fontSize={isActive ? 12 : 10}
                  >
                    {a.visual}
                  </text>
                )}
                {isActive && (
                  <g>
                    <rect
                      x={cx + 14}
                      y={cy - 26}
                      width={labelWidth(a.name)}
                      height={28}
                      rx={6}
                      fill="#0f172a"
                    />
                    <text
                      x={cx + 22}
                      y={cy - 8}
                      fontSize="11"
                      fill="#fff"
                      fontWeight="600"
                    >
                      {a.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        {(Object.keys(QUADRANT_META) as Array<keyof typeof QUADRANT_META>).map(
          (k) => (
            <div key={k} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colorFor(k) }}
              />
              <span className="font-medium text-ink-700">
                {QUADRANT_META[k].label}
              </span>
              <span className="text-ink-500">— {QUADRANT_META[k].short}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function QuadrantLabel({
  x,
  y,
  quadrant,
  anchor = "start",
}: {
  x: number;
  y: number;
  quadrant: Quadrant;
  anchor?: "start" | "end";
}) {
  const m = QUADRANT_META[quadrant];
  return (
    <text
      x={x}
      y={y}
      fontSize="10"
      fontWeight="700"
      letterSpacing="0.08em"
      textAnchor={anchor}
      fill={colorFor(quadrant)}
    >
      {m.label.toUpperCase()}
    </text>
  );
}

function colorFor(q: Quadrant) {
  switch (q) {
    case "winner":
      return "#16a34a";
    case "taxi":
      return "#eab308";
    case "investable":
      return "#2563eb";
    case "ignorable":
      return "#94a3b8";
  }
}

function labelWidth(s: string) {
  return Math.min(220, Math.max(80, s.length * 7 + 20));
}

export { colorFor as quadrantColor };
