import { ik } from "@/lib/ik";
import { COVER } from "@/lib/layouts";
import type { CoverDTO } from "@/lib/types";
import Decor from "./Decor";
import { AddPhoto, PhotoTools } from "./EditParts";

export type CoverEdit = { busy: boolean; pick: () => void; clear: () => void };

/** Bìa trước: tiêu đề phấn, 1 khung polaroid ở giữa + sticker. Không có phụ đề / ngày. */
export default function CoverPage({ photo, edit }: { photo: CoverDTO | null; edit?: CoverEdit }) {
  const s = COVER.slot;
  const has = !!photo?.url;
  return (
    <div className="lp">
      <Decor items={COVER.deco} X={(x) => x} R={(r = 0) => r} />
      <div style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, transform: `rotate(${s.rot}deg)`,
        zIndex: 2, containerType: "inline-size" }}>
        <div style={{ position: "relative", background: "#f6f3ec", padding: "5cqw 5cqw 16cqw", boxShadow: "0 4px 12px rgba(0,0,0,.6)" }}>
          <div style={{ position: "relative", aspectRatio: String(s.ratio), overflow: "hidden", background: "#33322f" }}>
            {has ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ik(photo!.url, 1400)} alt="" draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
            ) : edit ? (
              <AddPhoto busy={edit.busy} onClick={edit.pick} />
            ) : null}
            {edit && has && <PhotoTools busy={edit.busy} onReplace={edit.pick} onClear={edit.clear} />}
          </div>
        </div>
      </div>
    </div>
  );
}
