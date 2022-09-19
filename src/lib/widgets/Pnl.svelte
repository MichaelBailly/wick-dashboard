<script lang="ts">
	export let pnl: number;
</script>

<span class={pnl >= 0 ? 'green' : 'red'}>{Math.trunc(pnl * 100) / 100}</span>

<style>
	.green {
		color: green;
	}
	.red {
		color: red;
	}
</style>
