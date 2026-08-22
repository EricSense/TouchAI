"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSession, requireSession } from "@/lib/session";
import { getUserUniverse } from "@/lib/universe";
import type { FormState } from "@/lib/types";

export async function updateSettings(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  const name = String(formData.get("name") || "").trim();
  const universeName = String(formData.get("universeName") || "").trim();

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Name must be at least 2 characters.";
  if (universeName.length < 2) {
    fieldErrors.universeName = "Universe name must be at least 2 characters.";
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  await prisma.user.update({
    where: { id: session.userId },
    data: { name },
  });

  const universe = await getUserUniverse(session.userId);
  await prisma.universe.update({
    where: { id: universe.id },
    data: { name: universeName },
  });

  await createSession({
    userId: session.userId,
    name,
    email: session.email,
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/insights");
  revalidatePath(`/universe/${universe.id}`);

  return { success: true };
}
