"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { PageDTO } from "@/lib/types";
import LayoutPage from "./LayoutPage";

// Album dùng window -> chỉ render ở client
const Album = dynamic(() => import("./Album"), { ssr: false });

export default function AlbumView() {
  const [pages, setPages] = useState<PageDTO[]>([]);

  const load = useCallback(async () => {
    const r = await fetch("/api/pages", { cache: "no-store" });
    if (r.ok) {
      console.log('Fetched!!')
      setPages(await r.json());
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("album:changed", load); // DevPanel (tạm) báo khi có thay đổi
    return () => window.removeEventListener("album:changed", load);
  }, [load]);

  // trang trong có index lẻ (1,3,5…) là trang TRÁI -> lật gương vị trí
  const nodes = pages.map((p, i) => (
    <LayoutPage key={p._id} page={p} mirror={(i + 1) % 2 === 1} />
  ));
  return <Album pages={nodes} />;
}
