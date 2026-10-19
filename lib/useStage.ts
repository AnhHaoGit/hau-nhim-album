"use client";
import { useEffect, useState } from "react";

// Phải khớp với media query trong globals.css (.app-root xoay 90° trên điện thoại đang cầm dọc)
const ROTATE_QUERY =
  "(orientation: portrait) and (max-width: 820px) and (pointer: coarse)";

export type Stage = { w: number; h: number; rotated: boolean };

/** Kích thước "logic" của màn hình. Khi giao diện bị xoay ngang, chiều rộng và cao được đổi chỗ. */
export function useStage(): Stage | null {
  const [s, setS] = useState<Stage | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(ROTATE_QUERY);
    const calc = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      setS(
        mq.matches ? { w: h, h: w, rotated: true } : { w, h, rotated: false },
      );
    };
    calc();
    window.addEventListener("resize", calc);
    mq.addEventListener("change", calc);
    return () => {
      window.removeEventListener("resize", calc);
      mq.removeEventListener("change", calc);
    };
  }, []);
  return s;
}
