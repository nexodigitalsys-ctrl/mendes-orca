import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[API quotes GET]", error);
    return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API quotes POST] body:", body);
    const { data, error } = await supabase.from("quotes").upsert(body).select();
    if (error) {
      console.error("[API quotes POST]", error);
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[API quotes POST] exception:", err);
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) {
    console.error("[API quotes DELETE]", error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
