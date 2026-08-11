import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true });
  if (error) {
    console.error("[API clients GET]", error);
    return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API clients POST] body:", body);
    const payload = Array.isArray(body) ? body : [body];
    const { data, error } = await supabase.from("clients").upsert(payload).select();
    if (error) {
      console.error("[API clients POST]", error);
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[API clients POST] exception:", err);
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    console.error("[API clients DELETE]", error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
