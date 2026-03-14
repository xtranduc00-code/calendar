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

export async function GET() {
  const now = new Date();

  // Fetch all events with a reminder in the next 2 minutes (so we don't miss any)
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .not("reminder_minutes", "is", null)
    .gt("start", now.toISOString());

  if (!events || events.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const { data: subs } = await supabase.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "SUPABASE_KEY prefix:",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.slice(0, 20),
  );
  let sent = 0;

  for (const ev of events) {
    const reminderMs = (ev.reminder_minutes as number) * 60 * 1000;
    const startTime = new Date(ev.start as string).getTime();
    const triggerTime = startTime - reminderMs;
    const diff = triggerTime - now.getTime();

    // Send if within [-30s, +60s] of the reminder time
    if (diff >= -30_000 && diff <= 60_000) {
      const minutesLeft = Math.round((startTime - now.getTime()) / 60_000);
      const payload = JSON.stringify({
        title: "📅 Event reminder",
        body: `${ev.name} — in ${minutesLeft} min`,
        tag: `reminder-${ev.id}`,
        url: "/",
      });

      const deadSubs: string[] = [];
      await Promise.all(
        subs.map(async (s) => {
          try {
            const sub = JSON.parse(
              s.subscription as string,
            ) as webpush.PushSubscription;
            await webpush.sendNotification(sub, payload);
            sent++;
          } catch {
            deadSubs.push(s.endpoint as string);
          }
        }),
      );

      // Remove expired subscriptions
      if (deadSubs.length > 0) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .in("endpoint", deadSubs);
      }
    }
  }

  return NextResponse.json({ sent });
}
