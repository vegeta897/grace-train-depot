import prisma from '$lib/server/prisma'
import type { Prisma } from 'grace-train-lib/prisma'

export const AUDIT_LOG_PAGE_SIZE = 15

export async function getLogEntries(
	options: { beforeId?: number; where?: Prisma.AuditLogWhereInput } = {}
) {
	return (
		await prisma.auditLog.findMany({
			take: AUDIT_LOG_PAGE_SIZE,
			skip: options.beforeId ? 1 : 0,
			cursor: options.beforeId ? { id: options.beforeId } : undefined,
			select: {
				id: true,
				addedAt: true,
				modUser: { select: { twitchDisplayName: true, id: true } },
				onUser: { select: { twitchDisplayName: true, id: true } },
				action: true,
				data: true,
			},
			orderBy: { id: 'desc' },
			where: options.where ?? undefined,
		})
	).map((record) => ({ ...record, addedAt: record.addedAt.getTime() }))
}
