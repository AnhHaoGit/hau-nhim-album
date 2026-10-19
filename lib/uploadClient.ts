// Dùng ở trình duyệt: nén nhẹ ảnh rồi upload thẳng lên ImageKit
export type UploadedImage = {
  url: string;
  fileId: string;
  width: number;
  height: number;
};

async function shrink(file: File, max = 2400): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 3_000_000) {
      bmp.close();
      return file;
    }
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) =>
      c.toBlob(r, "image/jpeg", 0.9),
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file; // trình duyệt không đọc được (vd HEIC) -> upload nguyên bản
  }
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const prepared = await shrink(file);
  const authRes = await fetch("/api/imagekit-auth");
  if (!authRes.ok)
    throw new Error("Chưa đăng nhập hoặc thiếu cấu hình ImageKit");
  const auth = await authRes.json();

  const fd = new FormData();
  fd.append("file", prepared);
  fd.append("fileName", prepared.name);
  fd.append("publicKey", auth.publicKey);
  fd.append("signature", auth.signature);
  fd.append("expire", String(auth.expire));
  fd.append("token", auth.token);
  fd.append("folder", "/haunhim-album");
  fd.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload ImageKit thất bại");
  const d = await res.json();
  return { url: d.url, fileId: d.fileId, width: d.width, height: d.height };
}
