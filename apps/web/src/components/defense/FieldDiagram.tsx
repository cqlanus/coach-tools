"use client";

import {
  Position,
  SituationMap,
  AssignmentType,
  PlayType,
  FIELD_POSITIONS,
  BALL_POSITIONS,
  ASSIGNMENT_COLORS,
  POSITION_LABELS,
} from "@/lib/defense-situations";

interface FieldDiagramProps {
  situation: SituationMap | null;
  play: PlayType;
  activePosition: Position | null;
  onPositionHover: (pos: Position | null) => void;
}

const BASE_POSITIONS = {
  home: { x: 260, y: 340 },
  first: { x: 335, y: 265 },
  second: { x: 260, y: 190 },
  third: { x: 185, y: 265 },
};

const RUNNER_BASES: Record<string, { x: number; y: number }> = {
  "0": BASE_POSITIONS.first,
  "1": BASE_POSITIONS.second,
  "2": BASE_POSITIONS.third,
};

export function FieldDiagram({
  situation,
  play,
  activePosition,
  onPositionHover,
}: FieldDiagramProps) {
  const ballPos = BALL_POSITIONS[play];
  const isDouble = play.startsWith("dbl_");

  return (
    <svg
      viewBox="0 0 520 400"
      className="w-full h-full"
      role="img"
      aria-label="Baseball field diagram showing defensive assignments"
    >
      {/* ── Outfield grass ── */}
      <ellipse cx="260" cy="210" rx="230" ry="215" fill="#163620" />

      {/* ── Infield dirt ── */}
      <path
        d="M260 340 L360 240 L260 140 L160 240 Z"
        fill="#7a5230"
        opacity="0.7"
      />

      {/* ── Foul lines — aligned to diamond edges (45°), perpendicular at home ── */}
      <line x1="260" y1="340" x2="0"   y2="80"  stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <line x1="260" y1="340" x2="520" y2="80"  stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

      {/* ── Infield grass ── */}
      <path
        d="M260 310 L330 240 L260 170 L190 240 Z"
        fill="#1e4a2a"
      />

      {/* ── Bases ── */}
      {Object.entries(BASE_POSITIONS).map(([name, pos]) => (
        <rect
          key={name}
          x={pos.x - 8}
          y={pos.y - 8}
          width={16}
          height={16}
          fill="#f0ead6"
          stroke="#d4c9a8"
          strokeWidth="1"
          transform={`rotate(45 ${pos.x} ${pos.y})`}
        />
      ))}

      {/* ── Pitcher's mound ── */}
      <circle cx="260" cy="255" r="10" fill="#7a5230" opacity="0.8" />
      <circle cx="260" cy="255" r="4"  fill="#a0744a" />

      {/* ── Ball location ── */}
      {ballPos && (
        <g>
          {isDouble ? (
            // Star marker for doubles
            <g>
              <circle
                cx={ballPos.cx} cy={ballPos.cy} r="12"
                fill="#fde68a" stroke="#d97706" strokeWidth="2"
              />
              <text
                x={ballPos.cx} y={ballPos.cy}
                textAnchor="middle" dominantBaseline="central"
                fontSize="10" fill="#92400e" fontWeight="700"
              >⚾</text>
            </g>
          ) : (
            // Circle marker for ground balls
            <circle
              cx={ballPos.cx} cy={ballPos.cy} r="8"
              fill="#fde68a" stroke="#d97706" strokeWidth="2"
            />
          )}
        </g>
      )}

      {/* ── Position markers ── */}
      {(Object.entries(FIELD_POSITIONS) as [Position, { cx: number; cy: number }][]).map(
        ([pos, coords]) => {
          const assignment = situation?.[pos];
          const color = assignment
            ? ASSIGNMENT_COLORS[assignment.role]
            : "#374151";
          const isActive = activePosition === pos;
          const isHover  = activePosition === pos;

          return (
            <g
              key={pos}
              transform={`translate(${coords.cx},${coords.cy})`}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => onPositionHover(pos)}
              onMouseLeave={() => onPositionHover(null)}
              onTouchStart={() => onPositionHover(isActive ? null : pos)}
            >
              {/* Glow ring when active */}
              {isActive && (
                <circle r="22" fill={color} opacity="0.25" />
              )}

              {/* Main circle */}
              <circle
                r="18"
                fill={color}
                opacity={situation ? 1 : 0.3}
                stroke={isActive ? "white" : "rgba(255,255,255,0.3)"}
                strokeWidth={isActive ? 2 : 1}
              />

              {/* Position abbreviation */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fontWeight="700"
                fontFamily="'Barlow Condensed', sans-serif"
                fill="white"
                letterSpacing="0.5"
              >
                {POSITION_LABELS[pos]}
              </text>

              {/* Assignment role badge (small, below position) */}
              {assignment && assignment.role !== "hold" && (
                <text
                  y="28"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="600"
                  fontFamily="'Barlow', sans-serif"
                  fill={color}
                  opacity="0.9"
                >
                  {assignment.role.toUpperCase()}
                </text>
              )}
            </g>
          );
        }
      )}
    </svg>
  );
}
