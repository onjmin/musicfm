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
    let thumbnail = $state("");
    let title = $state("");
    let author = $state("");
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
                        const cache =
                            localStorage.getItem(
                                `YouTube###${parsed}###thumbnail`,
                            ) ?? "";
                        thumbnail = cache
                            ? cache
                            : makeYouTubeThumbnailURL(parsed);
                        title =
                            localStorage.getItem(
                                `YouTube###${parsed}###title`,
                            ) ?? "";
                        author =
                            localStorage.getItem(
                                `YouTube###${parsed}###author`,
                            ) ?? "";
                    }
                    break;
                }
                case 1602: {
                    videoEmbedNicovideo = true;
                    const parsed = parseVideoEmbedNicovideo(url);
                    if (parsed) {
                        const cache =
                            localStorage.getItem(
                                `Nicovideo###${parsed}###thumbnail`,
                            ) ?? "";
                        thumbnail = cache
                            ? cache
                            : makeNicovideoThumbnailURL(parsed);
                        title =
                            localStorage.getItem(
                                `Nicovideo###${parsed}###title`,
                            ) ?? "";
                        author =
                            localStorage.getItem(
                                `Nicovideo###${parsed}###author`,
                            ) ?? "";
                    }
                    break;
                }
                case 3201: {
                    audioEmbedSoundCloud = true;
                    const parsed = parseAudioEmbedSoundCloud(url);
                    if (parsed) {
                        const cache =
                            localStorage.getItem(
                                `SoundCloud###${parsed}###thumbnail`,
                            ) ?? "";
                        thumbnail = cache
                            ? cache
                            : makeSoundCloudThumbnailURL(parsed);
                        title =
                            localStorage.getItem(
                                `SoundCloud###${parsed}###title`,
                            ) ?? "";
                        author =
                            localStorage.getItem(
                                `SoundCloud###${parsed}###author`,
                            ) ?? "";
                    }
                    break;
                }
            }
            if (!thumbnail) throw 114514;
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
    <!-- 全体にかぶせるクリック用div -->
    <div
        tabindex="0"
        role="button"
        {onclick}
        onkeydown={() => {}}
        class="absolute inset-0 z-10"
    ></div>

    <!-- 行番号ラベル -->
    <span
        class="absolute top-0 left-0 h-full w-10 flex items-center justify-center
		text-white text-xs font-mono font-bold bg-blue-600
		rounded-r-md z-20 shadow-md"
    >
        {index + 1}
    </span>

    <!-- サムネ画像 -->
    <img
        src={thumbnail}
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute right-2 -top-10 h-40 w-auto opacity-30 select-none object-contain"
    />

    <!-- 本体 -->
    <div class="relative z-20 flex flex-col justify-center pointer-events-none">
        <span class="text-xs text-zinc-500 truncate">{contentUrl}</span>
        <span class="text-base font-semibold truncate">{title}</span>
        <span class="text-sm text-zinc-400 truncate">{author}</span>
    </div>
</li>
