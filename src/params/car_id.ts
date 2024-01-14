import type { ParamMatcher } from '@sveltejs/kit'

export const match: ParamMatcher = (param) => /^([a-z1-9]{8}|new)$/i.test(param)
