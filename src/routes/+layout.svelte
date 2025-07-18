<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col">
	<!-- ヘッダー -->
	<header class="bg-zinc-900 shadow-md px-6 py-4">
		<h1 class="text-xl font-bold">🎶 おぉんがくぷれぃやああ 🎶</h1>
	</header>

	<!-- メインスロット -->
	<main class="flex-1 px-4 py-6">
		{@render children()}
	</main>
</div>
