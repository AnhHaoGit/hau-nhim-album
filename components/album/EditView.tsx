"use client";
import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LAYOUT_MAP, capMax } from "@/lib/layouts";
import type { CoverDTO, PageDTO, PhotoDTO } from "@/lib/types";
import { uploadImage } from "@/lib/uploadClient";
import CoverPage from "./CoverPage";
import LayoutPage, { type EditApi } from "./LayoutPage";
import { AddPageModal, ReorderModal } from "./Modals";

const Album = dynamic(() => import("./Album"), { ssr: false });

const DEFAULT_COLOR = "#f4f1ea";
const SWATCHES = [
  "#f4f1ea",
  "#f6b8c1",
  "#f9e08b",
  "#a8dcb9",
  "#a9cdf0",
  "#d2b8e8",
  "#f5c08e",
];
const emptyPhoto = (slot: number): PhotoDTO => ({
  slot,
  url: "",
  fileId: "",
  width: 0,
  height: 0,
  caption: "",
  captionColor: DEFAULT_COLOR,
  date: "",
});
const emptyCover: CoverDTO = { url: "", fileId: "", width: 0, height: 0 };
const json = { "Content-Type": "application/json" };

type Actions = {
  patch: (
    pageId: string,
    slot: number,
    change: Partial<PhotoDTO>,
    delay: number,
  ) => void;
  pickPhoto: (pageId: string, slot: number) => void;
  pickCover: () => void;
  clearCover: () => void;
  focusCaption: (pageId: string, slot: number) => void;
  blurCaption: () => void;
};
type Ctx = {
  pages: PageDTO[];
  cover: CoverDTO;
  busy: Set<string>;
  act: Actions;
};
const EditCtx = createContext<Ctx>(null as unknown as Ctx);

// Các "node" đặt trong album luôn là cùng một element; dữ liệu mới được đọc qua context.
// Nhờ vậy gõ phụ đề / đổi màu / đổi ngày không làm album dựng lại và ô nhập giữ nguyên focus.
function PageNode({ id, mirror }: { id: string; mirror: boolean }) {
  const { pages, busy, act } = useContext(EditCtx);
  const p = pages.find((x) => x._id === id);
  if (!p) return null;
  const api: EditApi = {
    busy: (s) => busy.has(`${id}:${s}`),
    pickPhoto: (s) => act.pickPhoto(id, s),
    clearPhoto: (s) =>
      act.patch(id, s, { url: "", fileId: "", width: 0, height: 0 }, 60),
    setCaption: (s, t) => act.patch(id, s, { caption: t }, 700),
    setDate: (s, d) => act.patch(id, s, { date: d }, 200),
    focusCaption: (s) => act.focusCaption(id, s),
    blurCaption: act.blurCaption,
  };
  return <LayoutPage page={p} mirror={mirror} edit={api} />;
}

function CoverNode() {
  const { cover, busy, act } = useContext(EditCtx);
  return (
    <CoverPage
      photo={cover}
      edit={{
        busy: busy.has("cover"),
        pick: act.pickCover,
        clear: act.clearCover,
      }}
    />
  );
}

export default function EditView() {
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [cover, setCover] = useState<CoverDTO>(emptyCover);
  const [modal, setModal] = useState<"add" | "order" | null>(null);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [err, setErr] = useState("");
  const [jump, setJump] = useState<
    { page: number; nonce: number } | undefined
  >();
  const [active, setActive] = useState<{ pageId: string; slot: number } | null>(
    null,
  );

  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const target = useRef<{ pageId: string; slot: number } | null>(null);

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch("/api/pages", { cache: "no-store" }),
      fetch("/api/cover", { cache: "no-store" }),
    ]);
    if (a.ok) setPages(await a.json());
    if (b.ok) setCover(await b.json());
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function flush(pageId: string) {
    const page = pagesRef.current.find((p) => p._id === pageId);
    if (!page) return;
    const res = await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: json,
      body: JSON.stringify({ photos: page.photos }),
    });
    if (res.ok) setStatus("saved");
    else {
      setStatus("error");
      setErr((await res.json().catch(() => ({}))).error ?? "Lưu thất bại");
    }
  }

  const patch = useCallback(
    (
      pageId: string,
      slot: number,
      change: Partial<PhotoDTO>,
      delay: number,
    ) => {
      setPages((prev) =>
        prev.map((p) => {
          if (p._id !== pageId) return p;
          const photos = [...p.photos];
          const i = photos.findIndex((x) => x.slot === slot);
          const next = {
            ...(i >= 0 ? photos[i] : emptyPhoto(slot)),
            ...change,
          };
          const empty =
            !next.url &&
            !next.caption &&
            !next.date &&
            next.captionColor === DEFAULT_COLOR;
          if (i >= 0) {
            if (empty) photos.splice(i, 1);
            else photos[i] = next;
          } else if (!empty) photos.push(next);
          return { ...p, photos };
        }),
      );
      setStatus("saving");
      clearTimeout(timers.current[pageId]);
      timers.current[pageId] = setTimeout(
        () => flush(pageId),
        Math.max(delay, 60),
      );
    },
    [],
  );

  async function saveCover(c: CoverDTO) {
    setCover(c);
    setStatus("saving");
    const res = await fetch("/api/cover", {
      method: "PUT",
      headers: json,
      body: JSON.stringify(c),
    });
    if (res.ok) setStatus("saved");
    else {
      setStatus("error");
      setErr("Không lưu được ảnh bìa");
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const t = target.current;
    if (!file || !t) return;
    const key = t.pageId === "cover" ? "cover" : `${t.pageId}:${t.slot}`;
    setBusy((s) => new Set(s).add(key));
    try {
      const img = await uploadImage(file);
      if (t.pageId === "cover") await saveCover(img);
      else
        patch(
          t.pageId,
          t.slot,
          {
            url: img.url,
            fileId: img.fileId,
            width: img.width,
            height: img.height,
          },
          60,
        );
    } catch (e2) {
      setErr((e2 as Error).message);
      setStatus("error");
    }
    setBusy((s) => {
      const n = new Set(s);
      n.delete(key);
      return n;
    });
  }

  // thanh công cụ phụ đề: giữ hiện khi ô nhập hoặc thanh còn focus
  const blurCaption = useCallback(() => {
    setTimeout(() => {
      const a = document.activeElement as HTMLElement | null;
      if (toolbarRef.current?.contains(a) || a?.closest?.("[data-cap-editor]"))
        return;
      setActive(null);
    }, 250);
  }, []);

  const act: Actions = {
    patch,
    pickPhoto: (pageId, slot) => {
      target.current = { pageId, slot };
      fileRef.current?.click();
    },
    pickCover: () => {
      target.current = { pageId: "cover", slot: 0 };
      fileRef.current?.click();
    },
    clearCover: () => {
      saveCover(emptyCover);
    },
    focusCaption: (pageId, slot) => setActive({ pageId, slot }),
    blurCaption,
  };

  async function addPage(layout: string) {
    setModal(null);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: json,
      body: JSON.stringify({ layout, photos: [] }),
    });
    if (!res.ok) {
      setErr("Không thêm được trang");
      return;
    }
    const created: PageDTO = await res.json();
    setPages((p) => [...p, created]);
    setJump({ page: pagesRef.current.length + 1, nonce: Date.now() }); // lật tới trang vừa thêm
  }
  async function saveOrder(ids: string[]) {
    await fetch("/api/pages/reorder", {
      method: "PUT",
      headers: json,
      body: JSON.stringify({ ids }),
    });
    await load();
  }
  async function deletePage(id: string) {
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    await load();
  }

  // Danh sách node chỉ đổi khi thêm / xoá / đổi thứ tự trang (không đổi khi sửa nội dung)
  const idsKey = pages.map((p) => p._id).join(",");
  const nodes = useMemo(
    () =>
      (idsKey ? idsKey.split(",") : []).map((id, i) => (
        <PageNode key={id} id={id} mirror={(i + 1) % 2 === 1} />
      )),
    [idsKey],
  );
  const front = useMemo(() => <CoverNode />, []);

  const activePage = active
    ? pages.find((p) => p._id === active.pageId)
    : undefined;
  const activePhoto = activePage?.photos.find((x) => x.slot === active?.slot);
  const activeMax =
    activePage && active
      ? capMax(LAYOUT_MAP[activePage.layout]?.slots[active.slot]?.cap)
      : 0;
  const color = activePhoto?.captionColor ?? DEFAULT_COLOR;
  const keepFocus = (e: React.PointerEvent) => e.preventDefault(); // bấm nút không làm ô nhập mất focus

  return (
    <EditCtx.Provider value={{ pages, cover, busy, act }}>
      <Album
        pages={nodes}
        frontCover={front}
        flipByMouse={false}
        jumpTo={jump}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
      />

      {/* thanh chỉnh phụ đề: bộ đếm ký tự, màu chữ, xoá */}
      {active && activePage && (
        <div
          ref={toolbarRef}
          className="cap-toolbar"
          role="toolbar"
          aria-label="Chỉnh phụ đề"
        >
          <span className="cap-count">
            {(activePhoto?.caption ?? "").length}/{activeMax}
          </span>
          <span className="cap-sep" />
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Màu ${c}`}
              onPointerDown={keepFocus}
              onClick={() =>
                patch(active.pageId, active.slot, { captionColor: c }, 400)
              }
              className="cap-swatch"
              data-on={c.toLowerCase() === color.toLowerCase()}
              style={{ background: c }}
            />
          ))}
          <label className="cap-swatch cap-custom" title="Chọn màu khác">
            <input
              type="color"
              value={color}
              onChange={(e) =>
                patch(
                  active.pageId,
                  active.slot,
                  { captionColor: e.target.value },
                  400,
                )
              }
            />
          </label>
          <span className="cap-sep" />
          <button
            type="button"
            className="cap-btn"
            onPointerDown={keepFocus}
            onClick={() =>
              patch(active.pageId, active.slot, { caption: "" }, 60)
            }
          >
            Xoá chữ
          </button>
          <button
            type="button"
            className="cap-btn cap-done"
            onPointerDown={keepFocus}
            onClick={() => {
              (document.activeElement as HTMLElement | null)?.blur();
              setActive(null);
            }}
          >
            Xong
          </button>
        </div>
      )}

      <div className="edit-fabs">
        <span className="edit-status">
          {status === "saving"
            ? "Đang lưu…"
            : status === "saved"
              ? "Đã lưu ✓"
              : status === "error"
                ? "Lỗi lưu ✕"
                : "\u00A0"}
        </span>
        <button
          onClick={() => setModal("add")}
          className="edit-fab edit-fab-main"
        >
          ＋ Thêm trang
        </button>
        <button onClick={() => setModal("order")} className="edit-fab">
          ⇅ Sắp xếp trang
        </button>
      </div>

      {err && (
        <div className="edit-err" onClick={() => setErr("")}>
          {err} (bấm để tắt)
        </div>
      )}
      {modal === "add" && (
        <AddPageModal onPick={addPage} onClose={() => setModal(null)} />
      )}
      {modal === "order" && (
        <ReorderModal
          pages={pages}
          onSave={saveOrder}
          onDelete={deletePage}
          onClose={() => setModal(null)}
        />
      )}
    </EditCtx.Provider>
  );
}
