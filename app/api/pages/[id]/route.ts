import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { ApiError, api } from "@/lib/api";
import { deleteImages } from "@/lib/imagekit";
import { connectDB } from "@/lib/mongodb";
import { cleanLayout, cleanPhotos } from "@/lib/validate";
import Page from "@/models/Page";

type Ctx = { params: Promise<{ id: string }> };

async function getId(ctx: Ctx) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError("id không hợp lệ");
  return id;
}

// Sửa layout / ảnh / phụ đề / ngày của một trang
export const PATCH = api(
  async (req: Request, ctx: Ctx) => {
    const id = await getId(ctx);
    const body = await req.json().catch(() => ({}));
    await connectDB();
    const page = await Page.findById(id);
    if (!page) throw new ApiError("Không tìm thấy trang", 404);

    if (body.layout !== undefined) page.layout = cleanLayout(body.layout);
    let removed: string[] = [];
    if (body.photos !== undefined) {
      const photos = cleanPhotos(body.photos);
      const keep = new Set(photos.map((p) => p.fileId).filter(Boolean));
      removed = page.photos
        .map((p) => p.fileId)
        .filter((f) => f && !keep.has(f));
      page.set("photos", photos);
    }
    await page.save();
    await deleteImages(removed); // ảnh bị thay/xoá thì xoá luôn trên ImageKit
    return NextResponse.json(page);
  },
  { auth: true },
);

// Xoá trang + ảnh trên ImageKit, rồi đánh số lại thứ tự
export const DELETE = api(
  async (_req: Request, ctx: Ctx) => {
    const id = await getId(ctx);
    await connectDB();
    const page = await Page.findByIdAndDelete(id);
    if (!page) throw new ApiError("Không tìm thấy trang", 404);
    await deleteImages(page.photos.map((p) => p.fileId).filter(Boolean));

    const rest = await Page.find().sort({ order: 1 }).select("_id");
    if (rest.length)
      await Page.bulkWrite(
        rest.map((p, i) => ({
          updateOne: { filter: { _id: p._id }, update: { order: i } },
        })),
      );
    return NextResponse.json({ ok: true });
  },
  { auth: true },
);
