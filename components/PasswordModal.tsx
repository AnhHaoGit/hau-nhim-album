"use client";
import { useState } from "react";

export default function PasswordModal({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) onSuccess();
    else {
      setErr("Sai mật khẩu rồi nha 🥲");
      setPw("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#5b4640]/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl bg-[#fbf1ec] p-7 shadow-2xl"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        <h2 className="font-script text-3xl" style={{ color: "var(--ink)" }}>
          Khu vực chỉnh sửa
        </h2>
        <p className="mt-1 text-sm opacity-70">Nhập mật khẩu để tiếp tục</p>
        <input
          autoFocus
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Mật khẩu"
          className="mt-5 w-full rounded-xl border border-[#d98c86]/50 bg-white px-4 py-3 outline-none focus:border-[#d98c86]"
        />
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-white/70 py-2.5 font-semibold"
          >
            Quay lại
          </button>
          <button
            disabled={loading || !pw}
            className="flex-1 rounded-xl py-2.5 font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Đang kiểm tra…" : "Vào"}
          </button>
        </div>
      </form>
    </div>
  );
}
