import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const hash = process.env.EDIT_PASSWORD_HASH;
  const ok =
    !!hash &&
    typeof password === "string" &&
    (await bcrypt.compare(password, hash));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // làm chậm brute-force
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
