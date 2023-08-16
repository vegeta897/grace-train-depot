import { BODY_NAMES, DECAL_NAMES, TOPPER_NAMES } from 'grace-train-lib'
import { z } from 'zod'
import {
	DECAL_MAX_SCALE,
	DECAL_MAX_SLOTS,
	DECAL_MIN_SCALE,
	WHEEL_DISTANCE_MAX,
	WHEEL_DISTANCE_MIN,
} from './common/constants'

export const hexColorSchema = z.string().regex(/^#[A-F0-9]{6}$/i) // TODO: Use enum of official color list

const decalSchema = z.object({
	name: z.enum(DECAL_NAMES),
	transform: z.object({
		x: z.number().gte(-100).lte(475),
		y: z.number().gte(-100).lte(330),
		scale: z.number().gte(DECAL_MIN_SCALE).lte(DECAL_MAX_SCALE),
		rotate: z.number().gte(-180).lt(180),
	}),
	fill: hexColorSchema,
	fillPreview: hexColorSchema.optional(),
	slot: z
		.number()
		.int()
		.gte(0)
		.lte(DECAL_MAX_SLOTS - 1),
	new: z.boolean().optional(),
})

const topperSchema = z.object({
	name: z.enum(TOPPER_NAMES),
	colors: z.array(hexColorSchema),
	position: z.number().int().gte(0),
	adjust: z
		.object({
			x: z.number().gte(-50).lte(50),
			y: z.number().gte(-50).lte(50),
			scale: z.number().gte(0.5).lte(1.5),
			rotate: z.number().gte(-20).lte(20),
		})
		.optional(),
	new: z.boolean().optional(),
})

export const carSchema = z.object({
	id: z.number().int().gte(0),
	shortId: z.string().min(1),
	name: z.string().min(1).optional(),
	published: z.boolean().optional(),
	revision: z.number().int().gte(1).optional(),
	body: z.enum(BODY_NAMES),
	wheels: z.object({
		color: hexColorSchema,
		fromCenter: z.number().int().gte(WHEEL_DISTANCE_MIN).lte(WHEEL_DISTANCE_MAX),
	}),
	decals: z.array(decalSchema).max(DECAL_MAX_SLOTS),
	toppers: z.array(topperSchema).max(3),
})

export type CarData = z.infer<typeof carSchema>
export type CarDataWithIds = Omit<CarData, 'decals'> & { decals: DecalDataWithId[] }
export type DecalData = z.infer<typeof decalSchema>
export type DecalDataWithId = DecalData & { id: number }
export type TopperData = z.infer<typeof topperSchema>
