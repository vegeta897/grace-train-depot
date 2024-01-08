<script lang="ts">
	import type { PageData, SubmitFunction } from './$types'
	import { page } from '$app/stores'
	import { PUBLIC_HOST } from '$env/static/public'
	import { fade } from 'svelte/transition'
	import { cubicIn } from 'svelte/easing'
	import { applyAction, enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'
	import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
	import { Car } from 'grace-train-lib/components'
	import { getCarViewBox } from '$lib/car'

	export let data: PageData

	let managing = false
	let deleting = false
	let wantDelete = false
	let understandDelete = false
	let renamed = false
	let copied = false

	$: embedTitle = `"${data.car.name}" by ${data.car.twitchName}`
	$: imageUrl = `${PUBLIC_HOST}/assets/car_${data.car.shortId}.png`

	const onRename: SubmitFunction = ({ formData, cancel }) => {
		if (formData.get('carName') === data.car.name) return cancel()
		return async ({ result }) => {
			await applyAction(result)
			managing = false
			renamed = true
			setTimeout(() => (renamed = false), 3000)
			invalidateAll()
		}
	}

	function copyLink() {
		navigator.clipboard.writeText(PUBLIC_HOST + $page.url.pathname)
		copied = true
		setTimeout(() => (copied = false), 3000)
	}
</script>

<svelte:head>
	<meta property="og:title" content={embedTitle} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:site_name" content="choochoo.fun" />
	<meta property="twitter:title" content={embedTitle} />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:image" content={imageUrl} />
	<meta property="twitter:site" content="choochoo.fun" />
</svelte:head>
<section class="card mb-6 rounded-none bg-neutral xs:rounded-box md:card-side xs:m-6">
	<figure class="bg-base-200/70 p-4 md:w-1/2 md:p-6 lg:px-12 lg:py-8">
		<div class="h-auto max-w-[32rem]">
			<Car car={data.car} viewBox={getCarViewBox(data.car)} />
		</div>
	</figure>
	<div class="card-body p-4 xs:px-6 md:p-6 lg:p-8 lg:px-8">
		<h2
			class="card-title grow flex-wrap items-baseline gap-x-4 gap-y-0 text-3xl font-black lg:text-4xl"
		>
			{data.car.name}
			<small class="text-lg font-normal text-base-content/70">
				by <strong>{data.car.twitchName}</strong>
			</small>
		</h2>
		{#if data.car.stats}
			<div class="stats">
				<div class="stat px-4 xs:px-6">
					<div class="stat-title">appeared</div>
					<div class="stat-value text-xl">
						<span class="text-2xl leading-[inherit]">
							{data.car.stats.totalAppearances}
						</span> times
					</div>
					<div class="stat-desc text-sm">
						in <strong>{data.car.stats.trainCount}</strong> grace trains
					</div>
				</div>
				<div class="stat px-4 xs:px-6">
					<div class="stat-title">last seen</div>
					<div class="stat-value text-xl">
						<span class="text-2xl leading-[inherit]">
							{data.car.stats.lastAppearanceRelative[0]}
						</span>
						{data.car.stats.lastAppearanceRelative[1]} ago
					</div>
					<div class="stat-desc text-sm">
						on {data.car.stats.lastAppearance.toLocaleDateString()}
					</div>
				</div>
			</div>
		{/if}
		{#if data.car.belongsToUser}
			<div class="card-actions rounded-box flex-nowrap bg-base-100 px-4 py-4 xs:px-6">
				{#if managing}
					<div class="flex grow flex-col gap-4">
						{#if !deleting}
							<form
								class="flex gap-3"
								use:enhance={onRename}
								method="POST"
								action="?/rename"
							>
								<div class="grow">
									<input
										required
										type="text"
										name="carName"
										class="input input-bordered w-full invalid:input-warning"
										value={data.car.name}
										placeholder="type a name"
										maxlength={CAR_NAME_MAX_LENGTH}
									/>
								</div>
								<button class="btn btn-primary font-black">Rename</button>
							</form>
						{/if}
						{#if deleting}
							<form
								class="flex flex-col gap-4"
								use:enhance
								method="POST"
								action="?/delete"
							>
								<div>
									<label class="label cursor-pointer justify-center gap-3">
										<span class="text-lg">i want to delete this car</span>
										<input
											required
											type="checkbox"
											bind:checked={wantDelete}
											class="checkbox-error checkbox"
										/>
									</label>
									<label class="label cursor-pointer justify-center gap-3">
										<span class="text-lg">i know it can't be undone</span>
										<input
											required
											type="checkbox"
											bind:checked={understandDelete}
											class="checkbox-error checkbox"
										/>
									</label>
								</div>
								<button
									disabled={!wantDelete || !understandDelete}
									class="btn btn-error btn-lg font-black">Delete it!</button
								>
								<button type="button" class="link" on:click={() => (deleting = false)}
									>i don't want to delete it!</button
								>
							</form>
						{:else}
							<div class="flex w-full justify-between">
								<button
									class="btn font-black hover:btn-error"
									on:click={() => {
										deleting = true
										wantDelete = false
										understandDelete = false
									}}>Delete</button
								>
								<button class="btn font-black" on:click={() => (managing = false)}>
									Cancel
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<button
						class="btn btn-ghost px-3 font-black"
						on:click={() => (managing = true)}
					>
						Manage
					</button>
					<div class="flex-1">
						<button class="btn btn-ghost px-3 font-black" on:click={copyLink}>
							Share
						</button>
					</div>
					<a href="/design/{data.car.shortId}" class="btn btn-secondary font-black">
						Design
					</a>
				{/if}
			</div>
		{/if}
	</div>
</section>
{#if data.user}
	<!-- Users not logged in have no page to go "back" to -->
	<!-- TODO: Add a "design your own car!" button -->
	<div class="mb-4 flex justify-center">
		<a href="/" class="btn btn-lg font-black">Back</a>
	</div>
{/if}
<div class="toast toast-center toast-top">
	{#if copied}
		<div
			class="alert alert-info grid-flow-col"
			out:fade={{ duration: 200, easing: cubicIn }}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>link copied!</span>
		</div>
	{/if}
	{#if renamed}
		<div
			class="alert alert-success grid-flow-col"
			out:fade={{ duration: 200, easing: cubicIn }}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>car renamed!</span>
		</div>
	{/if}
</div>
