import {
	DECAL_MAX_SCALE,
	DECAL_MAX_SLOTS,
	DECAL_MIN_SCALE,
	STRIPES_MAX_NODES,
	STRIPES_MAX_NODE_LENGTH,
	STRIPES_MAX_STRIPE_COUNT,
} from '$lib/common/constants'
import { COLORS } from 'grace-train-lib'
import { decalDefs, type ParamsObject, type DecalName } from 'grace-train-lib/components'
import { z } from 'zod'

export const listSchema = <T extends any>(list: T[] | Readonly<T[]>) =>
	z.custom<T>((val) => list.includes(val as T))
export const popColorSchema = listSchema(COLORS.POP)

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

function createDecalSchema(name: DecalName, params?: z.ZodType<ParamsObject>) {
	return decalBaseSchema.extend({
		name: z.literal(name),
		params:
			params ||
			z.object<ParamsObject>(
				Object.fromEntries(
					decalDefs[name].paramConfig.map((param) => {
						// param
						let schema: z.ZodType
						if (param.type === 'toggle') {
							schema = z.boolean()
						} else if (param.type === 'scalar') {
							schema = z.number().min(0).max(1)
						} else {
							schema = listSchema(param.list)
						}
						return [param.name, schema]
					})
				)
			),
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
])

export type DecalData = z.infer<typeof decalSchema>
export type DecalDataWithId = DecalData & { id: number }

export const decalsSchema = z.array(decalSchema).max(DECAL_MAX_SLOTS)
