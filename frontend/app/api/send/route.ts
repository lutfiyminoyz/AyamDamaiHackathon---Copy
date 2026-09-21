// app/api/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";

export const runtime = "nodejs";        // crypto.randomUUID + FormData need node
export const maxDuration = 60;          // for Vercel — bump if extraction is slow

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const from_address = (form.get("from_address") as string) || "";
    const subject      = (form.get("subject") as string) || "";
    const body         = (form.get("body") as string) || "";
    const received_at  = (form.get("received_at") as string) || new Date().toISOString();

    const files = form.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one attachment is required." },
        { status: 400 }
      );
    }

    // 1) Upload every file to Supabase Storage
    const uploaded: { path: string; filename: string }[] = [];

    for (const file of files) {
      if (!file.name) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // e.g. "test_SI.pdf"
      const storagePath = file.name;


      const { error: uploadError } = await supabaseAdmin
        .storage
        .from("attachments")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload failed for ${file.name}: ${uploadError.message}` },
          { status: 500 }
        );
      }

      uploaded.push({ path: storagePath, filename: file.name });
    }

    // 2) Call the Python pipeline
    const pythonRes = await fetch(
      `${process.env.PYTHON_API_URL}/api/process-from-storage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_address,
          subject,
          body,
          received_at,
          attachments: uploaded,
        }),
      }
    );

    const result = await pythonRes.json();

    if (!pythonRes.ok) {
      return NextResponse.json(result, { status: pythonRes.status });
    }

    // 3) Return Python's response to the browser
    return NextResponse.json({
      ...result,
      uploaded_files: uploaded,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}