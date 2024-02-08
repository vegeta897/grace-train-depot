<script lang="ts">
	import {
		ContainerSvg,
		Decal,
		Topper,
		type DecalDef,
		type TopperDef,
	} from 'grace-train-lib/components'
	import ColorSlider from './ColorSlider.svelte'
	import BoundingBox from '$lib/components/BoundingBox.svelte'
	import type { DecalData, TopperData } from 'grace-train-lib/data'

	export let object:
		| { type: 'decal'; data: DecalData; def: DecalDef }
		| { type: 'topper'; data: TopperData; def: TopperDef }
	$: paramConfig = object.def.paramConfig
	export let onInput: (name: string, value: number | boolean | string) => void
	export let onChange: () => void = () => {}
</script>

{#each paramConfig as param}
	{#if param.type !== 'listPicker'}
		<label
			for={param.name}
			class="whitespace-nowrap text-lg text-base-content/80 lg:text-xl"
			>{param.displayName}</label
		>
	{/if}
	{#if param.type === 'scalar'}
		<input
			id={param.name}
			type="range"
			min={0}
			max={1}
			step="0.01"
			value={object.data.params[param.name]}
			on:input={(e) => onInput(param.name, e.currentTarget.valueAsNumber)}
			on:change={onChange}
			class="range"
		/>
	{:else if param.type === 'toggle'}
		<input
			checked={object.data.params[param.name]}
			type="checkbox"
			on:change={(e) => {
				onInput(param.name, e.currentTarget.checked)
				onChange()
			}}
			class="toggle"
		/>
	{:else if 'list' in param}
		{@const list = param.list}
		{#if param.type === 'listSlider'}
			{#if 'color' in param && param.color}
				<ColorSlider
					colors={list}
					color={object.data.params[param.name]}
					onInput={(color) => onInput(param.name, color)}
				/>
			{:else}
				<input
					id={param.name}
					type="range"
					min={0}
					max={list.length - 1}
					step="1"
					value={list.indexOf(object.data.params[param.name])}
					on:input={(e) => onInput(param.name, list[e.currentTarget.valueAsNumber])}
					on:change={onChange}
					class="range"
				/>
			{/if}
		{:else}
			<div
				class="col-span-2 grid grid-cols-[repeat(auto-fill,_minmax(3rem,_1fr))] gap-2 rounded-lg bg-base-100 p-2"
			>
				{#each param.list as listItem}
					{@const params = { ...object.data.params, [param.name]: listItem }}
					{@const boundingBox = object.def.getBoundingBox(params)}
					{@const width = boundingBox.width + 20}
					{@const height = boundingBox.height + 20}
					<button
						class="btn btn-ghost btn-sm h-auto w-full p-0"
						on:click={() => {
							onInput(param.name, listItem)
							onChange()
						}}
					>
						<ContainerSvg viewBox="-{width / 2} -{height / 2} {width} {height}">
							{#if object.type === 'decal'}
								<Decal name={object.data.name} fill={object.data.fill} {params} />
							{:else}
								<Topper name={object.data.name} {params} />
							{/if}
							{#if object.data.params[param.name] === listItem}
								<BoundingBox {height} {width} />
							{/if}
						</ContainerSvg>
					</button>
				{/each}
			</div>
		{/if}
	{/if}
{/each}
