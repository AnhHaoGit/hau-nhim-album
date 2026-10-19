import { NextResponse } from "next/server";
import { ApiError, api } from "@/lib/api";
import { deleteImages } from "@/lib/imagekit";
import { connectDB } from "@/lib/mongodb";
import Cover from "@/models/Cover";

const empty = { url: "", fileId: "", width: 0, height: 0 };

// Công khai: trang xem cần đọc
export const GET = api(async () => {
  await connectDB();
  const c = await Cover.findOne({ key: "cover" }).lean();
  return NextResponse.json(
    c
      ? { url: c.url, fileId: c.fileId, width: c.width, height: c.height }
      : empty,
  );
});

// Đặt / đổi / xoá ảnh bìa (gửi url rỗng để xoá)
export const PUT = api(
  async (req: Request) => {
    const b = await req.json().catch(() => ({}));
    const url = typeof b.url === "string" ? b.url : "";
    const fileId = typeof b.fileId === "string" ? b.fileId : "";
    if (url && !url.startsWith(process.env.IMAGEKIT_URL_ENDPOINT ?? ""))
      throw new ApiError("Ảnh phải được upload qua ImageKit");
    if (!!url !== !!fileId) throw new ApiError("Ảnh thiếu url hoặc fileId");

    await connectDB();
    const old = await Cover.findOneAndUpdate(
      { key: "cover" },
      {
        url,
        fileId,
        width: Number(b.width) || 0,
        height: Number(b.height) || 0,
      },
      { upsert: true, new: false, setDefaultsOnInsert: true },
    );
    if (old?.fileId && old.fileId !== fileId) await deleteImages([old.fileId]);
    return NextResponse.json({
      url,
      fileId,
      width: Number(b.width) || 0,
      height: Number(b.height) || 0,
    });
  },
  { auth: true },
);
