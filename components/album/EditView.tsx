"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PageDTO, PhotoDTO } from "@/lib/types";
import { uploadImage } from "@/lib/uploadClient";
import LayoutPage, { type EditApi } from "./LayoutPage";
import { AddPageModal, ReorderModal } from "./Modals";

const Album = dynamic(() => import("./Album"), { ssr: false });

const DEFAULT_COLOR = "#f4f1ea";
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
const json = { "Content-Type": "application/json" };

export default function EditView() {
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [modal, setModal] = useState<"add" | "order" | null>(null);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [err, setErr] = useState("");
  const [jump, setJump] = useState<
    { page: number; nonce: number } | undefined
  >();

  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const target = useRef<{ pageId: string; slot: number } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/pages", { cache: "no-store" });
    if (r.ok) setPages(await r.json());
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function flush(pageId: string) {
    const page = pagesRef.current.find((p) => p._id === pageId);
    if (!page) return;
    setStatus("saving");
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

  // sửa 1 slot (ảnh/phụ đề/màu/ngày) rồi tự lưu sau `delay` ms
  function patch(
    pageId: string,
    slot: number,
    change: Partial<PhotoDTO>,
    delay: number,
  ) {
    setPages((prev) =>
      prev.map((p) => {
        if (p._id !== pageId) return p;
        const photos = [...p.photos];
        const i = photos.findIndex((x) => x.slot === slot);
        const next = { ...(i >= 0 ? photos[i] : emptyPhoto(slot)), ...change };
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
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const t = target.current;
    if (!file || !t) return;
    const key = `${t.pageId}:${t.slot}`;
    setBusy((s) => new Set(s).add(key));
    try {
      const img = await uploadImage(file);
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

  const nodes = pages.map((p, i) => {
    const api: EditApi = {
      busy: (s) => busy.has(`${p._id}:${s}`),
      pickPhoto: (s) => {
        target.current = { pageId: p._id, slot: s };
        fileRef.current?.click();
      },
      clearPhoto: (s) =>
        patch(p._id, s, { url: "", fileId: "", width: 0, height: 0 }, 60),
      setCaption: (s, t) => patch(p._id, s, { caption: t }, 700),
      setColor: (s, c) => patch(p._id, s, { captionColor: c }, 500),
      setDate: (s, d) => patch(p._id, s, { date: d }, 200),
    };
    return (
      <LayoutPage key={p._id} page={p} mirror={(i + 1) % 2 === 1} edit={api} />
    );
  });

  return (
    <>
      <Album pages={nodes} flipByMouse={false} jumpTo={jump} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
      />

      <div
        className="fixed bottom-4 right-4 z-20 flex flex-col items-end gap-2"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs backdrop-blur">
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
          className="rounded-full px-5 py-2.5 font-semibold text-white shadow-lg"
          style={{ background: "var(--accent)" }}
        >
          ＋ Thêm trang
        </button>
        <button
          onClick={() => setModal("order")}
          className="rounded-full bg-white/80 px-5 py-2.5 font-semibold shadow-lg"
        >
          ⇅ Sắp xếp trang
        </button>
      </div>

      {err && (
        <div
          className="fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-xl bg-red-500 px-4 py-2 text-sm text-white shadow-lg"
          onClick={() => setErr("")}
        >
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
    </>
  );
}
