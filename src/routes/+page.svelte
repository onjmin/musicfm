<script lang="ts">
    import { activeController } from "$lib/background-embed";
    import EmbedPart from "$lib/components/EmbedPart.svelte";
    import ListPart from "$lib/components/ListPart.svelte";
    import { AUDIO_URL, Enum, VIDEO_URL } from "$lib/content-schema";
    import { exampleUrls } from "$lib/example-urls";
    import { PauseIcon, PlayIcon } from "@lucide/svelte";
    import * as v from "valibot";

    let rawUrls = $state(exampleUrls);
    let urls: string[] = $state([]);
    let urlsType: number[] = $state([]);
    let isPlaying = $state(false);
    let currentIndex = $state(0);
    let initTimestamp = $state(0);

    const loadUrls = () => {
        urlsType = [];
        const lines = rawUrls.split("\n").flatMap((line) => {
            try {
                const videoUrl = v.safeParse(VIDEO_URL, line);
                if (videoUrl.success) {
                    urlsType.push(Enum.Video);
                    return [videoUrl.output];
                }
                const audioUrl = v.safeParse(AUDIO_URL, line);
                if (audioUrl.success) {
                    urlsType.push(Enum.Audio);
                    return [audioUrl.output];
                }
            } catch (err) {}
            return [];
        });
        urls = lines;
        isPlaying = true;
        currentIndex = 0;
        initTimestamp = performance.now();
    };

    const play = (index: number) => {
        isPlaying = true;
        currentIndex = index;
    };

    const togglePlayback = () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            activeController?.play();
        } else {
            activeController?.pause();
        }
    };
    $effect(() => {
        setTimeout(() => {
            loadUrls();
        });
    });
</script>

<!-- レイアウト全体 -->
<div class="max-w-3xl mx-auto p-6 space-y-6 text-white">
    <!-- iframe動画エリア -->
    <div
        class="w-full max-w-2xl mx-auto bg-black rounded-md overflow-hidden aspect-video"
    >
        {#key initTimestamp && currentIndex}
            {#if urls.length}
                <EmbedPart
                    contentUrl={urls[currentIndex]}
                    contentType={urlsType[currentIndex]}
                />
            {:else}
                <div
                    class="flex items-center justify-center h-full text-zinc-400"
                >
                    ここに動画が表示されます
                </div>
            {/if}
        {/key}
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
    <ul class="space-y-2 max-h-96 overflow-y-auto pr-1">
        {#key initTimestamp}
            {#each urls as url, i}
                <ListPart
                    contentUrl={url}
                    contentType={urlsType[i]}
                    index={i}
                    isActive={i === currentIndex}
                    onclick={() => play(i)}
                />
            {/each}
        {/key}
    </ul>

    <hr class="border-zinc-700" />

    <!-- URL入力 -->
    <div>
        <label
            for="urlInput"
            class="block mb-2 text-sm font-semibold text-zinc-300"
        >
            動画URLリスト（改行で区切って入力）
        </label>
        <textarea
            id="urlInput"
            class="w-full h-32 p-3 bg-zinc-900 text-white rounded-md border border-zinc-700 resize-none"
            placeholder="例：https://www.youtube.com/watch?v=..."
            bind:value={rawUrls}
        ></textarea>
    </div>

    <!-- 読み込みボタン -->
    <div class="text-right">
        <button
            onclick={loadUrls}
            class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
        >
            読み込み
        </button>
    </div>
</div>
