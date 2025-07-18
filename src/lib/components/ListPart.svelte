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
        index = 0,
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
    class={`relative pl-12 pr-4 py-2 rounded-md transition min-h-[4rem] overflow-hidden
		${
            isActive
                ? "bg-blue-700 text-white ring-2 ring-blue-400"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        }`}
>
    <div tabindex="0" role="button" onkeydown={() => {}} {onclick}>
        <!-- 行番号ラベル -->
        <span
            class="absolute top-0 left-0 h-full w-10 flex items-center justify-center
			text-white text-xs font-mono font-bold bg-blue-600
			rounded-r-md z-20 shadow-md"
        >
            {index + 1}
        </span>

        <!-- 埋め込み画像 -->
        <img
            src={embedUrl}
            alt=""
            aria-hidden="true"
            class="pointer-events-none absolute right-2 -top-10 h-40 w-auto opacity-30 select-none object-contain"
        />

        <!-- 本体 -->
        <div class="relative z-10 flex items-center gap-2">
            <div class="flex justify-between items-center flex-1 gap-2">
                <span class="truncate text-sm">{contentUrl}</span>
            </div>
        </div>
    </div>
</li>
