import { ApiError } from "./api";
import type { PhotoDTO } from "./types";

export const MAX_PHOTOS = 4;
export const MAX_CAPTION = 200; // trần an toàn phía server; giới hạn thật theo từng vị trí nằm ở layouts.ts

export function cleanLayout(v: unknown): string {
  if (typeof v !== "string" || !/^[a-z0-9-]{1,40}$/.test(v))
    throw new ApiError("layout không hợp lệ");
  return v;
}

export function cleanDate(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v !== "string")
    throw new ApiError("Ngày hoặc ghi chú không hợp lệ");
  const text = v.trim();
  // Đây là nhãn hiển thị tự do (ví dụ: 12/08/2026, Mùa hè 2026), không phải ngày ISO.
  if (text.length > 40) throw new ApiError("Ngày hoặc ghi chú tối đa 40 ký tự");
  if (/[\u0000-\u001f\u007f]/.test(text))
    throw new ApiError("Ngày hoặc ghi chú chứa ký tự không hợp lệ");
  return text;
}

export function cleanCaption(v: unknown): string {
  if (v == null) return "";
  if (typeof v !== "string") throw new ApiError("Phụ đề không hợp lệ");
  const t = v.trim();
  if (t.length > MAX_CAPTION)
    throw new ApiError(`Phụ đề tối đa ${MAX_CAPTION} ký tự`);
  return t;
}

export function cleanColor(v: unknown): string {
  if (v == null || v === "") return "#f4f1ea";
  if (typeof v !== "string" || !/^#[0-9a-fA-F]{6}$/.test(v))
    throw new ApiError("Màu chữ không hợp lệ");
  return v;
}

export function cleanPhotos(input: unknown): PhotoDTO[] {
  if (!Array.isArray(input) || input.length > MAX_PHOTOS)
    throw new ApiError(`Mỗi trang tối đa ${MAX_PHOTOS} ảnh`);
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT ?? "";
  const slots = new Set<number>();

  return input.map((p) => {
    if (!p || typeof p !== "object") throw new ApiError("Ảnh không hợp lệ");
    const o = p as Record<string, unknown>;
    const slot = Number(o.slot);
    if (
      !Number.isInteger(slot) ||
      slot < 0 ||
      slot >= MAX_PHOTOS ||
      slots.has(slot)
    )
      throw new ApiError("Vị trí ảnh không hợp lệ");
    slots.add(slot);
    const url = typeof o.url === "string" ? o.url : "";
    const fileId = typeof o.fileId === "string" ? o.fileId : "";
    if (url && !url.startsWith(endpoint))
      throw new ApiError("Ảnh phải được upload qua ImageKit");
    if (!!url !== !!fileId) throw new ApiError("Ảnh thiếu url hoặc fileId");
    return {
      slot,
      url,
      fileId,
      width: Number(o.width) || 0,
      height: Number(o.height) || 0,
      caption: cleanCaption(o.caption),
      captionColor: cleanColor(o.captionColor),
      date: cleanDate(o.date),
    };
  });
}
