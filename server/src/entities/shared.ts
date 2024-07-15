import { z } from 'zod';

export const idSchema = z.number().int().positive();

export const createdAtSchema = z.date().default(() => new Date());
