import { BODY_NAMES, TOPPER_NAMES } from 'grace-train-lib/components'
import { z } from 'zod'
import {
	CAR_NAME_MAX_LENGTH,
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
import {
	decalsSchema,
	popColorSchema,
	type DecalDataWithId,
	listSchema,
} from './decalSchemas'

const hexColorSchema = z.string().regex(/^#[A-F0-9]{6}$/i)
const baseColorSchema = listSchema(COLORS.BASE)

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
	name: z.string().min(1).max(CAR_NAME_MAX_LENGTH),
	published: z.boolean().optional(),
	revision: z.number().int().gte(1).optional().readonly(),
	body: z.enum(BODY_NAMES),
	bodyColor: baseColorSchema.optional(),
	bodyPopColor: popColorSchema.optional(),
	wheelColor: popColorSchema.optional(),
	wheelFromCenter: z.number().int().gte(WHEEL_DISTANCE_MIN).lte(WHEEL_DISTANCE_MAX),
	wheelSize: z.number().int().gte(WHEEL_SIZE_MIN).lte(WHEEL_SIZE_MAX),
	decals: decalsSchema,
	toppers: z.array(topperSchema).max(TOPPER_MAX_SLOTS),
})

export type CarData = z.infer<typeof carSchema>
export type CarDataWithIds = Omit<CarData, 'decals' | 'toppers'> & {
	decals: DecalDataWithId[]
	toppers: TopperDataWithId[]
}
export type { DecalData, DecalDataWithId } from './decalSchemas'
export type TopperData = z.infer<typeof topperSchema>
export type TopperDataWithId = TopperData & { id: number }
