<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import { getRelativeTime } from '$lib/util'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<section class="p-4">
	<div class="rounded-box flex flex-col gap-4 bg-neutral p-4">
		<h2 class="text-2xl font-black uppercase tracking-wide">🛡️ Mod view</h2>
		<h3 class="text-2xl font-black">latest trains</h3>
		<ol class="space-y-4">
			{#each data.trains as train, t}
				<li>
					<h4 class="mb-2 flex items-center gap-2">
						<span class="badge badge-lg font-bold" class:badge-primary={!train.ended}>
							{#if train.ended}
								{@const lastCarTimeRelative = getRelativeTime(train.cars[0].addedAt)}
								ended {lastCarTimeRelative[0]}
								{lastCarTimeRelative[1]} ago
							{:else}
								current train
							{/if}
						</span>
						{#if !train.ended}
							<button class="btn btn-neutral btn-sm">refresh</button>
						{/if}
					</h4>
					<ol class="flex gap-4 overflow-x-scroll rounded-lg bg-base-200 px-4 py-2">
						{#each train.cars as car}
							<li class="w-24 shrink-0 overflow-clip pt-2">
								<Car car={car.carData} />
								<div
									class="overflow-hidden text-wrap break-words text-center text-sm leading-none text-base-content/90"
								>
									{car.user?.twitchDisplayName}
								</div>
							</li>
						{/each}
					</ol>
				</li>
			{/each}
		</ol>
	</div>
</section>
