<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { enhance } from '$app/forms'
	import { flip } from 'svelte/animate'

	export let data: PageData

	$: cars = data.cars || []
	$: filteredCars = cars.filter((c) => show[c.approval])

	const approvalTypes = ['pending', 'approved', 'flagged']
	const show: Record<(typeof approvalTypes)[number], boolean> = {
		pending: true,
		approved: false,
		flagged: false,
	}
</script>

<section class="pb-4 lg:p-4">
	<h2 class="p-2 text-2xl font-black uppercase tracking-wide">🛡️ Mod view</h2>
	<div class="bg-base-200 p-2 sm:rounded-box xs:p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-xl font-black">stream debuts</h3>
			<div
				class="inline-flex items-center gap-3 rounded-lg bg-neutral px-2 xs:gap-4 xs:px-3"
			>
				<span class="hidden text-lg font-bold 2xs:inline">filter</span>
				{#each approvalTypes as approval}
					<div class="form-control">
						<label class="label cursor-pointer gap-2">
							<span class="label-text">{approval}</span>
							<input
								type="checkbox"
								bind:checked={show[approval]}
								class="checkbox checkbox-sm xs:checkbox-md"
								class:checkbox-success={approval === 'approved'}
								class:checkbox-error={approval === 'flagged'}
							/>
						</label>
					</div>
				{/each}
			</div>
		</div>
		<ol class="grid grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] gap-6">
			{#each filteredCars as { car, carId, shortId, revision, approval, username, trustLevel } (`${carId}:${revision}`)}
				{@const trusted = trustLevel === 'trusted'}
				<li
					class="relative flex flex-col items-center justify-end p-2 pt-5"
					animate:flip={{ duration: 250 }}
				>
					<Car {car} />
					{#if approval !== 'pending'}
						<div class="absolute left-0 top-0 h-full w-full bg-base-200 bg-opacity-75" />
					{/if}
					<div class="absolute top-0">
						<div data-tip="🤍 trusted" class:sm:tooltip={trusted}>
							<div class="badge badge-neutral bg-opacity-70 backdrop-blur">
								{#if trusted}<span class="-ml-1 mr-1 text-xs">🤍 </span>
								{/if}{username}
							</div>
						</div>
					</div>
					<form
						action="?/approve"
						method="POST"
						use:enhance
						class="-mt-9 flex gap-1 rounded-lg bg-neutral p-1 backdrop-blur"
						class:bg-success={approval === 'approved'}
						class:bg-error={approval === 'flagged'}
						class:bg-opacity-70={approval === 'pending'}
						class:bg-opacity-30={approval !== 'pending'}
					>
						<input type="hidden" name="carId" value={carId} />
						<input type="hidden" name="revision" value={revision} />
						<input type="hidden" name="scope" value="train" />
						<input type="hidden" name="approval" value={approval} />
						<div
							class="sm:tooltip sm:tooltip-success"
							data-tip={approval === 'approved' ? 'approved' : 'approve'}
						>
							<button
								class="btn btn-sm hover:btn-success"
								class:btn-success={approval === 'approved'}>✔️</button
							>
						</div>
						<div class="sm:tooltip" data-tip={shortId ? 'go to page' : 'car deleted'}>
							{#if shortId}
								<a class="btn btn-sm" href="/c/{shortId}">🔗</a>
							{:else}
								<button disabled class="btn btn-sm">🔗</button>
							{/if}
						</div>
						<div
							class="sm:tooltip sm:tooltip-error"
							data-tip={approval === 'flagged' ? 'red flagged' : 'red flag'}
						>
							<button
								formaction="?/flag"
								class="btn btn-sm hover:btn-error"
								class:btn-error={approval === 'flagged'}>🚩</button
							>
						</div>
					</form>
				</li>
			{/each}
		</ol>
		{#if filteredCars.length === 0}
			<div class="grid h-32 place-items-center text-center text-lg italic">
				<p>
					no cars to show
					{#if cars.length > 0}
						<br /><span class="opacity-50">({cars.length} hidden by filters)</span>
					{/if}
				</p>
			</div>
		{/if}
	</div>
</section>
