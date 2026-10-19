// Dữ liệu 8 layout. Toạ độ tính theo % của trang (x,w: % chiều rộng; y: % chiều cao).
// Thiết kế cho TRANG PHẢI (gáy bên trái); trang trái sẽ tự lật gương vị trí.
// Tỉ lệ trang = 3:4 (rộng:cao)

export type Align = "left" | "center" | "right";
export type DoodleKind =
  | "heart"
  | "hearts"
  | "star"
  | "sparkle"
  | "squiggle"
  | "zigzag"
  | "dots"
  | "arrow"
  | "loop"
  | "moon"
  | "flower"
  | "underline"
  | "sunheart";
export type ScrapBg = "kraft" | "cream" | "pink" | "newsprint";
export type TapeColor = "pink" | "beige" | "kraft" | "white";

export type Slot = {
  x: number;
  y: number;
  w: number; // khung polaroid
  ratio: number; // tỉ lệ rộng/cao của phần ảnh (không tính viền)
  bare?: boolean; // true: khung mỏng cho ảnh đã có sẵn viền (dải photobooth)
  rot: number;
  cap: { x: number; y: number; w: number; rot: number; align: Align }; // vị trí phụ đề
};

export type Deco =
  | {
      t: "doodle";
      k: DoodleKind;
      x: number;
      y: number;
      w: number;
      rot?: number;
      z?: number;
    }
  | {
      t: "scrap";
      text: string;
      bg: ScrapBg;
      x: number;
      y: number;
      w: number;
      rot?: number;
      fs?: number;
      tape?: TapeColor;
      shape?: 0 | 1;
      z?: number;
    }
  | {
      t: "tape";
      c: TapeColor;
      x: number;
      y: number;
      w: number;
      rot?: number;
      z?: number;
    }
  | {
      t: "chalk";
      text: string;
      x: number;
      y: number;
      w: number;
      rot?: number;
      fs?: number;
      z?: number;
    };

export type Layout = { id: string; name: string; slots: Slot[]; deco: Deco[] };

// Độ dày viền tính theo % chiều rộng khung: polaroid thường 5/5/16, khung mỏng 2/2/6
export const padOf = (bare?: boolean) =>
  bare ? { l: 0.02, t: 0.02, b: 0.06 } : { l: 0.05, t: 0.05, b: 0.16 };
export const innerH = (w: number, ratio: number, bare?: boolean) =>
  ((1 - 2 * padOf(bare).l) * w) / ratio;
// Chiều cao khung (tính theo % chiều cao trang)
export const frameHeight = (w: number, ratio: number, bare?: boolean) => {
  const p = padOf(bare);
  return (innerH(w, ratio, bare) + (p.t + p.b) * w) / (4 / 3);
};

const P = 3 / 4,
  L = 4 / 3,
  S = 1;

export const LAYOUTS: Layout[] = [
  {
    id: "single-portrait",
    name: "Một ảnh dọc",
    slots: [
      {
        x: 18,
        y: 7,
        w: 68,
        ratio: P,
        rot: -1.5,
        cap: { x: 16, y: 82, w: 70, rot: -1, align: "center" },
      },
    ],
    deco: [
      { t: "tape", c: "pink", x: 42, y: 4.5, w: 22, rot: -4, z: 3 },
      { t: "doodle", k: "heart", x: 11, y: 9, w: 9, rot: -12 },
      { t: "doodle", k: "sparkle", x: 86, y: 9, w: 7, rot: 10 },
      {
        t: "scrap",
        text: "you are my favorite person",
        bg: "kraft",
        x: 66,
        y: 62,
        w: 27,
        rot: 5,
        fs: 4.2,
        tape: "pink",
        z: 4,
      },
      { t: "doodle", k: "squiggle", x: 14, y: 93, w: 26 },
      { t: "doodle", k: "star", x: 80, y: 92, w: 7, rot: 12 },
    ],
  },
  {
    id: "single-landscape",
    name: "Một ảnh ngang",
    slots: [
      {
        x: 11,
        y: 14,
        w: 80,
        ratio: L,
        rot: 2,
        cap: { x: 14, y: 71, w: 72, rot: 1, align: "center" },
      },
    ],
    deco: [
      { t: "tape", c: "beige", x: 6, y: 11.5, w: 18, rot: -38, z: 3 },
      { t: "tape", c: "kraft", x: 77, y: 60, w: 18, rot: -38, z: 3 },
      { t: "doodle", k: "star", x: 84, y: 5, w: 8, rot: 10 },
      { t: "doodle", k: "arrow", x: 12, y: 4, w: 14, rot: -5 },
      {
        t: "scrap",
        text: "to the moon and back",
        bg: "cream",
        x: 14,
        y: 84,
        w: 42,
        rot: -3,
        fs: 4.6,
        shape: 1,
      },
      { t: "doodle", k: "moon", x: 64, y: 84, w: 11, rot: 8 },
      { t: "doodle", k: "heart", x: 80, y: 90, w: 8, rot: -8 },
    ],
  },
  {
    id: "duo-stagger",
    name: "Hai ảnh so le",
    slots: [
      {
        x: 10,
        y: 4,
        w: 48,
        ratio: P,
        rot: -3,
        cap: { x: 61, y: 8, w: 33, rot: -4, align: "left" },
      },
      {
        x: 44,
        y: 42,
        w: 48,
        ratio: P,
        rot: 2.5,
        cap: { x: 9, y: 64, w: 32, rot: 2, align: "right" },
      },
    ],
    deco: [
      { t: "tape", c: "beige", x: 24, y: 2, w: 20, rot: -3, z: 3 },
      { t: "tape", c: "pink", x: 60, y: 39, w: 18, rot: 4, z: 3 },
      { t: "doodle", k: "zigzag", x: 60, y: 30, w: 28, rot: 6 },
      { t: "doodle", k: "heart", x: 86, y: 19, w: 6, rot: 12 },
      { t: "doodle", k: "star", x: 14, y: 56, w: 7, rot: -8 },
      {
        t: "scrap",
        text: "forever",
        bg: "pink",
        x: 10,
        y: 80,
        w: 28,
        rot: -5,
        fs: 6,
        tape: "kraft",
      },
    ],
  },
  {
    id: "trio-casual",
    name: "Ba ảnh",
    slots: [
      {
        x: 12,
        y: 4,
        w: 60,
        ratio: L,
        rot: -2,
        cap: { x: 74, y: 8, w: 21, rot: 5, align: "left" },
      },
      {
        x: 9,
        y: 49,
        w: 40,
        ratio: P,
        rot: 2,
        cap: { x: 9, y: 92, w: 40, rot: 0, align: "center" },
      },
      {
        x: 52,
        y: 47,
        w: 40,
        ratio: P,
        rot: -2,
        cap: { x: 52, y: 91, w: 40, rot: 0, align: "center" },
      },
    ],
    deco: [
      { t: "tape", c: "pink", x: 30, y: 2, w: 18, rot: -3, z: 3 },
      { t: "tape", c: "beige", x: 20, y: 46, w: 16, rot: -20, z: 3 },
      { t: "tape", c: "kraft", x: 62, y: 44, w: 16, rot: 15, z: 3 },
      {
        t: "scrap",
        text: "i love you",
        bg: "newsprint",
        x: 74,
        y: 30,
        w: 20,
        rot: -6,
        fs: 4.4,
        shape: 1,
      },
      { t: "doodle", k: "heart", x: 80, y: 22, w: 7, rot: 10 },
      { t: "doodle", k: "star", x: 84, y: 38, w: 6, rot: 12 },
      { t: "doodle", k: "sparkle", x: 47, y: 42, w: 6 },
    ],
  },
  {
    id: "quad-grid",
    name: "Bốn ảnh vuông",
    slots: [
      {
        x: 11,
        y: 4,
        w: 40,
        ratio: S,
        rot: -3,
        cap: { x: 12, y: 38.5, w: 38, rot: -2, align: "center" },
      },
      {
        x: 53,
        y: 7,
        w: 40,
        ratio: S,
        rot: 3,
        cap: { x: 55, y: 41.5, w: 37, rot: 2, align: "center" },
      },
      {
        x: 10,
        y: 47,
        w: 40,
        ratio: S,
        rot: 2,
        cap: { x: 11, y: 81.5, w: 38, rot: 2, align: "center" },
      },
      {
        x: 54,
        y: 50,
        w: 40,
        ratio: S,
        rot: -2.5,
        cap: { x: 55, y: 84.5, w: 37, rot: -2, align: "center" },
      },
    ],
    deco: [
      { t: "tape", c: "pink", x: 24, y: 2, w: 16, rot: -4, z: 3 },
      { t: "tape", c: "beige", x: 66, y: 5, w: 16, rot: 5, z: 3 },
      { t: "tape", c: "kraft", x: 22, y: 45, w: 16, rot: 3, z: 3 },
      { t: "tape", c: "pink", x: 66, y: 48, w: 16, rot: -4, z: 3 },
      { t: "doodle", k: "heart", x: 46, y: 41, w: 7, rot: 8 },
      { t: "doodle", k: "star", x: 84, y: 1, w: 7, rot: 12 },
      {
        t: "scrap",
        text: "our little moments",
        bg: "kraft",
        x: 28,
        y: 92,
        w: 44,
        rot: -2,
        fs: 4.2,
      },
      { t: "doodle", k: "sparkle", x: 10, y: 92, w: 7 },
      { t: "doodle", k: "squiggle", x: 76, y: 94, w: 18 },
    ],
  },
  {
    id: "booth-3",
    name: "Ba ảnh ngang (photobooth)",
    slots: [
      {
        x: 12,
        y: 3,
        w: 46,
        ratio: L,
        rot: -2,
        cap: { x: 61, y: 8, w: 33, rot: 4, align: "left" },
      },
      {
        x: 44,
        y: 34,
        w: 46,
        ratio: L,
        rot: 2.5,
        cap: { x: 9, y: 42, w: 32, rot: -3, align: "right" },
      },
      {
        x: 13,
        y: 65,
        w: 46,
        ratio: L,
        rot: -1.5,
        cap: { x: 62, y: 72, w: 32, rot: 3, align: "left" },
      },
    ],
    deco: [
      { t: "tape", c: "kraft", x: 40, y: 32.5, w: 14, rot: -25, z: 3 },
      { t: "tape", c: "pink", x: 56, y: 63.5, w: 14, rot: 20, z: 3 },
      { t: "doodle", k: "heart", x: 82, y: 24, w: 7, rot: 10 },
      { t: "doodle", k: "dots", x: 62, y: 29, w: 26 },
      { t: "doodle", k: "star", x: 14, y: 55, w: 7, rot: -8 },
      {
        t: "scrap",
        text: "photobooth day",
        bg: "cream",
        x: 62,
        y: 86,
        w: 30,
        rot: -3,
        fs: 4.4,
        tape: "beige",
        shape: 1,
      },
    ],
  },
  {
    id: "big-small",
    name: "Một lớn một nhỏ",
    slots: [
      {
        x: 30,
        y: 4,
        w: 62,
        ratio: P,
        rot: 1.5,
        cap: { x: 10, y: 9, w: 19, rot: -5, align: "left" },
      },
      {
        x: 10,
        y: 63,
        w: 34,
        ratio: S,
        rot: -3,
        cap: { x: 47, y: 78, w: 46, rot: 2, align: "left" },
      },
    ],
    deco: [
      { t: "tape", c: "pink", x: 52, y: 1, w: 20, rot: -2, z: 3 },
      { t: "tape", c: "kraft", x: 15, y: 61, w: 14, rot: -20, z: 3 },
      {
        t: "scrap",
        text: "my favorite person",
        bg: "pink",
        x: 10,
        y: 38,
        w: 20,
        rot: -6,
        fs: 4,
      },
      { t: "doodle", k: "heart", x: 13, y: 51, w: 8, rot: -10 },
      { t: "chalk", text: "forever", x: 48, y: 92, w: 40, fs: 6, rot: -2 },
      { t: "doodle", k: "moon", x: 14, y: 93, w: 6 },
      { t: "doodle", k: "sparkle", x: 84, y: 72, w: 7 },
      { t: "doodle", k: "squiggle", x: 48, y: 72, w: 22 },
    ],
  },
  {
    id: "duo-landscape",
    name: "Hai ảnh ngang",
    slots: [
      {
        x: 10,
        y: 4,
        w: 60,
        ratio: L,
        rot: -2.5,
        cap: { x: 72, y: 9, w: 23, rot: 5, align: "left" },
      },
      {
        x: 30,
        y: 48,
        w: 60,
        ratio: L,
        rot: 2,
        cap: { x: 9, y: 58, w: 19, rot: -4, align: "left" },
      },
    ],
    deco: [
      { t: "tape", c: "pink", x: 28, y: 2, w: 18, rot: -3, z: 3 },
      { t: "tape", c: "beige", x: 50, y: 46, w: 18, rot: 3, z: 3 },
      {
        t: "scrap",
        text: "you & me",
        bg: "kraft",
        x: 72,
        y: 30,
        w: 22,
        rot: 6,
        fs: 5.5,
      },
      { t: "chalk", text: "xoxo", x: 10, y: 91, w: 24, fs: 7, rot: -4 },
      { t: "doodle", k: "squiggle", x: 42, y: 92, w: 26 },
      { t: "doodle", k: "heart", x: 84, y: 90, w: 8, rot: 8 },
      { t: "doodle", k: "star", x: 14, y: 44, w: 6 },
      { t: "doodle", k: "sparkle", x: 78, y: 3, w: 6 },
    ],
  },
  {
    id: "strip-wide",
    name: "Hai dải ảnh ngang",
    slots: [
      {
        x: 10,
        y: 8,
        w: 84,
        ratio: 3,
        bare: true,
        rot: -2,
        cap: { x: 12, y: 35.5, w: 78, rot: -1, align: "center" },
      },
      {
        x: 10,
        y: 48,
        w: 84,
        ratio: 3,
        bare: true,
        rot: 1.8,
        cap: { x: 12, y: 75.5, w: 78, rot: 1, align: "center" },
      },
    ],
    deco: [
      { t: "tape", c: "pink", x: 38, y: 5.5, w: 20, rot: -3, z: 3 },
      { t: "tape", c: "beige", x: 40, y: 45.5, w: 20, rot: 2, z: 3 },
      {
        t: "scrap",
        text: "4 shots, 1 memory",
        bg: "kraft",
        x: 14,
        y: 87,
        w: 34,
        rot: -3,
        fs: 4.6,
      },
      { t: "doodle", k: "hearts", x: 56, y: 87, w: 14, rot: 6 },
      { t: "doodle", k: "star", x: 74, y: 88, w: 7, rot: 10 },
      { t: "doodle", k: "squiggle", x: 74, y: 94, w: 18 },
      { t: "doodle", k: "sparkle", x: 86, y: 3, w: 6 },
    ],
  },
  {
    id: "strip-tall",
    name: "Hai dải ảnh dọc",
    slots: [
      {
        x: 12,
        y: 4,
        w: 38,
        ratio: 1 / 3,
        bare: true,
        rot: -1.5,
        cap: { x: 11, y: 89.5, w: 40, rot: -1, align: "center" },
      },
      {
        x: 54,
        y: 5,
        w: 38,
        ratio: 1 / 3,
        bare: true,
        rot: 1.5,
        cap: { x: 53, y: 90.5, w: 40, rot: 1, align: "center" },
      },
    ],
    deco: [
      { t: "tape", c: "pink", x: 23, y: 2, w: 14, rot: -3, z: 3 },
      { t: "tape", c: "beige", x: 65, y: 3, w: 14, rot: 4, z: 3 },
      { t: "doodle", k: "heart", x: 47, y: 40, w: 7, rot: 10 },
      { t: "doodle", k: "sparkle", x: 50, y: 78, w: 5 },
    ],
  },
];

export const LAYOUT_MAP: Record<string, Layout> = Object.fromEntries(
  LAYOUTS.map((l) => [l.id, l]),
);
