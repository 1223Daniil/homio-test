"use server";

import { UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function getProjects(developerId?: string, country?: string) {
  const session = await getServerSession(authOptions);

  // Базовый фильтр по developerId для пользователей с ролью DEVELOPER
  let where: any = {};
  
  if (session?.user?.role === UserRole.DEVELOPER && session.user.developerId) {
    where.developerId = session.user.developerId;
  }
  
  // Добавляем фильтр по developerId, если он указан
  if (developerId) {
    where.developerId = developerId;
  }
  
  // Добавляем условие фильтрации по стране, если оно указано
  if (country) {
    where.location = {
      country: {
        contains: country,
        mode: 'insensitive' // Игнорируем регистр при сравнении
      }
    };
  }

  // Получаем проекты с применением всех фильтров
  const projects = await prisma.project.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      developer: true,
      media: true,
      translations: true,
      location: true
    }
  });

  return projects;
}
