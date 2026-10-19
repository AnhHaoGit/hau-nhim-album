"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordModal from "./PasswordModal";

export default function EditGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "locked" | "ok">("loading");

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => setState(d.authed ? "ok" : "locked"));
  }, []);

  if (state === "loading") return null;
  if (state === "locked")
    return (
      <PasswordModal
        onSuccess={() => setState("ok")}
        onCancel={() => router.push("/")}
      />
    );
  return <>{children}</>;
}
