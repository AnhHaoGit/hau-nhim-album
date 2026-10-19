"use client";
import { Fragment } from "react";
import { ik } from "@/lib/ik";
import {
  CAP_FS,
  LAYOUTS,
  LAYOUT_MAP,
  capMax,
  padOf,
  type Align,
} from "@/lib/layouts";
import type { PageDTO } from "@/lib/types";
import Decor from "./Decor";
import { AddPhoto, CaptionEditor, DateEditor, PhotoTools } from "./EditParts";

export type EditApi = {
  busy: (slot: number) => boolean;
  pickPhoto: (slot: number) => void;
  clearPhoto: (slot: number) => void;
  setCaption: (slot: number, text: string) => void;
  setDate: (slot: number, date: string) => void;
  focusCaption: (slot: number) => void;
  blurCaption: () => void;
};

const mirrorAlign = (a: Align): Align =>
  a === "left" ? "right" : a === "right" ? "left" : a;

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

  return (
    <div className="lp">
      <Decor items={L.deco} X={X} R={R} />
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
                  fontSize: `${CAP_FS}cqw`,
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
                    fontSize={CAP_FS}
                    maxLen={capMax(s.cap)}
                    onText={(t) => edit.setCaption(i, t)}
                    onFocus={() => edit.focusCaption(i)}
                    onBlur={edit.blurCaption}
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
