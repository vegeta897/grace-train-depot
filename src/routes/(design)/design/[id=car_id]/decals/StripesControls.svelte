<script lang="ts">
	import type { DecalDataWithId } from '$lib/server/schemas'
	import {
		getStripesMetrics,
		type StripesNode,
		type StripesParams,
	} from 'grace-train-lib/components'
	import { getDesignStores } from '../stores'
	import { getDecalStores } from './stores'
	import { onDestroy } from 'svelte'
	import { STRIPES_MAX_NODES } from '$lib/common/constants'

	export let decal: DecalDataWithId

	$: nodes = decal.params.nodes as StripesNode[]
	$: selectedNode = adding || expandNodeTuple(nodes[nodes.length - 1 - prevNode])

	const { localCars } = getDesignStores()
	const { dirtyCanvas, selectedSlot, previewDecal } = getDecalStores()
	previewDecal.set(null)

	const slotUnsubscribe = selectedSlot.subscribe((s) => {
		if (s !== decal.slot) previewDecal.set(null)
	})
	onDestroy(slotUnsubscribe)

	let prevNode = 0
	let adding: StripesNode | null = null

	function toggleAddMode() {
		adding = adding ? null : [0, 1, [], true]
		updatePreviewDecal()
	}

	function updateNode() {
		if (adding) updatePreviewDecal()
		else {
			const updatedNode = trimNodeTuple(selectedNode)
			localCars.update((lc) => {
				const metrics = getStripesMetrics(decal.params as StripesParams)
				nodes[nodes.length - 1 - prevNode] = updatedNode
				const newMetrics = getStripesMetrics(decal.params as StripesParams)
				decal.x += newMetrics.boundingBox.ox - metrics.boundingBox.ox
				decal.y += newMetrics.boundingBox.oy - metrics.boundingBox.oy
				dirtyCanvas.set(true)
				return lc
			})
		}
	}

	function updatePreviewDecal() {
		if (!adding) previewDecal.set(null)
		else
			previewDecal.set({
				...decal,
				params: { ...decal.params, nodes: [...nodes, adding] },
			})
	}

	function expandNodeTuple(node: StripesNode): StripesNode {
		return [node[0] || 0, node[1] || 0, node[2] || []]
	}

	function trimNodeTuple(node: StripesNode): StripesNode {
		// Strip out unnecessary props
		const trimmed = node.slice(0, 3) as StripesNode
		if (trimmed[2]?.length === 0) trimmed.length = 2
		if (trimmed.length === 2 && trimmed[1] === 0) trimmed.length = 1
		if (trimmed.length === 1 && trimmed[0] === 0) trimmed.length = 0
		return trimmed
	}

	function addNode() {
		if (!adding) return
		const addedNode = trimNodeTuple(adding)
		localCars.update((cars) => {
			const metrics = getStripesMetrics(decal.params as StripesParams)
			const newMetrics = getStripesMetrics({
				...decal.params,
				nodes: [...nodes, addedNode],
			} as StripesParams)
			decal.x += newMetrics.boundingBox.ox - metrics.boundingBox.ox
			decal.y += newMetrics.boundingBox.oy - metrics.boundingBox.oy
			nodes.push(addedNode)
			adding = null
			dirtyCanvas.set(true) // Decal has changed size and position
			previewDecal.set(null)
			return cars
		})
	}

	function removeNode() {
		localCars.update((cars) => {
			const metrics = getStripesMetrics(decal.params as StripesParams)
			nodes.length = nodes.length - 1
			const newMetrics = getStripesMetrics(decal.params as StripesParams)
			decal.x += newMetrics.boundingBox.ox - metrics.boundingBox.ox
			decal.y += newMetrics.boundingBox.oy - metrics.boundingBox.oy
			dirtyCanvas.set(true)
			return cars
		})
	}
</script>

<div class="grid grid-flow-dense grid-cols-3 gap-2">
	<ul class="steps col-span-3">
		{#if adding}
			<li
				data-content="+"
				class="step step-success !min-w-[2rem] text-2xl font-black"
			></li>
		{/if}
		{#each nodes as node, n}
			<li
				data-content="●"
				class="step !min-w-[2rem]"
				class:step-secondary={adding === null && n === prevNode}
			></li>
		{/each}
	</ul>
	{#if adding !== null}
		<button
			on:click={addNode}
			disabled={adding[0] === 0 && adding[1] === 0}
			class="btn btn-lg text-xl font-black uppercase tracking-wide hover:btn-success"
			>Go</button
		>
		<button
			on:click={toggleAddMode}
			class="btn btn-lg text-xl font-black uppercase tracking-wide"
		>
			Cancel
		</button>
	{:else}
		{#if prevNode === 0}
			<button
				on:click={toggleAddMode}
				disabled={nodes.length >= STRIPES_MAX_NODES}
				class="btn btn-lg text-xl font-black uppercase tracking-wide"
			>
				Add
			</button>
		{:else}
			<button
				on:click={() => prevNode--}
				disabled={prevNode === 0}
				class="btn btn-lg text-xl">&lt;</button
			>
		{/if}
		<button
			on:click={() => prevNode++}
			disabled={prevNode === nodes.length - 1}
			class="btn btn-lg text-xl">&gt;</button
		>
	{/if}
	<button
		on:click={removeNode}
		disabled={adding !== null || nodes.length === 1}
		class="btn btn-lg text-xl hover:btn-error">🗑️</button
	>
	<div class="col-span-3 flex flex-col gap-1">
		<label for="length" class="w-16">Length</label>
		<input
			id="length"
			type="range"
			class="range"
			min="0"
			max="8"
			value={selectedNode[1]}
			on:input={(e) => {
				selectedNode[1] = +e.currentTarget.value
				updateNode()
			}}
		/>
	</div>
	<div class="col-span-3 flex flex-col gap-1">
		<label for="angle" class="w-16">Angle</label>
		<input
			id="angle"
			type="range"
			class="range"
			min="-90"
			max="90"
			step="30"
			value={selectedNode[0]}
			on:input={(e) => {
				selectedNode[0] = +e.currentTarget.value
				updateNode()
			}}
		/>
	</div>
</div>
<p>Adding: {adding}</p>
<p>Nodes: {nodes.length}</p>
<p>Selected: {selectedNode}</p>
