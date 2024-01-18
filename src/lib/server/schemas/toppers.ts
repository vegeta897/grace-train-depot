import {
	TOPPER_MAX_OFFSET,
	TOPPER_MIN_SCALE,
	TOPPER_MAX_SCALE,
	TOPPER_MAX_ROTATE,
	TOPPER_MAX_SLOTS,
} from '$lib/common/constants'
import {
	topperDefs,
	type ParamsObject,
	type TopperName,
} from 'grace-train-lib/components'
import { z } from 'zod'
import { createParamsSchema } from './common'
import type { TopperData } from 'grace-train-lib/data'
import { schemaForType } from './common'

const topperBaseSchema = z.object({
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

function createTopperSchema(name: TopperName, params?: z.ZodType<ParamsObject>) {
	const { paramConfig } = topperDefs[name]
	return topperBaseSchema.extend({
		name: z.literal(name),
		params: params || createParamsSchema(paramConfig),
	})
}

const topperSchema = z.discriminatedUnion('name', [createTopperSchema('party_hat')])

export type TopperDataWithSlot = TopperData & { slot: number }
export type TopperDataWithId = TopperDataWithSlot & { id: number }

export const toppersSchema = schemaForType<TopperDataWithSlot[]>()(
	z.array(topperSchema).max(TOPPER_MAX_SLOTS)
)
