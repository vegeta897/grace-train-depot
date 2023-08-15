import { BODY_NAMES, DECAL_NAMES } from 'grace-train-lib'
import { z } from 'zod'
import {
	DECAL_MAX_SCALE,
	DECAL_MAX_SLOTS,
	DECAL_MIN_SCALE,
	WHEEL_DISTANCE_MAX,
	WHEEL_DISTANCE_MIN,
} from './common/constants'

export const hexColorSchema = z.string().regex(/^#[A-F0-9]{6}$/i) // TODO: Use enum of official color list

export const carSchema = z.object({
	id: z.number().int().gte(0),
	shortId: z.string().min(1),
	name: z.string().min(1).optional(),
	published: z.boolean().optional(),
	body: z.enum(BODY_NAMES),
	wheels: z.object({
		color: hexColorSchema,
		fromCenter: z.number().int().gte(WHEEL_DISTANCE_MIN).lte(WHEEL_DISTANCE_MAX),
	}),
	hat: z.object({
		color: hexColorSchema.nullable(),
	}),
	decals: z
		.array(
			z.object({
				name: z.enum(DECAL_NAMES),
				transform: z.object({
					x: z.number().gte(-100).lte(475),
					y: z.number().gte(-100).lte(350),
					scale: z.number().gte(DECAL_MIN_SCALE).lte(DECAL_MAX_SCALE),
					rotate: z.number().gte(0).lt(360),
				}),
				id: z.number().int().gte(0),
				fill: hexColorSchema,
				slot: z
					.number()
					.int()
					.gte(0)
					.lte(DECAL_MAX_SLOTS - 1),
				new: z.boolean().optional(),
			})
		)
		.max(DECAL_MAX_SLOTS),
})
