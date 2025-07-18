<script lang="ts">
    import EmbedPart from "$lib/components/EmbedPart.svelte";
    import ListPart from "$lib/components/ListPart.svelte";
    import { AUDIO_URL, Enum, VIDEO_URL } from "$lib/content-schema";
    import { PauseIcon, PlayIcon } from "@lucide/svelte";
    import * as v from "valibot";

    let rawUrls = $state("");
    let urls: string[] = $state([]);
    let urlsType: number[] = $state([]);
    let isPlaying = $state(false);
    let currentIndex = $state(0);

    function loadUrls() {
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
    }

    const play = (index: number) => {
        isPlaying = true;
        currentIndex = index;
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
    <div
        class="w-full max-w-2xl mx-auto bg-black rounded-md overflow-hidden aspect-video"
    >
        {#if urls.length}
            {#key currentIndex}
                <EmbedPart
                    contentUrl={urls[currentIndex]}
                    contentType={urlsType[currentIndex]}
                />
            {/key}
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
            <ListPart
                contentUrl={url}
                contentType={urlsType[i]}
                isActive={i === currentIndex}
                onclick={() => play(i)}
            />
        {/each}
    </ul>
</div>
