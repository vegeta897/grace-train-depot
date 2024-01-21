import type { DecalDataWithId } from '$lib/server/schemas/decals'

const SNAP_LOCK_DIST = 8
const SNAP_HINT_DIST = 32
const HALF_WIDTH = 375 / 2
const axesAndCrosses = [
	['x', 'y'],
	['y', 'x'],
] as const

export type SnapLine = {
	id: number | string
	line: { x1: number; x2?: number; y1: number; y2?: number }
	color: string
}

type Axis = 'x' | 'y'
type Snap = {
	axis: Axis
	axisPoint: number
	crossAxisMin: number
	crossAxisMax: number
	distance: number
	anchors: Set<number>
	lock?: boolean
}

export function calculateSnapping(
	decals: DecalDataWithId[],
	dragging: DecalDataWithId,
	x: number,
	y: number
): { x: number; y: number; snapLines: SnapLine[] } {
	const snaps: Snap[] = []
	let distance = Math.abs(x - HALF_WIDTH)
	if (distance < SNAP_HINT_DIST) {
		addSnap(snaps, {
			axis: 'x',
			axisPoint: HALF_WIDTH,
			crossAxisMin: 28,
			crossAxisMax: 197,
			anchors: new Set([28, 197]),
			distance,
		})
	}
	for (const otherTransform of decals) {
		if (otherTransform.id === dragging.id) continue
		for (const [axis, crossAxis] of axesAndCrosses) {
			distance = Math.abs((axis === 'x' ? x : y) - otherTransform[axis])
			if (distance < SNAP_HINT_DIST) {
				addSnap(snaps, {
					axis,
					axisPoint: otherTransform[axis],
					crossAxisMin: Math.min(otherTransform[crossAxis], dragging[crossAxis]),
					crossAxisMax: Math.max(otherTransform[crossAxis], dragging[crossAxis]),
					anchors: new Set([otherTransform[crossAxis]]),
					distance,
				})
			}
		}
	}
	let locked = false
	const lockingSnaps: { x: Snap[]; y: Snap[] } = { x: [], y: [] }
	for (const snap of snaps) {
		if (snap.distance > SNAP_LOCK_DIST) continue
		if (
			lockingSnaps[snap.axis].length === 0 ||
			snap.distance < lockingSnaps[snap.axis][0].distance
		) {
			lockingSnaps[snap.axis] = [snap]
		} else if (lockingSnaps[snap.axis][0]?.distance === snap.distance) {
			lockingSnaps[snap.axis].push(snap)
		}
		if (snap.axis === 'x') x = snap.axisPoint
		else y = snap.axisPoint
		locked = true
	}
	lockingSnaps.x.forEach((snap) => (snap.lock = true))
	lockingSnaps.y.forEach((snap) => (snap.lock = true))
	const finalSnaps = locked ? [...lockingSnaps.x, ...lockingSnaps.y] : snaps
	const snapLines: SnapLine[] = finalSnaps.map((snap) => {
		const flipCrossAxisPoints = snap.anchors.has(snap.crossAxisMax)
		const axisProp = snap.axis === 'x' ? 'x1' : 'y1'
		const crossAxisProps = snap.axis === 'x' ? ['y1', 'y2'] : ['x1', 'x2']
		return {
			id: `${snap.axis}:${snap.axisPoint}`,
			line: {
				[axisProp]: snap.axisPoint,
				[crossAxisProps[0]]: flipCrossAxisPoints ? snap.crossAxisMax : snap.crossAxisMin,
				[crossAxisProps[1]]: flipCrossAxisPoints ? snap.crossAxisMin : snap.crossAxisMax,
			} as SnapLine['line'],
			color: locked ? '#fff' : getSnapLineColor(snap.distance),
		}
	})
	return { snapLines, x, y }
}

function addSnap(snaps: Snap[], addedSnap: Snap) {
	for (const snap of snaps) {
		if (snap.axis !== addedSnap.axis || snap.axisPoint !== addedSnap.axisPoint) continue
		snap.crossAxisMin = Math.min(snap.crossAxisMin, addedSnap.crossAxisMin)
		snap.crossAxisMax = Math.max(snap.crossAxisMax, addedSnap.crossAxisMax)
		snap.anchors = new Set([...snap.anchors, ...addedSnap.anchors])
		return
	}
	snaps.push(addedSnap)
}

const getSnapLineColor = (distance: number) =>
	`#ffffff${Math.round(
		Math.pow((SNAP_HINT_DIST - distance) / SNAP_HINT_DIST, 3) * 127
	).toString(16)}`
