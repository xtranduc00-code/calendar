import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

/** GET: send one test notification to all push subscriptions (for manual testing). */
export async function GET() {
  const { data: subs } = await supabase.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, error: "No subscriptions" }, { status: 400 });
  }

  const payload = JSON.stringify({
    title: "✓ Test notification",
    body: "Calendar reminders are working.",
    tag: "test-notification",
    url: "/",
  });

  let sent = 0;
  const deadSubs: string[] = [];
  for (const s of subs) {
    try {
      const sub = JSON.parse(s.subscription as string) as webpush.PushSubscription;
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch {
      deadSubs.push(s.endpoint as string);
    }
  }
  if (deadSubs.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", deadSubs);
  }

  return NextResponse.json({ sent });
}
