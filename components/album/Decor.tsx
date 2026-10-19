import type { Deco, ScrapBg, TapeColor } from "@/lib/layouts";
import Doodle from "./Doodles";

const SCRAP_BG: Record<ScrapBg, string> = {
  kraft: "linear-gradient(135deg,#d6b48f,#bf9a74)",
  cream: "linear-gradient(135deg,#efe5d0,#e2d6bd)",
  pink: "linear-gradient(135deg,#f3d3cd,#e8bdb7)",
  newsprint: "linear-gradient(135deg,#e8e4d9,#d9d4c6)",
};
const TAPE_BG: Record<TapeColor, string> = {
  pink: "radial-gradient(circle,#ffffff80 1.3px,transparent 1.6px) 0 0/9px 9px, #efb3b8",
  beige: "repeating-linear-gradient(45deg,#e6d6b8 0 5px,#f1e6cf 5px 10px)",
  kraft: "linear-gradient(#cba983,#c09b75)",
  white: "linear-gradient(#f3f1ea,#e6e3da)",
};
const TORN = [
  "polygon(2% 8%,12% 0,26% 6%,41% 0,57% 5%,72% 0,86% 6%,98% 1%,100% 32%,97% 56%,100% 80%,96% 100%,80% 95%,62% 100%,45% 96%,28% 100%,12% 96%,0 100%,3% 70%,0 45%,3% 22%)",
  "polygon(0 4%,14% 0,30% 5%,50% 1%,68% 6%,86% 0,100% 4%,97% 28%,100% 52%,96% 76%,100% 100%,82% 96%,64% 100%,44% 95%,24% 100%,8% 96%,2% 74%,0 48%,3% 24%)",
];

/** Vẽ các sticker / giấy vụn / băng dính. X, R dùng để lật gương cho trang trái. */
export default function Decor({ items, X, R }: { items: Deco[]; X: (x: number, w: number) => number; R: (r?: number) => number }) {
  return (
    <>
      {items.map((d, i) => {
        const base: React.CSSProperties = {
          position: "absolute", left: `${X(d.x, d.w)}%`, top: `${d.y}%`, width: `${d.w}%`,
          transform: `rotate(${R(d.rot)}deg)`, zIndex: d.z ?? 1, pointerEvents: "none",
        };
        if (d.t === "doodle") return <div key={i} style={{ ...base, opacity: 0.92 }}><Doodle k={d.k} /></div>;
        if (d.t === "chalk")
          return (
            <div key={i} className={d.script ? "font-script" : "font-hand"}
              style={{ ...base, color: "var(--chalk)", fontSize: `${d.fs ?? 6}cqw`, lineHeight: 1.1, textAlign: "center" }}>
              {d.text}
            </div>
          );
        if (d.t === "tape")
          return (
            <div key={i} style={{ ...base, aspectRatio: "3.6 / 1", background: TAPE_BG[d.c], opacity: 0.88,
              clipPath: "polygon(0 0,100% 0,98% 25%,100% 50%,98% 75%,100% 100%,0 100%,2% 75%,0 50%,2% 25%)" }} />
          );
        return (
          <div key={i} style={{ ...base, filter: "drop-shadow(0 2px 2px rgba(0,0,0,.5))" }}>
            <div className="font-hand" style={{ background: SCRAP_BG[d.bg], color: "#43322c", clipPath: TORN[d.shape ?? 0],
              padding: "3.2cqw 3.6cqw", fontSize: `${d.fs ?? 4.4}cqw`, lineHeight: 1.12, textAlign: "center" }}>
              {d.text}
            </div>
            {d.tape && (
              <div style={{ position: "absolute", top: "-6%", left: "50%", width: "46%", aspectRatio: "3.6 / 1",
                transform: "translateX(-50%) rotate(-4deg)", background: TAPE_BG[d.tape], opacity: 0.88 }} />
            )}
          </div>
        );
      })}
    </>
  );
}
