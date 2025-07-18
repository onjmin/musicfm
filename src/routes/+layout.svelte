<script lang="ts">
	import "../app.css";
	let { children } = $props();
</script>

<div class="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
	<!-- ヘッダー（固定） -->
	<header
		class="bg-zinc-900 shadow-md px-6 py-4 fixed top-0 left-0 right-0 z-50"
	>
		<h1 class="text-xl font-bold">🎶 おぉんがくぷれぃやああ 🎶</h1>
	</header>

	<!-- メインコンテンツ（スクロール可能） -->
	<main class="flex-1 mt-[72px] mb-[56px] overflow-y-auto px-4 py-6">
		{@render children()}
	</main>

	<!-- フッター（固定） -->
	<footer
		class="bg-zinc-900 shadow-inner px-6 py-3 fixed bottom-0 left-0 right-0 z-50 text-sm text-zinc-400"
	>
		© 2025 J民の音楽プレイヤー
	</footer>
</div>
