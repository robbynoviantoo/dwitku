"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGuideImages(): Promise<Record<string, string>> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "guide_images" },
    });

    if (!setting?.value) {
      return {};
    }

    return JSON.parse(setting.value);
  } catch (err) {
    console.error("Error reading guide_images setting:", err);
    return {};
  }
}

export async function saveGuideImages(images: Record<string, string>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Tidak terautentikasi" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return { error: "Hanya Admin yang dapat mengelola gambar panduan" };
    }

    const value = JSON.stringify(images);

    await prisma.systemSetting.upsert({
      where: { key: "guide_images" },
      update: { value },
      create: {
        key: "guide_images",
        value,
      },
    });

    revalidatePath("/guide");
    revalidatePath("/admin/guide");

    return { success: true };
  } catch (err: any) {
    console.error("Error saving guide_images:", err);
    return { error: err.message || "Gagal menyimpan gambar panduan" };
  }
}
