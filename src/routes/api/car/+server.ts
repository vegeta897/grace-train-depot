import prisma from '$lib/server/prisma'
import { json, type RequestHandler } from '@sveltejs/kit'

// TODO: If request/response typing gets hard to manage, consider tRPC-SvelteKit
// https://icflorescu.github.io/trpc-sveltekit

export const POST = (async ({ request }) => {
	const reqJson = await request.json()
	console.log('POST received', reqJson)
	await prisma.car.update({
		where: { id: reqJson.id },
		data: { hatColor: reqJson.data.hat.color },
	})
	return json('success')
}) satisfies RequestHandler
