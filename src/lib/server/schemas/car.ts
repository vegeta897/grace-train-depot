import { z } from 'zod'
import {
	CAR_NAME_MAX_LENGTH,
	WHEEL_DISTANCE_MAX,
	WHEEL_DISTANCE_MIN,
	WHEEL_SIZE_MAX,
	WHEEL_SIZE_MIN,
} from '../../common/constants'
import { decalsSchema, type DecalDataWithId, type DecalDataWithSlot } from './decals'
import { baseColorSchema, popColorSchema, schemaForType } from './common'
import { toppersSchema, type TopperDataWithId, type TopperDataWithSlot } from './toppers'
import { BODY_NAMES, type DepotCar } from 'grace-train-lib/data'
import { SIGNALS, type SignalName } from '$lib/signals'

export const carSchema = schemaForType<CarDataForDBWrite>()(
	z.object({
		id: z.number().int().gte(0).readonly(),
		shortId: z.string().min(1).readonly(),
		name: z.string().min(1).max(CAR_NAME_MAX_LENGTH),
		revision: z.number().int().gte(1).optional().readonly(),
		signals: z.array(z.enum(SIGNALS)),
		body: z.enum(BODY_NAMES),
		bodyColor: baseColorSchema.optional(),
		bodyPopColor: popColorSchema.optional(),
		wheelBaseColor: baseColorSchema.optional(),
		wheelPopColor: popColorSchema.optional(),
		wheelFlipColors: z.boolean().optional(),
		wheelFromCenter: z.number().int().gte(WHEEL_DISTANCE_MIN).lte(WHEEL_DISTANCE_MAX),
		wheelSize: z.number().int().gte(WHEEL_SIZE_MIN).lte(WHEEL_SIZE_MAX),
		decals: decalsSchema,
		toppers: toppersSchema,
	})
)

export type CarDataForDBWrite = Omit<DepotCar, 'decals' | 'toppers'> & {
	id: number
	shortId: string
	name: string
	revision?: number
	signals: SignalName[]
	decals: DecalDataWithSlot[]
	toppers: TopperDataWithSlot[]
}

export type DesignCar = Omit<CarDataForDBWrite, 'decals' | 'toppers'> & {
	signalGoals: SignalName[]
	decals: DecalDataWithId[]
	toppers: TopperDataWithId[]
}
