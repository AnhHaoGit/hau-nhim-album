"use client";
import { Fragment } from "react";
import { ik } from "@/lib/ik";
import {
  LAYOUTS,
  LAYOUT_MAP,
  padOf,
  type Align,
  type Deco,
  type ScrapBg,
  type TapeColor,
} from "@/lib/layouts";
import type { PageDTO } from "@/lib/types";
import Doodle from "./Doodles";
import { AddPhoto, CaptionEditor, DateEditor, PhotoTools } from "./EditParts";

export type EditApi = {
  busy: (slot: number) => boolean;
  pickPhoto: (slot: number) => void;
  clearPhoto: (slot: number) => void;
  setCaption: (slot: number, text: string) => void;
  setColor: (slot: number, color: string) => void;
  setDate: (slot: number, date: string) => void;
};

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

const mirrorAlign = (a: Align): Align =>
  a === "left" ? "right" : a === "right" ? "left" : a;
const capSize = (n: number) =>
  n <= 40 ? 4.6 : n <= 100 ? 4 : n <= 200 ? 3.4 : 3;

export default function LayoutPage({
  page,
  mirror,
  edit,
}: {
  page: Pick<PageDTO, "layout" | "photos">;
  mirror: boolean;
  edit?: EditApi;
}) {
  const L = LAYOUT_MAP[page.layout] ?? LAYOUTS[0];
  const X = (x: number, w: number) => (mirror ? 100 - x - w : x);
  const R = (r = 0) => (mirror ? -r : r);

  const renderDeco = (d: Deco, i: number) => {
    const base: React.CSSProperties = {
      position: "absolute",
      left: `${X(d.x, d.w)}%`,
      top: `${d.y}%`,
      width: `${d.w}%`,
      transform: `rotate(${R(d.rot)}deg)`,
      zIndex: d.z ?? 1,
      pointerEvents: "none",
    };
    if (d.t === "doodle")
      return (
        <div key={i} style={{ ...base, opacity: 0.92 }}>
          <Doodle k={d.k} />
        </div>
      );
    if (d.t === "chalk")
      return (
        <div
          key={i}
          className="font-hand"
          style={{
            ...base,
            color: "var(--chalk)",
            fontSize: `${d.fs ?? 6}cqw`,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {d.text}
        </div>
      );
    if (d.t === "tape")
      return (
        <div
          key={i}
          style={{
            ...base,
            aspectRatio: "3.6 / 1",
            background: TAPE_BG[d.c],
            opacity: 0.88,
            clipPath:
              "polygon(0 0,100% 0,98% 25%,100% 50%,98% 75%,100% 100%,0 100%,2% 75%,0 50%,2% 25%)",
          }}
        />
      );
    return (
      <div
        key={i}
        style={{ ...base, filter: "drop-shadow(0 2px 2px rgba(0,0,0,.5))" }}
      >
        <div
          className="font-hand"
          style={{
            background: SCRAP_BG[d.bg],
            color: "#43322c",
            clipPath: TORN[d.shape ?? 0],
            padding: "3.2cqw 3.6cqw",
            fontSize: `${d.fs ?? 4.4}cqw`,
            lineHeight: 1.12,
            textAlign: "center",
          }}
        >
          {d.text}
        </div>
        {d.tape && (
          <div
            style={{
              position: "absolute",
              top: "-6%",
              left: "50%",
              width: "46%",
              aspectRatio: "3.6 / 1",
              transform: "translateX(-50%) rotate(-4deg)",
              background: TAPE_BG[d.tape],
              opacity: 0.88,
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="lp">
      {L.deco.map(renderDeco)}
      {L.slots.map((s, i) => {
        const ph = page.photos.find((p) => p.slot === i);
        const hasPhoto = !!ph?.url;
        const caption = ph?.caption ?? "";
        const pad = padOf(s.bare);
        const showFrame = !!edit || hasPhoto; // trang xem: không có ảnh thì không hiện khung
        const showCaption = !!edit || !!caption;
        const align = mirror ? mirrorAlign(s.cap.align) : s.cap.align;

        return (
          <Fragment key={i}>
            {showFrame && (
              <div
                style={{
                  position: "absolute",
                  left: `${X(s.x, s.w)}%`,
                  top: `${s.y}%`,
                  width: `${s.w}%`,
                  transform: `rotate(${R(s.rot)}deg)`,
                  zIndex: 2,
                  containerType: "inline-size",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    background: "#f6f3ec",
                    padding: `${pad.t * 100}cqw ${pad.l * 100}cqw ${pad.b * 100}cqw`,
                    boxShadow: "0 3px 9px rgba(0,0,0,.55)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: String(s.ratio),
                      overflow: "hidden",
                      background: "#33322f",
                    }}
                  >
                    {hasPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ik(ph!.url, 1400)}
                        alt=""
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          pointerEvents: "none",
                        }}
                      />
                    ) : (
                      edit && (
                        <AddPhoto
                          busy={edit.busy(i)}
                          onClick={() => edit.pickPhoto(i)}
                        />
                      )
                    )}
                    {edit && hasPhoto && (
                      <PhotoTools
                        busy={edit.busy(i)}
                        onReplace={() => edit.pickPhoto(i)}
                        onClear={() => edit.clearPhoto(i)}
                      />
                    )}
                  </div>
                  {edit ? (
                    <DateEditor
                      value={ph?.date ?? ""}
                      small={s.bare}
                      onChange={(d) => edit.setDate(i, d)}
                    />
                  ) : (
                    ph?.date && (
                      <span
                        className="font-hand"
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: s.bare ? "1cqw" : "4.5cqw",
                          textAlign: "center",
                          fontSize: s.bare ? "3.4cqw" : "6.2cqw",
                          lineHeight: 1,
                          color: "#222",
                        }}
                      >
                        {ph.date}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
            {showCaption && (
              <div
                className="font-hand"
                style={{
                  position: "absolute",
                  left: `${X(s.cap.x, s.cap.w)}%`,
                  top: `${s.cap.y}%`,
                  width: `${s.cap.w}%`,
                  transform: `rotate(${R(s.cap.rot)}deg)`,
                  zIndex: 6,
                  textAlign: align,
                  color: ph?.captionColor ?? "#f4f1ea",
                  fontSize: `${capSize(caption.length)}cqw`,
                  lineHeight: 1.15,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {edit ? (
                  <CaptionEditor
                    text={caption}
                    color={ph?.captionColor ?? "#f4f1ea"}
                    align={align}
                    fontSize={capSize(caption.length)}
                    onText={(t) => edit.setCaption(i, t)}
                    onColor={(c) => edit.setColor(i, c)}
                  />
                ) : (
                  caption
                )}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
