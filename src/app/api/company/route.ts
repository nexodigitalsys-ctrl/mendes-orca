import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabase.from("companies").select("*").limit(1).single();
  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || null);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data: existing } = await supabase.from("companies").select("id").limit(1).single();

  const payload = existing?.id ? { ...body, id: existing.id } : body;
  const { data, error } = await supabase.from("companies").upsert(payload).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
