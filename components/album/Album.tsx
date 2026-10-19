"use client";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import HTMLFlipBook from "react-pageflip";

// react-pageflip khai báo type bắt buộc quá nhiều prop -> ép kiểu cho gọn
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlipBook = HTMLFlipBook as unknown as ComponentType<any>;

/* ---------- Một trang giấy đen scrapbook ---------- */
export const PageShell = forwardRef<
  HTMLDivElement,
  { index: number; hard?: boolean; children?: ReactNode }
>(function PageShell({ index, hard, children }, ref) {
  const left = index % 2 === 1; // 0 = bìa trước (bên phải), 1 = trang trái đầu tiên, ...
  return (
    <div
      ref={ref}
      data-density={hard ? "hard" : "soft"}
      className="album-page"
      style={{ borderRadius: left ? "6px 0 0 6px" : "0 6px 6px 0" }}
    >
      <div className="album-page-inner">{children}</div>
      <div className="album-crease" data-side={left ? "left" : "right"} />
    </div>
  );
});

function Cover({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="font-hand rounded-md border-2 border-dashed border-white/25 px-6 py-10 text-center text-2xl text-white/70">
        {label}
      </div>
    </div>
  );
}

/* ---------- Gáy xoắn đen ---------- */
function Spiral({
  height,
  showLeft,
  showRight,
}: {
  height: number;
  showLeft: boolean;
  showRight: boolean;
}) {
  const count = Math.max(6, Math.floor(height / 36));
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex w-0 flex-col justify-evenly py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative h-[12px]">
          {showLeft && (
            <span
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-black/80"
              style={{ left: -24 }}
            />
          )}
          {showRight && (
            <span
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-black/80"
              style={{ left: 16 }}
            />
          )}
          <span
            className="absolute top-0 h-full w-[56px] -translate-x-1/2 rounded-full"
            style={{
              border: "3px solid #151413",
              boxShadow:
                "0 2px 3px rgba(0,0,0,.5), inset 0 1px 1px rgba(255,255,255,.2)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------- Album ---------- */
type Props = {
  pages?: ReactNode[]; // nội dung các trang bên trong (bước sau sẽ lấy từ Mongo)
  frontCover?: ReactNode;
  backCover?: ReactNode;
  flipByMouse?: boolean; // false ở trang chỉnh sửa để gõ/bấm trong trang không bị lật nhầm
  jumpTo?: { page: number; nonce: number }; // nhảy tới 1 trang (index trong sách, 1 = trang trong đầu tiên)
};

const PAGE_RATIO = 3 / 4; // rộng / cao của MỘT trang

export default function Album({
  pages = [],
  frontCover,
  backCover,
  flipByMouse = true,
  jumpTo,
}: Props) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [page, setPage] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = useRef<any>(null);

  useEffect(() => {
    const calc = () => {
      const spread = Math.min(
        window.innerWidth * 0.92,
        1200,
        (window.innerHeight - 120) * 1.5,
      );
      const w = Math.floor(spread / 2);
      setSize({ w, h: Math.floor(w / PAGE_RATIO) });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const ready = !!size;
  useEffect(() => {
    if (!jumpTo || !ready) return;
    const t = setTimeout(() => {
      try {
        book.current?.pageFlip().turnToPage(jumpTo.page);
      } catch {}
      setPage(jumpTo.page % 2 === 0 ? jumpTo.page - 1 : jumpTo.page);
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo?.nonce, ready]);

  if (!size) return null;

  // tổng số trang phải chẵn (bìa trước + trang trong + bìa sau)
  const inner = pages.length % 2 === 0 ? pages : [...pages, null];
  const total = inner.length + 2;
  const W = size.w * 2;
  const closedFront = page <= 0;
  const closedBack = page >= total - 1;
  const shift = closedFront ? -W / 4 : closedBack ? W / 4 : 0; // khi đóng: dịch ra giữa màn hình

  const label = closedFront
    ? "Bìa trước"
    : closedBack
      ? "Bìa sau"
      : `Trang ${page} – ${page + 1}`;

  return (
    <>
      <div
        style={{
          position: "relative",
          width: W,
          height: size.h,
          transform: `translateX(${shift}px)`,
          transition: "transform .7s cubic-bezier(.4,0,.2,1)",
          filter: "drop-shadow(0 22px 22px rgba(60,30,25,.35))",
        }}
      >
        <FlipBook
          key={`${size.w}-${total}`}
          ref={book}
          width={size.w}
          height={size.h}
          size="fixed"
          minWidth={200}
          maxWidth={2000}
          minHeight={200}
          maxHeight={3000}
          showCover
          usePortrait={false}
          startPage={Math.min(page, total - 1)}
          flippingTime={900}
          maxShadowOpacity={0.55}
          drawShadow
          useMouseEvents={flipByMouse}
          mobileScrollSupport={false}
          onFlip={(e: { data: number }) => setPage(e.data)}
        >
          <PageShell index={0} hard>
            {frontCover ?? <Cover label="Bìa trước – thiết kế sau" />}
          </PageShell>
          {inner.map((p, i) => (
            <PageShell key={i} index={i + 1}>
              {p}
            </PageShell>
          ))}
          <PageShell index={total - 1} hard>
            {backCover ?? <Cover label="Bìa sau – thiết kế sau" />}
          </PageShell>
        </FlipBook>

        <Spiral
          height={size.h}
          showLeft={!closedFront}
          showRight={!closedBack}
        />
      </div>

      {/* điều khiển lật trang */}
      <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur">
        <button
          onClick={() => book.current?.pageFlip().flipPrev()}
          className="h-8 w-8 rounded-full text-lg hover:bg-white/80"
          aria-label="Trang trước"
        >
          ‹
        </button>
        <span className="min-w-[110px] text-center text-sm font-semibold">
          {label}
        </span>
        <button
          onClick={() => book.current?.pageFlip().flipNext()}
          className="h-8 w-8 rounded-full text-lg hover:bg-white/80"
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>
    </>
  );
}
