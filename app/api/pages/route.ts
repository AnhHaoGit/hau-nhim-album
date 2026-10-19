import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { cleanLayout, cleanPhotos } from "@/lib/validate";
import Page from "@/models/Page";

// Công khai: trang xem cần đọc
export const GET = api(async () => {
  await connectDB();
  const pages = await Page.find().sort({ order: 1 }).lean();
  return NextResponse.json(pages);
});

// Thêm trang mới vào cuối album
export const POST = api(
  async (req: Request) => {
    const body = await req.json().catch(() => ({}));
    const layout = cleanLayout(body.layout);
    const photos = cleanPhotos(body.photos ?? []);
    await connectDB();
    const last = await Page.findOne()
      .sort({ order: -1 })
      .select("order")
      .lean();
    const page = await Page.create({
      layout,
      photos,
      order: (last?.order ?? -1) + 1,
    });
    return NextResponse.json(page, { status: 201 });
  },
  { auth: true },
);
