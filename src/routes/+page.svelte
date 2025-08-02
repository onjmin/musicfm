<script lang="ts">
    import { page } from "$app/state";
    import { activeController, onEnded } from "$lib/background-embed";
    import EmbedPart from "$lib/components/EmbedPart.svelte";
    import ListPart from "$lib/components/ListPart.svelte";
    import ShareHistoryPart from "$lib/components/ShareHistoryPart.svelte";
    import SharePart from "$lib/components/SharePart.svelte";
    import { AUDIO_URL, Enum, VIDEO_URL } from "$lib/content-schema";
    import { exampleUrls } from "$lib/example-urls";
    import { img2str } from "$lib/str2img";
    import {
        ChevronLeftIcon,
        ChevronRightIcon,
        PauseIcon,
        PlayIcon,
        RepeatIcon,
        ShuffleIcon,
        SkipBackIcon,
    } from "@lucide/svelte";
    import { Switch } from "@skeletonlabs/skeleton-svelte";
    import * as v from "valibot";

    let rawUrls = $state(exampleUrls);
    let urls: string[] = $state([]);
    let urlsType: number[] = $state([]);
    let currentIndex = $state(0);
    let history: number[];
    let lottery = new Set<number>();
    let initTimestamp = $state(0);
    let updatedTimestamp = $state(0);
    const updateTimestamp = () => {
        updatedTimestamp = performance.now();
    };

    let isRepeat = $state(
        globalThis?.localStorage?.getItem("isRepeat") === "on",
    );
    let isShuffle = $state(
        globalThis?.localStorage?.getItem("isShuffle") === "on",
    );

    const play = (index: number) => {
        currentIndex = index;
        history.push(currentIndex);
        lottery.delete(currentIndex);
    };

    const next = () => {
        if (isShuffle) {
            if (!lottery.size) {
                lottery = new Set(urls.keys());
            }
            play([...lottery][(lottery.size * Math.random()) | 0]);
        } else {
            play(++currentIndex % urls.length);
        }
    };

    onEnded(() => {
        if (isRepeat) {
            activeController?.seekTo0();
            activeController?.play();
        } else {
            next();
        }
    });

    const loadUrls = () => {
        urlsType = [];
        history = [];
        const lines = rawUrls.split("\n").flatMap((line) => {
            const m = line.match(/https:.+?(\s|$)/);
            if (!m) return [];
            const [urlBlock] = m;
            try {
                const videoUrl = v.safeParse(VIDEO_URL, urlBlock);
                if (videoUrl.success) {
                    urlsType.push(Enum.Video);
                    return [videoUrl.output];
                }
                const audioUrl = v.safeParse(AUDIO_URL, urlBlock);
                if (audioUrl.success) {
                    urlsType.push(Enum.Audio);
                    return [audioUrl.output];
                }
            } catch (err) {}
            return [];
        });
        urls = lines;
        lottery = new Set(urls.keys());
        play(0);
        initTimestamp = performance.now();
    };

    $effect(() => {
        setTimeout(async () => {
            const share = page.url.searchParams.get("share");
            let shared = "";
            if (share) {
                try {
                    shared = await img2str(`https://i.imgur.com/${share}.png`);
                } catch (err) {}
            }
            if (
                shared.length &&
                !(shared.split("\n").length === 1 && shared.length < 1024) // 削除済み画像は読み込まない
            ) {
                rawUrls = shared;
            } else {
                const userData = localStorage.getItem("userData");
                if (userData) rawUrls = userData;
            }
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
        {#key initTimestamp}
            {#key currentIndex}
                {#if urls.length}
                    <EmbedPart
                        contentUrl={urls[currentIndex]}
                        contentType={urlsType[currentIndex]}
                        updateCache={updateTimestamp}
                    />
                {:else}
                    <div
                        class="flex items-center justify-center h-full text-zinc-400"
                    >
                        ここに動画が表示されます
                    </div>
                {/if}
            {/key}
        {/key}
    </div>

    <!-- コントロールバー -->
    <div
        class="flex flex-row flex-wrap items-center justify-center gap-4 w-full h-full"
    >
        <div class="flex items-center gap-2">
            <span class="text-sm text-zinc-300">
                {currentIndex + 1} / {urls.length}
            </span>
            <button
                onclick={() => {
                    if (isShuffle) {
                        let prev;
                        do {
                            prev = history.pop();
                        } while (prev === currentIndex && history.length);
                        if (prev !== undefined) currentIndex = prev;
                    } else {
                        play((--currentIndex + urls.length) % urls.length);
                    }
                }}
                class="p-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
                aria-label="前へ"
            >
                <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <button
                onclick={() => next()}
                class="p-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
                aria-label="次へ"
            >
                <ChevronRightIcon class="w-5 h-5" />
            </button>
        </div>

        <!-- リピート / シャッフル -->
        <div class="flex items-center gap-4">
            <Switch
                checked={isRepeat}
                onCheckedChange={(e) => {
                    isRepeat = e.checked;
                    localStorage.setItem("isRepeat", e.checked ? "on" : "off");
                }}
                controlActive="bg-blue-500"
                controlInactive="bg-zinc-500"
            >
                {#snippet inactiveChild()}<RepeatIcon size="16" />{/snippet}
                {#snippet activeChild()}<RepeatIcon size="16" />{/snippet}
            </Switch>

            <Switch
                checked={isShuffle}
                onCheckedChange={(e) => {
                    isShuffle = e.checked;
                    localStorage.setItem("isShuffle", e.checked ? "on" : "off");
                }}
                controlActive="bg-purple-500"
                controlInactive="bg-zinc-500"
            >
                {#snippet inactiveChild()}<ShuffleIcon size="16" />{/snippet}
                {#snippet activeChild()}<ShuffleIcon size="16" />{/snippet}
            </Switch>
        </div>

        <!-- 再生・停止・最初から -->
        <div class="flex items-center gap-4">
            <button
                onclick={() => activeController?.play()}
                class="rounded-full bg-green-600 hover:bg-green-500 text-white p-3"
            >
                <PlayIcon class="w-6 h-6" />
            </button>

            <button
                onclick={() => activeController?.pause()}
                class="rounded bg-red-600 hover:bg-red-500 text-white px-4 py-2"
            >
                <PauseIcon class="w-6 h-6" />
            </button>

            <button
                onclick={() => activeController?.seekTo0()}
                class="rounded bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2"
            >
                <SkipBackIcon class="w-6 h-6" />
            </button>
        </div>
    </div>

    <!-- プレイリスト表示 -->
    <ul class="space-y-2 max-h-96 overflow-y-auto pr-1">
        {#key initTimestamp}
            {#each urls as url, i}
                {#key currentIndex === i && updatedTimestamp}
                    <ListPart
                        contentUrl={url}
                        contentType={urlsType[i]}
                        index={i}
                        isActive={i === currentIndex}
                        onclick={() => play(i)}
                    />
                {/key}
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
            placeholder={`例：${exampleUrls}`}
            onkeyup={() => {
                localStorage.setItem("userData", rawUrls);
            }}
            bind:value={rawUrls}
        ></textarea>
    </div>

    <div class="text-right space-x-2">
        <ShareHistoryPart />
        <SharePart {rawUrls} />
        <button
            onclick={() => {
                rawUrls = "";
            }}
            class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md"
        >
            全消し
        </button>
        <button
            onclick={loadUrls}
            class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
        >
            読み込み
        </button>
    </div>
</div>
