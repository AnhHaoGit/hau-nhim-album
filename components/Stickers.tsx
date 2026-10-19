const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

const emojis = [
  { e: "🦔", cls: "left-[4%] top-[20%] -rotate-6", size: 84, d: 0 },
  { e: "🦪", cls: "right-[4%] top-[24%] rotate-6", size: 84, d: 1.2 },
  { e: "🦪", cls: "bottom-[8%] left-[8%] -rotate-12", size: 60, d: 0.6 },
  { e: "🦔", cls: "bottom-[8%] right-[8%] rotate-3", size: 66, d: 1.8 },
];

const scraps = [
  {
    text: "you are my favorite person",
    cls: "left-[2.5%] top-[46%] -rotate-6 w-40",
    bg: "#d8b898",
    tape: "#f3c6c6",
    d: 0.4,
  },
  {
    text: "to the moon and back",
    cls: "right-[2.5%] top-[48%] rotate-3 w-40",
    bg: "#efe4d0",
    tape: "#d9a89f",
    d: 1.4,
  },
  {
    text: "haunhim ♡",
    cls: "left-[3%] bottom-[24%] rotate-4 w-28",
    bg: "#f8e9e4",
    tape: "#c9a27e",
    d: 0.9,
  },
  {
    text: "forever & always",
    cls: "right-[3%] bottom-[26%] -rotate-3 w-36",
    bg: "#d8b898",
    tape: "#f3c6c6",
    d: 2.1,
  },
];

const torn =
  "polygon(2% 6%, 12% 0, 25% 5%, 40% 0, 55% 4%, 70% 0, 85% 5%, 98% 1%, 100% 30%, 97% 55%, 100% 80%, 96% 100%, 80% 96%, 62% 100%, 45% 96%, 28% 100%, 12% 97%, 0 100%, 3% 70%, 0 45%, 3% 22%)";

const line = {
  fill: "none",
  stroke: "#8a6a62",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...line}>
      <path d="M20 34C8 25 5 17 9 11c4-5 9-3 11 2 2-5 7-7 11-2 4 6 1 14-11 23z" />
    </svg>
  );
}
function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...line}>
      <path d="M20 4l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" />
    </svg>
  );
}
function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 30" className={className} {...line}>
      <path d="M4 15c10-16 20-16 30 0s20 16 30 0 20-16 30 0 10 8 22 0" />
    </svg>
  );
}
function Dots({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 6"
      className={className}
      {...line}
      strokeDasharray="1 9"
    >
      <path d="M2 3h116" />
    </svg>
  );
}

export default function Stickers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden select-none lg:block"
    >
      {/* emoji */}
      {emojis.map((it, i) => (
        <span
          key={"e" + i}
          className={`float absolute leading-none drop-shadow-sm ${it.cls}`}
          style={{
            fontSize: it.size,
            fontFamily: EMOJI_FONT,
            animationDelay: `${it.d}s`,
          }}
        >
          {it.e}
        </span>
      ))}

      {/* giấy vụn + washi tape */}
      {scraps.map((s, i) => (
        <div
          key={"s" + i}
          className={`float absolute ${s.cls}`}
          style={{ animationDelay: `${s.d}s` }}
        >
          <div
            className="font-hand px-4 py-4 text-center text-lg leading-tight shadow-md"
            style={{ background: s.bg, color: "#4a3832", clipPath: torn }}
          >
            {s.text}
          </div>
          <span
            className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-3 opacity-80"
            style={{
              background: `repeating-linear-gradient(45deg, ${s.tape} 0 6px, #ffffff66 6px 10px)`,
            }}
          />
        </div>
      ))}

      {/* doodle nét vẽ tay */}
      <Heart className="float absolute left-[13%] top-[12%] w-9 -rotate-12 opacity-70" />
      <Star
        className="float absolute right-[13%] top-[14%] w-8 rotate-12 opacity-70"
        style-delay
      />
      <Squiggle className="absolute left-[9%] top-[38%] w-24 opacity-60" />
      <Squiggle className="absolute right-[9%] bottom-[40%] w-24 opacity-60" />
      <Dots className="absolute bottom-[5%] left-[22%] w-40 opacity-60" />
      <Dots className="absolute top-[9%] right-[24%] w-40 opacity-60" />
      <Heart className="float absolute bottom-[12%] right-[20%] w-7 rotate-6 opacity-70" />
      <Star className="float absolute bottom-[14%] left-[19%] w-6 -rotate-6 opacity-70" />
    </div>
  );
}
