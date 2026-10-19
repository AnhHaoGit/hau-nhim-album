"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { CoverDTO, PageDTO } from "@/lib/types";
import CoverPage from "./CoverPage";
import LayoutPage from "./LayoutPage";

const Album = dynamic(() => import("./Album"), { ssr: false });

export default function AlbumView() {
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [cover, setCover] = useState<CoverDTO | null>(null);

  useEffect(() => {
    fetch("/api/pages", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setPages);
    fetch("/api/cover", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setCover);
  }, []);

  // trang trong có index lẻ (1,3,5…) là trang TRÁI -> lật gương vị trí
  const nodes = useMemo(
    () =>
      pages.map((p, i) => (
        <LayoutPage key={p._id} page={p} mirror={(i + 1) % 2 === 1} />
      )),
    [pages],
  );
  const front = useMemo(() => <CoverPage photo={cover} />, [cover]);
  return <Album pages={nodes} frontCover={front} />;
}
