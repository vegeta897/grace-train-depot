import type { ParamMatcher } from '@sveltejs/kit'

// TODO: Add to design/[id] route

export const match: ParamMatcher = (param) => {
	return /^([a-z1-9]{8}|new)$/i.test(param)
}
