import type { DoodleKind } from "@/lib/layouts";

const H = "M20 34C8 25 5 17 9 11c4-5 9-3 11 2 2-5 7-7 11-2 4 6 1 14-11 23z";
const PETAL = "M20 17c-4-5-3-12 0-14 3 2 4 9 0 14z";

const SHAPES: Record<
  DoodleKind,
  { vb: string; el: React.ReactNode; dash?: string }
> = {
  heart: { vb: "0 0 40 40", el: <path d={H} /> },
  hearts: {
    vb: "0 0 70 50",
    el: (
      <>
        <path d={H} transform="translate(0 10) scale(.9)" />
        <path d={H} transform="translate(30 0) scale(.75)" />
        <path d={H} transform="translate(38 22) scale(.6)" />
      </>
    ),
  },
  star: {
    vb: "0 0 40 40",
    el: <path d="M20 4l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" />,
  },
  sparkle: {
    vb: "0 0 40 40",
    el: (
      <path d="M20 2c1 10 8 17 18 18-10 1-17 8-18 18-1-10-8-17-18-18 10-1 17-8 18-18z" />
    ),
  },
  squiggle: {
    vb: "0 0 120 30",
    el: <path d="M4 15c10-16 20-16 30 0s20 16 30 0 20-16 30 0 10 8 22 0" />,
  },
  zigzag: {
    vb: "0 0 120 24",
    el: (
      <path d="M2 18l10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12" />
    ),
  },
  dots: { vb: "0 0 120 6", el: <path d="M2 3h116" />, dash: "1 9" },
  arrow: {
    vb: "0 0 60 40",
    el: <path d="M4 8c20-6 40 4 44 22M48 30l-9-4M48 30l2-10" />,
  },
  loop: {
    vb: "0 0 40 40",
    el: (
      <path d="M22 5C13 4 6 10 5 19c-1 9 5 17 14 17 10 0 17-7 16-16-1-8-8-13-15-12-7 1-11 7-9 13" />
    ),
  },
  moon: {
    vb: "0 0 40 40",
    el: <path d="M28 6a15 15 0 1 0 8 24 12 12 0 0 1-8-24z" />,
  },
  flower: {
    vb: "0 0 40 40",
    el: (
      <>
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={PETAL} transform={`rotate(${a} 20 20)`} />
        ))}
        <circle cx="20" cy="20" r="2.2" />
      </>
    ),
  },
  underline: {
    vb: "0 0 120 14",
    el: <path d="M3 9c20-6 40 3 60-2s40 3 54 0" />,
  },
  sunheart: {
    vb: "0 0 50 50",
    el: (
      <>
        <path d={H} transform="translate(5 6) scale(.75)" />
        <path d="M25 2v6M8 9l4 4M42 9l-4 4M2 26h6M48 26h-6" />
      </>
    ),
  },
};

export default function Doodle({
  k,
  style,
}: {
  k: DoodleKind;
  style?: React.CSSProperties;
}) {
  const s = SHAPES[k];
  return (
    <svg
      viewBox={s.vb}
      style={{
        display: "block",
        width: "100%",
        color: "var(--chalk)",
        ...style,
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={s.dash}
    >
      {s.el}
    </svg>
  );
}
