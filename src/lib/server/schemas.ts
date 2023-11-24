import {
	BODY_NAMES,
	DECAL_NAMES,
	TOPPER_NAMES,
	type ParamsObject,
	decalDefs,
} from 'grace-train-lib/components'
import { z } from 'zod'
import {
	CAR_NAME_MAX_LENGTH,
	DECAL_MAX_SCALE,
	DECAL_MAX_SLOTS,
	DECAL_MIN_SCALE,
	TOPPER_MAX_OFFSET,
	TOPPER_MAX_ROTATE,
	TOPPER_MAX_SCALE,
	TOPPER_MAX_SLOTS,
	TOPPER_MIN_SCALE,
	WHEEL_DISTANCE_MAX,
	WHEEL_DISTANCE_MIN,
	WHEEL_SIZE_MAX,
	WHEEL_SIZE_MIN,
} from '../common/constants'
import { COLORS } from 'grace-train-lib'

const hexColorSchema = z.string().regex(/^#[A-F0-9]{6}$/i)
const popColorSchema = z.enum(COLORS.POP)
const baseColorSchema = z.enum(COLORS.BASE)

const decalSchema = z
	.object({
		name: z.enum(DECAL_NAMES),
		x: z.number().gte(-203).lte(578),
		y: z.number().gte(-178).lte(403),
		scale: z.number().gte(DECAL_MIN_SCALE).lte(DECAL_MAX_SCALE),
		rotate: z.number().gte(-180).lte(180),
		fill: popColorSchema,
		slot: z
			.number()
			.int()
			.gte(0)
			.lte(DECAL_MAX_SLOTS - 1),
		params: z.record(
			z.string(),
			z.union([z.number(), z.boolean(), z.string().min(0).max(30), z.array(z.any())])
		),
	})
	.refine((decal) => {
		return true // TODO: Temporary bypass
		const defaultParams = decalDefs[decal.name].getDefaultParamsObject()
		// Check that number of params match
		if (Object.keys(defaultParams).length !== Object.keys(decal.params).length)
			return false
		// Check type of each param
		for (const [key, value] of Object.entries(decal.params)) {
			if (typeof value !== typeof defaultParams[key]) return false
		}
		// TODO: Check string list params more thoroughly
		return true
	}, 'Invalid decal param count or types')

const topperSchema = z.object({
	name: z.enum(TOPPER_NAMES),
	colors: z.array(hexColorSchema).max(8),
	position: z.number().gte(0).lte(1),
	offset: z.number().gte(-TOPPER_MAX_OFFSET).lte(TOPPER_MAX_OFFSET),
	scale: z.number().gte(TOPPER_MIN_SCALE).lte(TOPPER_MAX_SCALE),
	rotate: z.number().gte(-TOPPER_MAX_ROTATE).lte(TOPPER_MAX_ROTATE),
	slot: z
		.number()
		.int()
		.gte(0)
		.lte(TOPPER_MAX_SLOTS - 1),
})

export const carSchema = z.object({
	id: z.number().int().gte(0).readonly(),
	shortId: z.string().min(1).readonly(),
	name: z.string().min(1).max(CAR_NAME_MAX_LENGTH).optional(),
	published: z.boolean().optional(),
	revision: z.number().int().gte(1).optional().readonly(),
	body: z.enum(BODY_NAMES),
	bodyColor: baseColorSchema.optional(),
	bodyPopColor: popColorSchema.optional(),
	wheelColor: popColorSchema.optional(),
	wheelFromCenter: z.number().int().gte(WHEEL_DISTANCE_MIN).lte(WHEEL_DISTANCE_MAX),
	wheelSize: z.number().int().gte(WHEEL_SIZE_MIN).lte(WHEEL_SIZE_MAX),
	decals: z.array(decalSchema).max(DECAL_MAX_SLOTS),
	toppers: z.array(topperSchema).max(TOPPER_MAX_SLOTS),
})

export type CarData = z.infer<typeof carSchema>
export type CarDataWithIds = Omit<CarData, 'decals' | 'toppers'> & {
	decals: DecalDataWithId[]
	toppers: TopperDataWithId[]
}
export type DecalData = Omit<z.infer<typeof decalSchema>, 'params'> & {
	params: ParamsObject
}
export type DecalDataWithId = DecalData & { id: number }
export type TopperData = z.infer<typeof topperSchema>
export type TopperDataWithId = TopperData & { id: number }
