import { NextResponse } from "next/server";
import { ApiError, api } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import Page from "@/models/Page";

// Body: { ids: ["id1","id2",...] } theo thứ tự mới
export const PUT = api(
  async (req: Request) => {
    const { ids } = await req.json().catch(() => ({ ids: null }));
    if (!Array.isArray(ids) || ids.some((i) => typeof i !== "string"))
      throw new ApiError("ids không hợp lệ");
    await connectDB();
    const existing = (await Page.find().select("_id")).map((p) =>
      String(p._id),
    );
    const same =
      ids.length === existing.length &&
      new Set(ids).size === ids.length &&
      ids.every((i) => existing.includes(i));
    if (!same)
      throw new ApiError(
        "Danh sách trang không khớp (có thể bị thiếu/thừa trang)",
      );
    await Page.bulkWrite(
      ids.map((id: string, i: number) => ({
        updateOne: { filter: { _id: id }, update: { order: i } },
      })),
    );
    return NextResponse.json({ ok: true });
  },
  { auth: true },
);
