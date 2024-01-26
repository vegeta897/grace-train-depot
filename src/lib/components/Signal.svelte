<script lang="ts">
	import { signalDefs, type SignalName } from '$lib/signals'

	export let signal: SignalName
	$: signalDef = signalDefs[signal]
</script>

<div
	class="badge h-8 border-none px-3 text-lg font-bold"
	style:color={signalDef.colors[0]}
	style:background={signalDef.colors[1]}
>
	{signal}
</div>
