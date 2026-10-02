import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import type { Database, Json } from "@/integrations/supabase/types";
import { CHAT_MODEL, createGateway, reasoningOptions } from "@/lib/ai/gateway.server";
import { getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "@/lib/ai/run-id";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
        const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            headers: { Authorization: `Bearer ${token}` },
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data: auth } = await supabase.auth.getUser(token);
        const user = auth.user;
        if (!user) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as { messages?: UIMessage[]; threadId?: string };
        const messages = body.messages ?? [];
        if (!body.threadId || messages.length === 0) return new Response("Bad request", { status: 400 });

        const { data: thread } = await supabase
          .from("chat_threads")
          .select("id, title")
          .eq("id", body.threadId)
          .maybeSingle();
        if (!thread) return new Response("Conversation not found", { status: 404 });

        const last = messages[messages.length - 1]!;
        if (last.role === "user") {
          const { error } = await supabase.from("chat_messages").insert({
            thread_id: thread.id,
            user_id: user.id,
            message_id: last.id,
            role: "user",
            parts: last.parts as unknown as Json,
          });
          if (error) return new Response("Could not save your message", { status: 500 });
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, institution, course, level, study_plan")
          .eq("id", user.id)
          .maybeSingle();

        const system = `You are Boss, the Syllaboss study assistant for university students (mostly in Nigeria). Be warm, clear and practical. Explain concepts step by step, quiz the student when helpful, build study timetables, and summarise topics. Use markdown. Never help with exam malpractice.
Student: ${profile?.full_name ?? "unknown"}; ${profile?.course ?? "course unknown"}, ${profile?.level ?? ""} at ${profile?.institution ?? "unknown institution"}.
Study plan: ${JSON.stringify(profile?.study_plan ?? {})}`;

        const { provider, runIdFetch } = createGateway(getLovableAiGatewayRunId(request));
        const result = streamText({
          model: provider.responses(CHAT_MODEL),
          system,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: reasoningOptions("medium"),
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onFinish: async ({ responseMessage }) => {
            const { error } = await supabase.from("chat_messages").insert({
              thread_id: thread.id,
              user_id: user.id,
              message_id: responseMessage.id,
              role: "assistant",
              parts: responseMessage.parts as unknown as Json,
            });
            if (error) console.error("save assistant message failed", error);
            const firstText = messages
              .find((m) => m.role === "user")
              ?.parts.find((p) => p.type === "text") as { text: string } | undefined;
            await supabase
              .from("chat_threads")
              .update({
                updated_at: new Date().toISOString(),
                ...(thread.title === "New chat" && firstText ? { title: firstText.text.slice(0, 60) } : {}),
              })
              .eq("id", thread.id);
          },
        });
        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
