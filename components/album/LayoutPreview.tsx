import { ik } from "@/lib/ik";
import { frameHeight, innerH, padOf, type Layout } from "@/lib/layouts";
import type { PhotoDTO } from "@/lib/types";

/** Bản thu nhỏ của layout: chỉ hiện vị trí + kích thước khung ảnh (và ảnh thật nếu có) */
export default function LayoutPreview({
  layout,
  photos,
}: {
  layout: Layout;
  photos?: PhotoDTO[];
}) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "3 / 4",
        background: "#1d1c1b",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {layout.slots.map((s, i) => {
        const fh = frameHeight(s.w, s.ratio, s.bare); // % chiều cao trang
        const hf = (fh * 4) / 3; // cùng đơn vị với chiều rộng
        const p = padOf(s.bare);
        const photo = photos?.find((x) => x.slot === i && x.url);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.w}%`,
              height: `${fh}%`,
              background: "#f6f3ec",
              transform: `rotate(${s.rot}deg)`,
              boxShadow: "0 1px 3px rgba(0,0,0,.6)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${p.l * 100}%`,
                width: `${(1 - 2 * p.l) * 100}%`,
                top: `${((p.t * s.w) / hf) * 100}%`,
                height: `${(innerH(s.w, s.ratio, s.bare) / hf) * 100}%`,
                background: "#9b978f",
                overflow: "hidden",
              }}
            >
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ik(photo.url, 240)}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
