"use client";
import { useState } from "react";
import { LAYOUTS, LAYOUT_MAP } from "@/lib/layouts";
import type { PageDTO } from "@/lib/types";
import LayoutPreview from "./LayoutPreview";

function Shell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#5b4640]/45 p-3 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#fbf1ec] shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-4 sm:px-6 sm:pt-5">
          <h2 className="font-script text-3xl" style={{ color: "var(--ink)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white/70 text-lg"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-[#eadbd3] px-5 py-4 sm:px-6 sm:pb-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Chọn layout cho trang mới – hiện hình thu nhỏ thay vì chữ */
export function AddPageModal({
  onPick,
  onClose,
}: {
  onPick: (layoutId: string) => void;
  onClose: () => void;
}) {
  return (
    <Shell title="Chọn kiểu trang" onClose={onClose}>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            onClick={() => onPick(l.id)}
            aria-label={l.name}
            className="rounded-lg p-1.5 ring-2 ring-transparent transition hover:scale-105 hover:ring-[#d98c86]"
          >
            <LayoutPreview layout={l} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

/** Sắp xếp (kéo thả hoặc nút ◀ ▶) + xoá trang */
export function ReorderModal({
  pages,
  onSave,
  onDelete,
  onClose,
}: {
  pages: PageDTO[];
  onSave: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [list, setList] = useState(pages);
  const [drag, setDrag] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const n = [...list];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    setList(n);
  };
  const changed = list.some((p, i) => p._id !== pages[i]?._id);

  return (
    <Shell
      title="Sắp xếp trang"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/70 px-5 py-2 font-semibold"
          >
            Đóng
          </button>
          <button
            disabled={!changed || saving}
            className="rounded-xl px-5 py-2 font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--accent)" }}
            onClick={async () => {
              setSaving(true);
              await onSave(list.map((p) => p._id));
              setSaving(false);
              onClose();
            }}
          >
            {saving ? "Đang lưu…" : "Lưu thứ tự"}
          </button>
        </>
      }
    >
      {list.length === 0 && (
        <p className="py-8 text-center opacity-60">Chưa có trang nào</p>
      )}
      <p className="mb-3 text-sm opacity-70">
        Kéo thả để đổi chỗ, hoặc dùng nút ◀ ▶. Trang 1 là trang đầu tiên sau
        bìa.
      </p>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {list.map((p, i) => (
          <div
            key={p._id}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag !== null) move(drag, i);
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
            className="cursor-grab rounded-lg bg-white/50 p-1.5"
            style={{ opacity: drag === i ? 0.4 : 1 }}
          >
            <LayoutPreview
              layout={LAYOUT_MAP[p.layout] ?? LAYOUTS[0]}
              photos={p.photos}
            />
            <div className="mt-1.5 flex items-center justify-between text-sm">
              <button
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                className="px-1.5 disabled:opacity-25"
                aria-label="Lên trước"
              >
                ◀
              </button>
              <span className="font-semibold">{i + 1}</span>
              <button
                onClick={() => move(i, i + 1)}
                disabled={i === list.length - 1}
                className="px-1.5 disabled:opacity-25"
                aria-label="Xuống sau"
              >
                ▶
              </button>
            </div>
            <button
              className="mt-1 w-full rounded-md py-0.5 text-xs text-red-500 hover:bg-red-50"
              onClick={async () => {
                if (
                  !confirm(`Xoá trang ${i + 1} và toàn bộ ảnh trong trang này?`)
                )
                  return;
                await onDelete(p._id);
                setList((l) => l.filter((x) => x._id !== p._id));
              }}
            >
              Xoá
            </button>
          </div>
        ))}
      </div>
    </Shell>
  );
}
