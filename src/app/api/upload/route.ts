import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { file, path } = await req.json();
    if (!file || !path) {
      return NextResponse.json({ error: "file and path are required" }, { status: 400 });
    }

    const base64 = file.includes(",") ? file.split(",")[1] : file;
    const buffer = Buffer.from(base64, "base64");
    const contentType = file.includes("data:image/png") ? "image/png" : "image/jpeg";

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
