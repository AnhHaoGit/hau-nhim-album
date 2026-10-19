import { NextResponse } from "next/server";
import { isAuthed } from "./auth";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

// Bọc route handler: kiểm tra đăng nhập (nếu cần) + bắt lỗi gọn gàng
export function api<A extends unknown[]>(
  fn: (...a: A) => Promise<Response>,
  opts: { auth?: boolean } = {},
) {
  return async (...a: A): Promise<Response> => {
    try {
      if (opts.auth && !(await isAuthed()))
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
      return await fn(...a);
    } catch (e) {
      if (e instanceof ApiError)
        return NextResponse.json({ error: e.message }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
  };
}
