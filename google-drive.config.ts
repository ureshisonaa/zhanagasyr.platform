// ZhanaGasyr Education Platform — Prisma Schema
//
// Соглашение об именовании (архитектурное решение Этапа 0.2, ТЗ явно не
// регламентирует): модели — PascalCase (как принято в Prisma/TS), таблицы
// и колонки в самой PostgreSQL — snake_case через @@map/@map. Это стандартная
// практика для Prisma + Postgres и не противоречит требованиям ТЗ.
//
// Модели добавляются строго по этапам Roadmap. Этап 0.2: User, Role
// (минимум, необходимый для последующей Авторизации — Этап 1.1).

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

/// Роли пользователей (Student/Mentor/Admin/SuperAdmin).
/// Справочник, а не enum — управляется через Admin Panel (Этап 11.1),
/// без изменения схемы БД при появлении новых ролей в будущем.
model Role {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  users User[]

  @@map("roles")
}

/// Основная таблица пользователей (Часть 2, п.3 ТЗ).
/// Удаление запрещено — используется isActive=false (Часть 2, п.20).
model User {
  id        String    @id @default(uuid()) @db.Uuid
  email     String    @unique
  password  String
  firstName String    @map("first_name")
  lastName  String    @map("last_name")
  phone     String?   @unique
  country   String?
  city      String?
  birthDate DateTime? @map("birth_date") @db.Date
  avatar    String?
  isActive  Boolean   @default(true) @map("is_active")
  /// Используется для ревокации refresh-токенов при logout (Auth, Этап 1.1):
  /// инкрементируется при logout, refresh-токен с устаревшим значением отклоняется.
  /// Ограничение: инвалидирует ВСЕ сессии пользователя разом, а не одну конкретную —
  /// для инвалидации по устройствам в будущем потребуется отдельная таблица сессий.
  tokenVersion Int     @default(0) @map("token_version")
  roleId    String    @map("role_id") @db.Uuid
  role      Role      @relation(fields: [roleId], references: [id])
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@index([email])
  @@index([roleId])
  @@map("users")
}
