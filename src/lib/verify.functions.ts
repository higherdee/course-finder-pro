import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const verifyMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ materialId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: m, error } = await context.supabase
      .from("materials")
      .select("*")
      .eq("id", data.materialId)
      .eq("user_id", context.userId)
      .single();
    if (error || !m) throw new Error("Material not found");
    if (m.status !== "pending" || m.verification_score !== null) {
      return { status: m.status, score: m.verification_score, notes: m.verification_notes, pages: m.page_count };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { checkMaterial } = await import("./verify.server");

    const { data: blob, error: dErr } = await supabaseAdmin.storage.from("materials").download(m.file_path);
    if (dErr || !blob) throw new Error("Could not read the uploaded file");
    const bytes = new Uint8Array(await blob.arrayBuffer());

    let pages = 1;
    if (m.mime_type === "application/pdf") {
      try {
        const { PDFDocument } = await import("pdf-lib");
        pages = (await PDFDocument.load(bytes, { ignoreEncryption: true })).getPageCount();
      } catch {
        await supabaseAdmin.rpc("set_material_status", {
          _material_id: m.id,
          _status: "rejected",
          _score: 0,
          _notes: "The PDF could not be opened. Please upload a valid, unlocked PDF.",
        });
        return { status: "rejected" as const, score: 0, notes: "The PDF could not be opened.", pages: 0 };
      }
    }
    await supabaseAdmin.from("materials").update({ page_count: pages }).eq("id", m.id);

    let status: "verified" | "rejected" | "pending" = "pending";
    let score = 0;
    let notes = "Automatic check unavailable right now — an admin will review it.";
    try {
      const v = await checkMaterial(bytes, m.mime_type, m.file_name, m);
      score = v.score;
      notes = v.notes || notes;
      status = v.matches && v.score >= 70 ? "verified" : v.score < 40 ? "rejected" : "pending";
      if (status === "pending") notes = `${notes} Sent to an admin for a final review.`;
    } catch (e) {
      console.error("verification failed", e);
    }

    const { error: sErr } = await supabaseAdmin.rpc("set_material_status", {
      _material_id: m.id,
      _status: status,
      _score: score,
      _notes: notes,
    });
    if (sErr) throw new Error(sErr.message);
    return { status, score, notes, pages };
  });
