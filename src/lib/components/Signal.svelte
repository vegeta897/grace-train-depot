<script lang="ts">
	import { signalDefs, type SignalName } from '$lib/signals'

	export let signal: SignalName
	export let inactive = false
	$: colors = signalDefs[signal].colors
</script>

<div
	class="badge h-8 border-none px-3 text-lg font-bold -outline-offset-2"
	style:color={colors[0]}
	style:background={inactive ? 'transparent' : colors[1]}
	class:outline={inactive}
	style:outline-color={colors[1]}
	class:opacity-75={inactive}
	class:saturate-50={inactive}
>
	{signal}
</div>
