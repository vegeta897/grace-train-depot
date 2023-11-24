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
	import { degToRad } from '$lib/util'
	import ColorSlider from '../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'

	export let decal: DecalDataWithId

	$: nodes = decal.params.nodes as StripesNode[]
	$: selectedNode = adding || expandNodeTuple(nodes[nodes.length - prevNode])
	$: if (prevNode > 0) {
		previewDecal.set({
			...decal,
			params: {
				...decal.params,
				highlightNode: nodes.length - prevNode,
				highlightColor: '#58c7f3',
			},
		})
	} else if (!adding) {
		previewDecal.set(null)
	}

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
				nodes[nodes.length - prevNode] = updatedNode
				const newMetrics = getStripesMetrics(decal.params as StripesParams)
				applyNewDecalParams(decal, metrics, newMetrics)
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
				params: {
					...decal.params,
					nodes: [...nodes, adding],
					highlightNode: nodes.length,
					highlightColor: '#71ead2',
				},
			})
	}

	function expandNodeTuple(node: StripesNode): StripesNode {
		if (!node) return node
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

	type StripesMetrics = ReturnType<typeof getStripesMetrics>

	function applyNewDecalParams(
		decal: DecalDataWithId,
		oldMetrics: StripesMetrics,
		newMetrics: StripesMetrics
	) {
		const dx = newMetrics.boundingBox.ox - oldMetrics.boundingBox.ox
		const dy = newMetrics.boundingBox.oy - oldMetrics.boundingBox.oy
		const sin = Math.sin(degToRad(decal.rotate))
		const cos = Math.cos(degToRad(decal.rotate))
		decal.x += (dx * cos - dy * sin) * decal.scale
		decal.y += (dy * cos + dx * sin) * decal.scale
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
			applyNewDecalParams(decal, metrics, newMetrics)
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
			nodes.splice(nodes.length - prevNode, 1)
			const newMetrics = getStripesMetrics(decal.params as StripesParams)
			applyNewDecalParams(decal, metrics, newMetrics)
			dirtyCanvas.set(true)
			return cars
		})
	}

	function toggleStripe(node: StripesNode, stripe: number) {
		if (node[2]?.includes(stripe)) {
			node[2] = node[2].filter((s) => s !== stripe)
			if (node[2].length === 0 && node.length === 3) node.length = 2
		} else {
			if (!node[2]) node[2] = []
			node[2].push(stripe)
		}
	}

	function onStripeToggleClick(stripe: number) {
		if (adding) {
			toggleStripe(adding, stripe)
			adding = adding
			updatePreviewDecal()
		} else if (prevNode > 0) {
			localCars.update((cars) => {
				toggleStripe(nodes[nodes.length - prevNode], stripe)
				return cars
			})
		}
	}

	function setStripeColor(stripe: number, color: string) {
		localCars.update((cars) => {
			decal.params.colors[stripe] = color
			return cars
		})
	}
</script>

<div class="grid grid-flow-dense grid-cols-3 gap-2">
	<h3 class="col-span-3 mb-1 text-center text-xl font-black uppercase tracking-wide">
		{#if adding}
			Add segment
		{:else if prevNode > 0}
			Edit segment
		{:else}
			Stripes design
		{/if}
	</h3>
	<!-- <ul class="steps col-span-3">
		{#if nodes.length < STRIPES_MAX_NODES}
			<li
				data-content="+"
				class:step-success={adding !== null}
				class="step step-success !min-w-[2rem] text-2xl font-black"
			></li>
		{/if}
		{#each nodes as node, n}
			<li
				data-content="●"
				class="step !min-w-[2rem]"
				class:step-secondary={adding === null && n === prevNode - 1}
			></li>
		{/each}
	</ul> -->
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
			disabled={prevNode === nodes.length}
			class="btn btn-lg text-xl">&gt;</button
		>
	{/if}
	<button
		on:click={removeNode}
		disabled={nodes.length === 1 || prevNode < 1}
		class="btn btn-lg text-xl hover:btn-error">🗑️</button
	>
	{#if selectedNode}
		<div class="col-span-3 flex flex-col">
			<label for="length" class="w-16">Length</label>
			<input
				id="length"
				type="range"
				class="range"
				min="0"
				max="8"
				value={selectedNode[1]}
				on:input={(e) => {
					selectedNode[1] = e.currentTarget.valueAsNumber
					updateNode()
				}}
			/>
		</div>
		<div class="col-span-3 flex flex-col">
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
					selectedNode[0] = e.currentTarget.valueAsNumber
					updateNode()
				}}
			/>
		</div>
		{#each ['right', 'mid', 'left'] as stripe, s}
			<button
				on:click={() => onStripeToggleClick(s)}
				class="btn btn-lg text-lg leading-tight"
				class:btn-secondary={selectedNode[2]?.includes(s)}
				style:grid-column-start={3 - s}
			>
				{stripe}
			</button>
		{/each}
	{:else}
		<h4 class="col-span-3 font-black uppercase tracking-wide">Stripe colors</h4>
		<div class="col-span-3 flex flex-col gap-4">
			{#each decal.params.colors as color, s}
				<ColorSlider
					colors={COLORS.POP}
					{color}
					onInput={(color) => setStripeColor(s, color)}
				/>
			{/each}
		</div>
	{/if}
</div>
<p>Adding: {adding}</p>
<p>Nodes: {nodes.length}</p>
<p>Selected: {selectedNode}</p>
