<script lang="ts">
	import { ticketDefs, type TicketName } from '$lib/tickets'

	export let ticket: TicketName
	$: ticketDef = ticketDefs[ticket]
</script>

<div
	class="badge h-8 border-none px-3 text-lg font-bold"
	style:color={ticketDef.colors[0]}
	style:background={ticketDef.colors[1]}
>
	{ticket}
</div>
