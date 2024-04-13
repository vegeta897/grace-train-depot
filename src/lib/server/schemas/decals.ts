import {
	DECAL_MAX_SCALE,
	DECAL_MAX_SLOTS,
	DECAL_MIN_SCALE,
	STRIPES_MAX_NODES,
	STRIPES_MAX_NODE_LENGTH,
	STRIPES_MAX_STRIPE_COUNT,
} from '$lib/common/constants'
import { decalDefs } from 'grace-train-lib/components'
import { z } from 'zod'
import { createParamsSchema, popColorSchema } from './common'
import type { DecalData, DecalName, ParamsObject } from 'grace-train-lib/data'
import { schemaForType } from './common'

// TODO: User .refine() on non-int numbers to prevent too many decimals

const decalBaseSchema = z.object({
	x: z.number().gte(-203).lte(578), // TODO: Replace these magic numbers
	y: z.number().gte(-178).lte(403),
	rotate: z.number().gte(-180).lte(180),
	fill: popColorSchema,
	slot: z
		.number()
		.int()
		.gte(0)
		.lte(DECAL_MAX_SLOTS - 1),
})

function createDecalSchema(name: DecalName, params?: z.ZodType<ParamsObject>) {
	const { minScale, maxScale, paramConfig } = decalDefs[name]
	return decalBaseSchema.extend({
		scale: z
			.number()
			.gte(minScale ?? DECAL_MIN_SCALE)
			.lte(maxScale ?? DECAL_MAX_SCALE),
		name: z.literal(name),
		params: params || createParamsSchema(paramConfig),
	})
}

const stripesAngle = z.number().int().min(-90).max(90).multipleOf(30)
const stripesLength = z.number().int().min(0).max(STRIPES_MAX_NODE_LENGTH)
const stripesNoDraw = z
	.array(
		z
			.number()
			.int()
			.min(0)
			.max(STRIPES_MAX_STRIPE_COUNT - 1)
	)
	.max(STRIPES_MAX_STRIPE_COUNT)

const decalSchema = z.discriminatedUnion('name', [
	createDecalSchema('star'),
	createDecalSchema('heart'),
	createDecalSchema('circle'),
	createDecalSchema('flag'),
	createDecalSchema(
		'stripes',
		// Stripes don't have param defs, so custom validation is needed
		z.object({
			nodes: z
				.array(
					z.union([
						z.tuple([]),
						z.tuple([stripesAngle]),
						z.tuple([stripesAngle, stripesLength]),
						z.tuple([stripesAngle, stripesLength, stripesNoDraw]),
					])
				)
				.min(1)
				.max(STRIPES_MAX_NODES),
			stripeCount: z.number().int().min(1).max(STRIPES_MAX_STRIPE_COUNT),
			colors: z.array(popColorSchema).min(1).max(STRIPES_MAX_STRIPE_COUNT),
		})
	),
	createDecalSchema('flower'),
	createDecalSchema('box'),
	createDecalSchema('emote'),
	createDecalSchema('eyes'),
])

export type DecalDataWithSlot = DecalData & { slot: number }
export type DecalDataWithId = DecalDataWithSlot & { id: number }

export const decalsSchema = schemaForType<DecalDataWithSlot[]>()(
	z.array(decalSchema).max(DECAL_MAX_SLOTS)
)
