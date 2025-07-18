<script lang="ts">
    import { PauseIcon, PlayIcon } from "@lucide/svelte";

    let rawUrls = $state("");
    let urls: string[] = $state([]);
    let currentIndex = $state(0);
    let isPlaying = $state(false);

    let currentUrl = $state("");

    function loadUrls() {
        const lines = rawUrls
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        urls = lines;
        currentIndex = 0;
        isPlaying = true;
    }

    const play = (index: number) => {
        currentIndex = index;
        isPlaying = true;
    };

    const togglePlayback = () => {
        isPlaying = !isPlaying;
    };
</script>

<!-- レイアウト全体 -->
<div class="max-w-3xl mx-auto p-6 space-y-6 text-white">
    <!-- URL入力 -->
    <textarea
        class="w-full h-32 p-3 bg-zinc-900 text-white rounded-md border border-zinc-700 resize-none"
        placeholder="改行で動画のURLを入力してください"
        bind:value={rawUrls}
    ></textarea>

    <!-- 読み込みボタン -->
    <div class="text-right">
        <button
            onclick={loadUrls}
            class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
        >
            読み込み
        </button>
    </div>

    <hr class="border-zinc-700" />

    <!-- iframe動画エリア -->
    <div class="w-full h-64 bg-black rounded-md overflow-hidden">
        {#if currentUrl}
            <iframe
                src={currentUrl}
                class="w-full h-full"
                allow="autoplay"
                frameborder="0"
            ></iframe>
        {:else}
            <div class="flex items-center justify-center h-full text-zinc-400">
                ここに動画が表示されます
            </div>
        {/if}
    </div>

    <!-- コントロールバー -->
    <div class="flex items-center justify-center gap-4">
        <button
            onclick={togglePlayback}
            class="rounded-full bg-green-600 hover:bg-green-500 text-white p-3"
        >
            {#if isPlaying}
                <PauseIcon class="w-6 h-6" />
            {:else}
                <PlayIcon class="w-6 h-6" />
            {/if}
        </button>
        <span class="text-sm text-zinc-300">
            {currentIndex + 1} / {urls.length}
        </span>
    </div>

    <!-- プレイリスト表示 -->
    <ul class="space-y-2">
        {#each urls as url, i}
            <li
                class="flex justify-between items-center px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition"
            >
                <span class="truncate text-sm">{url}</span>
                <button
                    onclick={() => play(i)}
                    class="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
                >
                    <PlayIcon class="w-4 h-4" />
                </button>
            </li>
        {/each}
    </ul>
</div>
