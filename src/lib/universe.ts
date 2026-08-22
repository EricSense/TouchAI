import { prisma } from "@/lib/prisma";
import { serializeUniverse } from "@/lib/serialize";

export async function getUserUniverse(userId: string) {
  let universe = await prisma.universe.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!universe) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const firstName = user?.name.split(" ")[0] || "My";
    universe = await prisma.universe.create({
      data: {
        userId,
        name: `${firstName}'s Universe`,
      },
    });
  }

  return universe;
}

export async function getOwnedUniverse(userId: string, universeId: string) {
  return prisma.universe.findFirst({
    where: { id: universeId, userId },
    include: {
      nodes: { orderBy: { createdAt: "asc" } },
      connections: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
}

export async function getOwnedUniverseSnapshot(userId: string, universeId: string) {
  const universe = await getOwnedUniverse(userId, universeId);
  return universe ? serializeUniverse(universe) : null;
}

export async function recordActivity(universeId: string, message: string) {
  await prisma.activity.create({
    data: { universeId, message },
  });
  await prisma.universe.update({
    where: { id: universeId },
    data: { updatedAt: new Date() },
  });
}
