import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import type { SanitizedUser } from '../../auth/interfaces/sanitized-user.interface';

export const AVATAR_UPLOAD_DIR = './uploads/avatars';
export const AVATAR_PUBLIC_PATH_PREFIX = '/uploads/avatars';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

if (!existsSync(AVATAR_UPLOAD_DIR)) {
  mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
}

type RequestWithOptionalUser = Request & { user?: SanitizedUser };

/**
 * ВНИМАНИЕ (ограничение этого этапа): файлы хранятся на локальном диске
 * контейнера. На Railway диск НЕ гарантированно персистентен между
 * редеплоями без подключения отдельного volume — при переезде на Railway
 * это нужно либо настроить persistent volume, либо перенести аватары на
 * облачное хранилище. Для профильной картинки (в отличие от документов
 * заявок, которые обязаны быть в Google Drive — Фаза 4) такое упрощение
 * приемлемо на MVP-этапе, но не для боевого продакшена без volume.
 */
export const avatarMulterOptions = {
  storage: diskStorage({
    destination: AVATAR_UPLOAD_DIR,
    filename: (
      req: RequestWithOptionalUser,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ): void => {
      const userId = req.user?.id ?? 'unknown';
      const uniqueSuffix = Date.now();
      callback(null, `${userId}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(new BadRequestException('Only JPEG, PNG or WEBP images are allowed'), false);
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
};
