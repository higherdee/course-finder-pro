import { streamText } from "ai";

import { CHAT_MODEL, createGateway, reasoningOptions } from "./ai/gateway.server";

export type Verdict = { matches: boolean; score: number; notes: string };

type Details = {
  title: string;
  course: string;
  course_code: string | null;
  institution: string;
  level: string | null;
  material_type: string;
  description: string | null;
};

export async function checkMaterial(bytes: Uint8Array, mime: string, fileName: string, d: Details): Promise<Verdict> {
  const { provider } = createGateway();
  const prompt = `You verify study materials uploaded to a student platform. Compare the attached file with the details the student entered.

Stated details:
- Title: ${d.title}
- Course: ${d.course}${d.course_code ? ` (${d.course_code})` : ""}
- Institution: ${d.institution}
- Level: ${d.level ?? "not given"}
- Type: ${d.material_type}
- Description: ${d.description ?? "none"}

Decide if the file is a genuine academic material whose subject matter matches the stated course and type. Institution/level only need to be plausible, not proven. Reject blank, unreadable, spam, unrelated, offensive or non-academic files.

Reply with ONLY a JSON object: {"matches": boolean, "score": integer 0-100 confidence that it matches, "notes": "one or two short sentences for the student"}`;

  const filePart =
    mime === "application/pdf"
      ? ({ type: "file", data: bytes, mediaType: mime, filename: fileName } as const)
      : ({ type: "image", image: bytes, mediaType: mime } as const);

  const result = streamText({
    model: provider.responses(CHAT_MODEL),
    messages: [{ role: "user", content: [{ type: "text", text: prompt }, filePart] }],
    providerOptions: reasoningOptions("low"),
  });
  const text = await result.text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Unreadable verification reply");
  const parsed = JSON.parse(match[0]) as Partial<Verdict>;
  return {
    matches: Boolean(parsed.matches),
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
    notes: String(parsed.notes ?? "").slice(0, 500),
  };
}
