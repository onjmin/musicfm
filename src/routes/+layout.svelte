<script lang="ts">
	import "../app.css";
	import { base } from "$app/paths";
	let { children } = $props();

	const title = "Music FM";
	const description = "君だけのプレイリストを友達と共有しよう";
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{base}/" />
	<meta property="og:image" content="{base}/favicon.svg" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{base}/favicon.svg" />

	<!-- Apple Touch Icon -->
	<link rel="apple-touch-icon" href="{base}/favicon.svg" />

	<!-- PWA 対応 -->
	<link rel="manifest" href="{base}/manifest.json" />
	<meta name="theme-color" content="#FF9933" />

	<script
		src="https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.js"
	></script>
</svelte:head>

<div class="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
	<!-- ヘッダー（固定） -->
	<header
		class="bg-zinc-900 shadow-md px-6 py-4 fixed top-0 left-0 right-0 z-50 text-center"
	>
		<h1 class="text-xl font-bold">🎶 おぉんがくぷれぃやああ 🎶</h1>
	</header>

	<!-- メインコンテンツ（スクロール可能） -->
	<main class="flex-1 mt-[72px] mb-[56px] overflow-y-auto px-4 py-6">
		{@render children()}
	</main>

	<!-- フッター（固定） -->
	<footer
		class="bg-zinc-900 shadow-inner px-6 py-3 fixed bottom-0 left-0 right-0 z-50 text-sm text-zinc-400 text-center"
	>
		© 2025 おんJ民. All rights reserved.
	</footer>
</div>
