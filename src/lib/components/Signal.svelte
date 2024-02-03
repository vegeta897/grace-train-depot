<script lang="ts">
	import { signalDefs, type SignalName } from '$lib/signals'

	export let signal: SignalName
	export let inactive = false
	export let small = false
	$: colors = signalDefs[signal].colors
</script>

<div
	class="badge border-none px-3 font-bold -outline-offset-2"
	class:h-8={!small}
	class:h-7={small}
	class:text-lg={!small}
	class:text-base={small}
	style:color={colors[0]}
	style:background={inactive ? 'transparent' : colors[1]}
	class:outline={inactive}
	style:outline-color={colors[1]}
	class:opacity-75={inactive}
	class:saturate-50={inactive}
>
	{signal}
</div>
