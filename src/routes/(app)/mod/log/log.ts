import prisma from '$lib/server/prisma'

export const AUDIT_LOG_PAGE_SIZE = 15

export async function getLogEntries(beforeId?: number) {
	return (
		await prisma.auditLog.findMany({
			take: AUDIT_LOG_PAGE_SIZE,
			skip: beforeId ? 1 : 0,
			cursor: beforeId ? { id: beforeId } : undefined,
			select: {
				id: true,
				addedAt: true,
				modUser: { select: { twitchDisplayName: true, id: true } },
				onUser: { select: { twitchDisplayName: true, id: true } },
				action: true,
				data: true,
			},
			orderBy: { id: 'desc' },
		})
	).map((record) => ({ ...record, addedAt: record.addedAt.getTime() }))
}
