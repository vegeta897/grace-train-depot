<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { enhance } from '$app/forms'

	export let data: PageData

	$: cars = data.cars || []
</script>

<section class="lg:p-4">
	<h2 class="p-2 text-2xl font-black uppercase tracking-wide">Mod view</h2>
	<div class="bg-base-200 p-4 lg:rounded-box">
		<h3 class="mb-2 text-xl font-black uppercase tracking-wide">Stream debuts</h3>
		<ol class="grid grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] gap-6">
			{#each cars as { car, carId, shortId, revision, approval, username, trusted }, c}
				<li class="relative flex flex-col items-center justify-end p-2 pt-5">
					<Car {car} />
					{#if approval !== 'pending'}
						<div class="absolute left-0 top-0 h-full w-full bg-base-200 bg-opacity-75" />
					{/if}
					<div class="absolute top-0">
						<div data-tip="🤍 trusted" class:sm:tooltip={trusted}>
							<div class="badge badge-neutral bg-opacity-70 backdrop-blur">
								{#if trusted}<span class="-ml-1 mr-1 text-xs">🤍 </span>
								{/if}{username}
								{carId}
							</div>
						</div>
					</div>
					<form
						action="?/approve"
						method="POST"
						use:enhance
						class="-mt-9 flex gap-1 rounded-lg bg-neutral p-1 backdrop-blur"
						class:bg-success={approval === 'approved'}
						class:bg-warning={approval === 'rejected'}
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
								class="btn btn-sm font-black tracking-wide hover:btn-success"
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
							class="sm:tooltip sm:tooltip-warning"
							data-tip={approval === 'rejected' ? 'rejected' : 'reject'}
						>
							<button
								formaction="?/reject"
								class="btn btn-sm font-black tracking-wide hover:btn-warning"
								class:btn-warning={approval === 'rejected'}>⚠️</button
							>
						</div>
					</form>
				</li>
			{/each}
		</ol>
	</div>
</section>
