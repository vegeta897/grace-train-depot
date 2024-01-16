import { BODY_NAMES } from 'grace-train-lib/components'
import { z } from 'zod'
import {
	CAR_NAME_MAX_LENGTH,
	WHEEL_DISTANCE_MAX,
	WHEEL_DISTANCE_MIN,
	WHEEL_SIZE_MAX,
	WHEEL_SIZE_MIN,
} from '../../common/constants'
import { decalsSchema, type DecalDataWithId } from './decals'
import { baseColorSchema, popColorSchema } from './params'
import { toppersSchema, type TopperDataWithId } from './toppers'

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
	toppers: toppersSchema,
})

export type CarData = z.infer<typeof carSchema>
export type CarDataWithIds = Omit<CarData, 'decals' | 'toppers'> & {
	decals: DecalDataWithId[]
	toppers: TopperDataWithId[]
}
export type { DecalData, DecalDataWithId } from './decals'
export type { TopperData, TopperDataWithId } from './toppers'
