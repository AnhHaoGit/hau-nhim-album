import type { Metadata } from "next";
import { Patrick_Hand, Dancing_Script, Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Stickers from "@/components/Stickers";

// Chữ viết tay (có hỗ trợ tiếng Việt) – dùng cho phụ đề/date trong album
const hand = Patrick_Hand({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-hand",
});
// Chữ viết tay bay bổng – dùng cho logo / tiêu đề
const script = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  variable: "--font-script",
});
// Chữ UI mềm – dùng cho modal mật khẩu, nút bấm
const ui = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "haunhim’s album",
  description: "Album ảnh của chúng mình",
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
        {/* <Stickers /> */}
        <Navbar />
        <main className="stage">{children}</main>
      </body>
    </html>
  );
}
