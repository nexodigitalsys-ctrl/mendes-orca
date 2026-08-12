import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

function denormalizeQuote(q: any) {
  return {
    id: q.id,
    number: q.number,
    clientId: q.client_id,
    clientName: q.client_name,
    clientDocument: q.client_document,
    clientPhone: q.client_phone,
    clientAddress: q.client_address,
    clientCity: q.client_city,
    clientArchitect: q.client_architect,
    status: q.status,
    docTitle: q.doc_title,
    paymentNotes: q.payment_notes,
    environments: q.environments,
    discount: q.discount,
    deliveryTime: q.delivery_time,
    validity: q.validity,
    paymentMethods: q.payment_methods,
    createdAt: q.created_at,
  };
}

export async function GET() {
  const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[API quotes GET]", error);
    return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
  }
  return NextResponse.json((data || []).map(denormalizeQuote));
}

function normalizeQuote(q: any) {
  return {
    id: q.id,
    number: q.number,
    client_id: q.clientId ?? q.client_id ?? "",
    client_name: q.clientName ?? q.client_name ?? "",
    client_document: q.clientDocument ?? q.client_document ?? "",
    client_phone: q.clientPhone ?? q.client_phone ?? "",
    client_address: q.clientAddress ?? q.client_address ?? "",
    client_city: q.clientCity ?? q.client_city ?? "",
    client_architect: q.clientArchitect ?? q.client_architect ?? "",
    status: q.status,
    doc_title: q.docTitle ?? q.doc_title ?? "ORÇAMENTO",
    payment_notes: q.paymentNotes ?? q.payment_notes ?? "",
    environments: q.environments,
    discount: q.discount ?? 0,
    delivery_time: q.deliveryTime ?? q.delivery_time ?? "90 DIAS",
    validity: q.validity ?? "15 dias",
    payment_methods: q.paymentMethods ?? q.payment_methods ?? [],
    created_at: q.createdAt ?? q.created_at ?? new Date().toISOString().slice(0, 10),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API quotes POST] raw body:", body);
    const normalized = Array.isArray(body) ? body.map(normalizeQuote) : normalizeQuote(body);
    console.log("[API quotes POST] normalized:", normalized);
    const { data, error } = await supabase.from("quotes").upsert(normalized).select();
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
