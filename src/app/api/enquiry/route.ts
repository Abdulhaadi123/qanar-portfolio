import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

/**
 * Receives the contact form and stores it in the database (the admin panel's inbox).
 *  - checks the input here, and again inside the database function submit_enquiry(), which also enforces the rate limits
 *    (3 messages an hour per address, 40 an hour in all), so the limits hold even if someone calls the API directly
 *  - if ENQUIRY_WEBHOOK_URL is set (Slack, Zapier, Make ...), the message is also forwarded there, as a notification
 *  - if the message could not be stored, it answers { mode: "mailto" } and the page opens the visitor's mail app instead
 */
export async function POST(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) {
    return NextResponse.json({ error: "That message is too long." }, { status: 413 });
  }
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data = {
    kind: s(b.kind, 60),
    name: s(b.name, 120),
    email: s(b.email, 200),
    phone: s(b.phone, 60),
    budget: s(b.budget, 60),
    work: s(b.work, 80),
    message: s(b.message, 4000),
  };

  if (b.company) return NextResponse.json({ mode: "sent" }); // honeypot: pretend it worked
  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.message.length < 5) {
    return NextResponse.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  }

  let stored = false;
  if (hasSupabase) {
    const { error } = await createPublicClient().rpc("submit_enquiry", {
      p_kind: data.kind,
      p_name: data.name,
      p_email: data.email,
      p_phone: data.phone,
      p_budget: data.budget,
      p_work: data.work,
      p_message: data.message,
    });
    if (!error) stored = true;
    else if (error.code === "54000") {
      return NextResponse.json({ error: "Too many messages in a short time. Please try again in an hour." }, { status: 429 });
    } else if (error.code === "22023") {
      return NextResponse.json({ error: "Please check your name, email and message." }, { status: 400 });
    } else {
      console.error("[enquiry] could not store the message:", error.code, error.message);
    }
  }

  const hook = process.env.ENQUIRY_WEBHOOK_URL;
  if (hook) {
    const text = [
      `New enquiry: ${data.kind}`,
      data.work ? `Work: ${data.work}` : null,
      `From: ${data.name} <${data.email}>`,
      data.phone ? `Phone / WhatsApp: ${data.phone}` : null,
      data.budget ? `Budget: ${data.budget}` : null,
      "",
      data.message,
    ]
      .filter((l): l is string => l !== null)
      .join("\n");
    try {
      const r = await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, text }),
        signal: AbortSignal.timeout(6000),
      });
      if (r.ok) stored = true;
    } catch {
      /* the notification is a bonus; the message is already in the inbox when the database worked */
    }
  }

  return NextResponse.json({ mode: stored ? "sent" : "mailto" });
}
