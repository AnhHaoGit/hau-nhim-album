"use client";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { useStage } from "@/lib/useStage";

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

type Props = {
  pages?: ReactNode[]; // nội dung các trang bên trong
  frontCover?: ReactNode; // bìa trước (có thiết kế)
  backCover?: ReactNode; // bìa sau (mặc định đen trơn)
  flipByMouse?: boolean; // false ở trang chỉnh sửa để gõ/bấm trong trang không bị lật nhầm
  jumpTo?: { page: number; nonce: number };
};

const PAGE_RATIO = 3 / 4; // rộng / cao của MỘT trang

function AlbumImpl({
  pages = [],
  frontCover,
  backCover,
  flipByMouse = true,
  jumpTo,
}: Props) {
  const stage = useStage();
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = useRef<any>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  // Kích thước theo màn hình: màn thấp (điện thoại ngang) thì thu gọn thanh trên và dùng nút lật ở hai bên
  const size = useMemo(() => {
    if (!stage) return null;
    const compact = stage.h < 520;
    const top = compact ? 40 : 76,
      bottom = compact ? 8 : 44,
      side = compact ? 56 : 0;
    const spread = Math.min(
      (stage.w - side * 2) * 0.98,
      1200,
      (stage.h - top - bottom) * 1.5,
    );
    const w = Math.max(120, Math.floor(spread / 2));
    return { w, h: Math.floor(w / PAGE_RATIO), compact };
  }, [stage]);

  const rotated = !!stage?.rotated;
  const useMouse = flipByMouse && !rotated; // khi giao diện bị xoay, toạ độ chuột của thư viện bị sai -> dùng vuốt tự viết
  const inner = useMemo(
    () => (pages.length % 2 === 0 ? pages : [...pages, null]),
    [pages],
  ); // tổng số trang phải chẵn
  const total = inner.length + 2;

  const onFlip = useCallback((e: { data: number }) => {
    pageRef.current = e.data;
    setPage(e.data);
  }, []);

  // QUAN TRỌNG: element FlipBook được memo hoá. react-pageflip dựng lại toàn bộ DOM mỗi khi children đổi,
  // làm ô nhập mất focus sau mỗi ký tự. Giữ nguyên element thì chỉ nội dung bên trong tự cập nhật (qua context).
  const bookEl = useMemo(
    () =>
      size ? (
        <FlipBook
          key={`${size.w}-${total}-${rotated}`}
          ref={book}
          width={size.w}
          height={size.h}
          size="fixed"
          minWidth={100}
          maxWidth={2000}
          minHeight={100}
          maxHeight={3000}
          showCover
          usePortrait={false}
          startPage={Math.min(pageRef.current, total - 1)}
          flippingTime={900}
          maxShadowOpacity={0.55}
          drawShadow
          useMouseEvents={useMouse}
          mobileScrollSupport={false}
          onFlip={onFlip}
        >
          <PageShell index={0} hard>
            {frontCover}
          </PageShell>
          {inner.map((p, i) => (
            <PageShell key={i} index={i + 1}>
              {p}
            </PageShell>
          ))}
          <PageShell index={total - 1} hard>
            {backCover}
          </PageShell>
        </FlipBook>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      size?.w,
      size?.h,
      total,
      rotated,
      useMouse,
      inner,
      frontCover,
      backCover,
      onFlip,
    ],
  );

  // nhảy tới trang vừa thêm
  const ready = !!size;
  useEffect(() => {
    if (!jumpTo || !ready) return;
    const t = setTimeout(() => {
      try {
        book.current?.pageFlip().turnToPage(jumpTo.page);
      } catch {}
      const left = jumpTo.page % 2 === 0 ? jumpTo.page - 1 : jumpTo.page;
      pageRef.current = left;
      setPage(left);
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo?.nonce, ready]);

  if (!size) return null;

  const W = size.w * 2;
  const closedFront = page <= 0;
  const closedBack = page >= total - 1;
  const shift = closedFront ? -W / 4 : closedBack ? W / 4 : 0; // khi đóng: dịch ra giữa màn hình
  const label = closedFront
    ? "Bìa trước"
    : closedBack
      ? "Bìa sau"
      : `Trang ${page} – ${page + 1}`;
  const prev = () => book.current?.pageFlip().flipPrev();
  const next = () => book.current?.pageFlip().flipNext();

  // vuốt khi giao diện bị xoay: trục "ngang" của giao diện chính là trục dọc của màn hình
  const swipeProps =
    rotated && flipByMouse
      ? {
          onPointerDown: (e: React.PointerEvent) => {
            swipe.current = { x: e.clientX, y: e.clientY };
          },
          onPointerUp: (e: React.PointerEvent) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s) return;
            const dx = e.clientY - s.y,
              dy = e.clientX - s.x;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
              (dx < 0 ? next : prev)();
          },
        }
      : {};

  return (
    <>
      <div
        {...swipeProps}
        style={{
          position: "relative",
          width: W,
          height: size.h,
          transform: `translateX(${shift}px)`,
          transition: "transform .7s cubic-bezier(.4,0,.2,1)",
          filter: "drop-shadow(0 22px 22px rgba(60,30,25,.35))",
          touchAction: rotated && flipByMouse ? "none" : undefined,
        }}
      >
        {bookEl}
        <Spiral
          height={size.h}
          showLeft={!closedFront}
          showRight={!closedBack}
        />
      </div>

      {size.compact ? (
        <>
          <button
            onClick={prev}
            aria-label="Trang trước"
            className="album-arrow"
            style={{ left: 8 }}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Trang sau"
            className="album-arrow"
            style={{ right: 8 }}
          >
            ›
          </button>
        </>
      ) : (
        <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur">
          <button
            onClick={prev}
            className="h-8 w-8 rounded-full text-lg hover:bg-white/80"
            aria-label="Trang trước"
          >
            ‹
          </button>
          <span className="min-w-[110px] text-center text-sm font-semibold">
            {label}
          </span>
          <button
            onClick={next}
            className="h-8 w-8 rounded-full text-lg hover:bg-white/80"
            aria-label="Trang sau"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}

export default memo(AlbumImpl);
