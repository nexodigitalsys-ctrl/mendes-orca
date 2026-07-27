import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabase.from("companies").select("*").limit(1).single();
  if (error && error.code !== "PGRST116") {
    console.error("[API company GET]", error);
    return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
  }
  return NextResponse.json(data || null);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API company POST] body:", body);
    const { data: existing } = await supabase.from("companies").select("id").limit(1).single();

    const payload = existing?.id ? { ...body, id: existing.id } : body;
    const { data, error } = await supabase.from("companies").upsert(payload).select();
    if (error) {
      console.error("[API company POST]", error);
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[API company POST] exception:", err);
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}
