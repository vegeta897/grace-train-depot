import {
	DECAL_MAX_SCALE,
	DECAL_MAX_SLOTS,
	DECAL_MIN_SCALE,
	STRIPES_MAX_NODES,
	STRIPES_MAX_NODE_LENGTH,
	STRIPES_MAX_STRIPE_COUNT,
} from '$lib/common/constants'
import { COLORS } from 'grace-train-lib'
import { PRIDE_FLAGS } from 'grace-train-lib/components'
import { z } from 'zod'

export const popColorSchema = z.custom<string>((val) => {
	return typeof val === 'string' && COLORS.POP.includes(val)
})

const decalBaseSchema = z.object({
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
})

const scalar = z.number().min(0).max(1)
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

export const decalSchema = z.union([
	decalBaseSchema.extend({
		name: z.literal('star'),
		params: z.object({ pinch: scalar, strokeWidth: scalar, outline: z.boolean() }),
	}),
	decalBaseSchema.extend({
		name: z.literal('heart'),
		params: z.object({
			dip: scalar,
			taper: scalar,
			strokeWidth: scalar,
			outline: z.boolean(),
		}),
	}),
	decalBaseSchema.extend({
		name: z.literal('circle'),
		params: z.object({ pinch: scalar, hollow: scalar }),
	}),
	decalBaseSchema.extend({
		name: z.literal('flag'),
		params: z.object({ flag: z.enum(PRIDE_FLAGS) }),
	}),
	decalBaseSchema.extend({
		name: z.literal('stripes'),
		params: z.object({
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
		}),
	}),
	decalBaseSchema.extend({
		name: z.literal('flower'),
		params: z.object({
			petalColor: popColorSchema,
			centerColor: popColorSchema,
			petals: z.number().int().min(4).max(10),
			petalBloom: scalar,
			petalLength: scalar,
			petalWidth: scalar,
		}),
	}),
])

export const decalsSchema = z.array(decalSchema).max(DECAL_MAX_SLOTS)
