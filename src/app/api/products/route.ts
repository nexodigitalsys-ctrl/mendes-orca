import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabase.from("products").select("*").order("code", { ascending: true });
  if (error) {
    console.error("[API products GET]", error);
    return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API products POST] body:", body);
    const payload = Array.isArray(body) ? body : [body];
    const { data, error } = await supabase.from("products").upsert(payload).select();
    if (error) {
      console.error("[API products POST]", error);
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[API products POST] exception:", err);
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });
  const { error } = await supabase.from("products").delete().eq("code", code);
  if (error) {
    console.error("[API products DELETE]", error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
