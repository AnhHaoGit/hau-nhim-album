import type { Metadata, Viewport } from "next";
import { Patrick_Hand, Dancing_Script, Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Stickers from "@/components/Stickers";

const hand = Patrick_Hand({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-hand",
});
const script = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  variable: "--font-script",
});
const ui = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "haunhim’s album",
  description: "Album ảnh của chúng mình",
};

// maximumScale: tránh iPhone tự phóng to khi bấm vào ô nhập phụ đề
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${hand.variable} ${script.variable} ${ui.variable}`}
    >
      <body>
        {/* .app-root tự xoay ngang 90° trên điện thoại đang cầm dọc (xem globals.css) */}
        <div className="app-root">
          <Stickers />
          <Navbar />
          <main className="stage">{children}</main>
        </div>
      </body>
    </html>
  );
}
