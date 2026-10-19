"use client";
import { useLayoutEffect, useRef, useState } from "react";

export const MAX_WORDS = 60;
const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

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
        <span style={{ display: "block", fontSize: "22cqw", fontWeight: 200 }}>
          {busy ? "…" : "+"}
        </span>
        <span className="font-hand" style={{ fontSize: "5cqw" }}>
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
    width: "8cqw",
    height: "8cqw",
    borderRadius: "50%",
    border: 0,
    background: "rgba(0,0,0,.6)",
    color: "#fff",
    fontSize: "4.6cqw",
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

/** Phụ đề: chưa có thì hiện dấu +, bấm vào mới hiện ô nhập */
export function CaptionEditor(props: {
  text: string;
  color: string;
  align: "left" | "center" | "right";
  fontSize: number;
  onText: (t: string) => void;
  onColor: (c: string) => void;
}) {
  const { text, color, align, fontSize, onText, onColor } = props;
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
    <div className="cap-ed" style={{ position: "relative" }}>
      <textarea
        ref={ref}
        rows={1}
        autoFocus={open && !text}
        value={text}
        placeholder="phụ đề…"
        onChange={(e) =>
          words(e.target.value) <= MAX_WORDS && onText(e.target.value)
        }
        onBlur={() => !text && setOpen(false)}
        style={{
          width: "100%",
          display: "block",
          background: "rgba(0,0,0,.18)",
          border: "1px dashed #ffffff55",
          color,
          fontFamily: "inherit",
          fontSize: `${fontSize}cqw`,
          lineHeight: 1.15,
          textAlign: align,
          resize: "none",
          overflow: "hidden",
          padding: "0.6cqw 1cqw",
          outline: "none",
          borderRadius: 4,
        }}
      />
      <div
        className="cap-ctl"
        style={{
          position: "absolute",
          top: "100%",
          right: 0,
          display: "flex",
          alignItems: "center",
          gap: "1.5cqw",
          marginTop: "1cqw",
          zIndex: 7,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "2.8cqw",
            color: "#fff",
            background: "rgba(0,0,0,.55)",
            borderRadius: 99,
            padding: "0 1.6cqw",
          }}
        >
          {words(text)}/{MAX_WORDS}
        </span>
        <input
          type="color"
          value={color}
          title="Màu chữ"
          onChange={(e) => onColor(e.target.value)}
          style={{
            width: "6cqw",
            height: "6cqw",
            padding: 0,
            border: "2px solid #fff",
            borderRadius: "50%",
            background: "none",
            cursor: "pointer",
          }}
        />
        <button
          type="button"
          title="Xoá phụ đề"
          onClick={() => {
            onText("");
            setOpen(false);
          }}
          style={{
            width: "6cqw",
            height: "6cqw",
            borderRadius: "50%",
            border: 0,
            background: "rgba(0,0,0,.6)",
            color: "#fff",
            fontSize: "3.4cqw",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/** Ngày trên viền trắng dày: chưa có thì hiện "+ ngày" */
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
        bottom: small ? "1cqw" : "4.5cqw",
        textAlign: "center",
        zIndex: 2,
      }}
    >
      <button
        type="button"
        onClick={open}
        className="font-hand"
        style={{
          border: value ? "0" : "1px dashed #aaa",
          background: "transparent",
          color: value ? "#222" : "#999",
          fontSize: `${value ? size : size * 0.75}cqw`,
          lineHeight: 1,
          padding: value ? 0 : "0.8cqw 2cqw",
          borderRadius: 99,
          cursor: "pointer",
        }}
      >
        {value || "＋ ngày"}
      </button>
      {value && (
        <button
          type="button"
          title="Xoá ngày"
          onClick={() => onChange("")}
          style={{
            marginLeft: "1.5cqw",
            border: 0,
            background: "transparent",
            color: "#999",
            fontSize: `${size * 0.8}cqw`,
            cursor: "pointer",
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
