import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { imagekit } from "@/lib/imagekit";

// Trả chữ ký để trình duyệt upload thẳng lên ImageKit (không bị giới hạn dung lượng body của server)
export const GET = api(
  async () =>
    NextResponse.json({
      ...imagekit.getAuthenticationParameters(),
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    }),
  { auth: true },
);
