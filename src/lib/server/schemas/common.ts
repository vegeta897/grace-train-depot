import { COLORS } from 'grace-train-lib'
import type { ParamDefinition, ParamsObject } from 'grace-train-lib/components'
import { z } from 'zod'

export const schemaForType =
	<T>() =>
	<S extends z.ZodType<T, any, any>>(arg: S) =>
		arg

export const listSchema = <T extends any>(list: T[] | Readonly<T[]>) =>
	z.custom<T>((val) => list.includes(val as T))
export const popColorSchema = listSchema(COLORS.POP)
export const baseColorSchema = listSchema(COLORS.BASE)
export const hexColorSchema = z.string().regex(/^#[A-F0-9]{6}$/i)

export function createParamsSchema(paramConfig: ParamDefinition[]) {
	return z.object<ParamsObject>(
		Object.fromEntries(
			paramConfig.map((param) => {
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
	)
}
