<script lang="ts">
    import { contentTemplateMap } from "$lib/content-schema";
    import {
        makeNicovideoThumbnailURL,
        makeSoundCloudThumbnailURL,
        makeYouTubeThumbnailURL,
        parseAudioEmbedSoundCloud,
        parseVideoEmbedNicovideo,
        parseVideoEmbedYouTube,
    } from "$lib/embed";
    import { SiteInfo, findIn } from "$lib/whitelist/site-info";
    import { PlayIcon } from "@lucide/svelte";

    let {
        contentUrl = "",
        contentType = 0,
        isActive = false,
        onclick = $bindable(),
    } = $props();

    let siteInfo: SiteInfo | null = $state(null);
    const temp = contentTemplateMap.get(contentType) ?? [];
    try {
        siteInfo = findIn(temp, new URL(contentUrl).hostname);
    } catch (err) {}

    let embedding = $state(false);
    let embedError = $state(false);
    let embedUrl = $state("");
    let videoEmbedYouTube = $state(false);
    let videoEmbedNicovideo = $state(false);
    let audioEmbedSoundCloud = $state(false);
    const tryEmbed = (siteInfo: SiteInfo) => {
        try {
            embedding = true;
            const url = new URL(contentUrl);
            switch (siteInfo.id) {
                case 1601: {
                    videoEmbedYouTube = true;
                    const parsed = parseVideoEmbedYouTube(url);
                    if (parsed) {
                        embedUrl = makeYouTubeThumbnailURL(parsed);
                    }
                    break;
                }
                case 1602: {
                    videoEmbedNicovideo = true;
                    const parsed = parseVideoEmbedNicovideo(url);
                    if (parsed) {
                        embedUrl = makeNicovideoThumbnailURL(parsed);
                    }
                    break;
                }
                case 3201: {
                    audioEmbedSoundCloud = true;
                    const parsed = parseAudioEmbedSoundCloud(url);
                    if (parsed) {
                        embedUrl = makeSoundCloudThumbnailURL(parsed);
                    }
                    break;
                }
            }
            if (!embedUrl) throw 114514;
        } catch (err) {
            embedError = true;
            embedding = false;
        }
    };

    $effect(() => {
        if (siteInfo) {
            tryEmbed(siteInfo);
            if (!embedding) return;
        }
    });
</script>

<li
    class={`relative px-4 py-2 rounded-md transition min-h-[4rem] overflow-hidden
        ${
            isActive
                ? "bg-blue-700 text-white ring-2 ring-blue-400"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        }`}
>
    <!-- 背景的な埋め込み画像 -->
    <img
        src={embedUrl}
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute right-2 -top-10 h-40 w-auto opacity-30 select-none object-contain"
    />

    <!-- 本体コンテンツ -->
    <div class="relative z-10 flex justify-between items-center">
        <span class="truncate text-sm">{contentUrl}</span>
        <button
            {onclick}
            class="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
        >
            <PlayIcon class="w-4 h-4" />
        </button>
    </div>
</li>
