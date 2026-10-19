"use client";
import { useLayoutEffect, useRef, useState } from "react";

const noFocusSteal = (e: React.PointerEvent) => e.preventDefault();

/** Ô ảnh trống: dấu + để thêm ảnh */
export function AddPhoto({
  busy,
  onClick,
}: {
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="Thêm ảnh"
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
        border: 0,
        background: "transparent",
        color: "#ffffffa0",
        cursor: busy ? "wait" : "pointer",
      }}
    >
      <span style={{ textAlign: "center", lineHeight: 1 }}>
        <span
          style={{
            display: "block",
            fontSize: "max(22cqw, 30px)",
            fontWeight: 200,
          }}
        >
          {busy ? "…" : "+"}
        </span>
        <span className="font-hand" style={{ fontSize: "max(5cqw, 11px)" }}>
          {busy ? "đang tải ảnh" : "thêm ảnh"}
        </span>
      </span>
    </button>
  );
}

/** Nút đổi / xoá ảnh khi đã có ảnh */
export function PhotoTools({
  busy,
  onReplace,
  onClear,
}: {
  busy: boolean;
  onReplace: () => void;
  onClear: () => void;
}) {
  const b: React.CSSProperties = {
    width: "max(8cqw, 26px)",
    height: "max(8cqw, 26px)",
    borderRadius: "50%",
    border: 0,
    background: "rgba(0,0,0,.6)",
    color: "#fff",
    fontSize: "max(4.6cqw, 13px)",
    lineHeight: 1,
    cursor: "pointer",
  };
  return (
    <div
      style={{
        position: "absolute",
        top: "2cqw",
        right: "2cqw",
        display: "flex",
        gap: "1.5cqw",
        zIndex: 3,
      }}
    >
      <button
        type="button"
        style={b}
        title="Đổi ảnh"
        disabled={busy}
        onClick={onReplace}
      >
        {busy ? "…" : "↻"}
      </button>
      <button
        type="button"
        style={b}
        title="Xoá ảnh"
        onClick={() => confirm("Xoá ảnh này?") && onClear()}
      >
        ✕
      </button>
    </div>
  );
}

/** Phụ đề: chưa có thì hiện "+ phụ đề" mờ như placeholder; bấm vào mới hiện ô nhập.
 *  Màu / bộ đếm / xoá nằm ở thanh công cụ nổi (EditView) để không bị tắt khi cập nhật. */
export function CaptionEditor(props: {
  text: string;
  color: string;
  align: "left" | "center" | "right";
  fontSize: number;
  maxLen: number;
  onText: (t: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const { text, color, align, fontSize, maxLen, onText, onFocus, onBlur } =
    props;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const active = open || text.length > 0;

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [text, active, fontSize]);

  if (!active)
    return (
      <button type="button" className="edit-chip" onClick={() => setOpen(true)}>
        ＋ phụ đề
      </button>
    );

  return (
    <div data-cap-editor>
      <textarea
        ref={ref}
        rows={1}
        autoFocus={open && !text}
        value={text}
        maxLength={maxLen}
        placeholder="phụ đề…"
        onChange={(e) => onText(e.target.value)}
        onFocus={onFocus}
        onBlur={() => {
          if (!text) setOpen(false);
          onBlur();
        }}
        style={{
          width: "100%",
          display: "block",
          background: "rgba(0,0,0,.18)",
          border: "1px dashed #ffffff40",
          color,
          fontFamily: "inherit",
          fontSize: `${fontSize}cqw`,
          lineHeight: 1.15,
          textAlign: align,
          resize: "none",
          overflow: "hidden",
          padding: "0.5cqw 1cqw",
          outline: "none",
          borderRadius: 4,
        }}
      />
    </div>
  );
}

/** Ngày trên viền trắng dày: chưa có thì hiện "+ ngày" mờ */
export function DateEditor({
  value,
  small,
  onChange,
}: {
  value: string;
  small?: boolean;
  onChange: (d: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const iso = value ? value.split("/").reverse().join("-") : "";
  const open = () => {
    try {
      ref.current?.showPicker();
    } catch {
      ref.current?.click();
    }
  };
  const size = small ? 3.4 : 6.2;
  return (
    <span
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: small ? "1cqw" : "4cqw",
        textAlign: "center",
        zIndex: 2,
        whiteSpace: "nowrap",
      }}
    >
      <button
        type="button"
        onClick={open}
        className="font-hand"
        style={{
          border: value ? "0" : "1px dashed #cfcabd",
          background: "transparent",
          color: value ? "#222" : "#b3aea2",
          fontSize: value ? `${size}cqw` : `max(${size * 0.72}cqw, 10px)`,
          lineHeight: 1,
          padding: value ? 0 : "0.8cqw 2cqw",
          borderRadius: 99,
          cursor: "pointer",
          verticalAlign: "middle",
        }}
      >
        {value || "＋ ngày"}
      </button>
      {value && (
        <button
          type="button"
          title="Xoá ngày"
          aria-label="Xoá ngày"
          onClick={() => onChange("")}
          onPointerDown={noFocusSteal}
          style={{
            marginLeft: 6,
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: 0,
            background: "rgba(0,0,0,.1)",
            color: "#444",
            fontSize: 17,
            lineHeight: "26px",
            cursor: "pointer",
            verticalAlign: "middle",
            padding: 0,
          }}
        >
          ×
        </button>
      )}
      <input
        ref={ref}
        type="date"
        tabIndex={-1}
        value={iso}
        min="1990-01-01"
        onChange={(e) =>
          onChange(
            e.target.value ? e.target.value.split("-").reverse().join("/") : "",
          )
        }
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </span>
  );
}
