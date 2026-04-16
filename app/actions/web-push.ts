"use server";

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:hello@dwitku.com",
    publicKey,
    privateKey
  );
}

export async function subscribeToPush(sub: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userId: session.user.id
    },
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userId: session.user.id
    }
  });

  return { success: true };
}

export async function sendPushToWorkspace(
  workspaceId: string,
  authorId: string,
  payload: { title: string; body: string; icon?: string; url?: string }
) {
  if (!publicKey || !privateKey) return;

  // Find all members in the workspace except author
  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      userId: { not: authorId }
    },
    include: {
      user: {
        include: {
          pushSubscriptions: true
        }
      }
    }
  });

  const subs = members.flatMap(m => m.user.pushSubscriptions);

  const pushes = subs.map(sub => {
    return webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      },
      JSON.stringify({ ...payload, icon: payload.icon || '/icon-192.png' })
    ).catch(e => {
      // If subscription expired, delete it
      if (e.statusCode === 410) {
        return prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => null);
      }
      console.error("Web Push Error:", e);
    });
  });

  await Promise.allSettled(pushes);
}
