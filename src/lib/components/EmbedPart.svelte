<script lang="ts">
  import {
    clearActiveController,
    embedNicovideo,
    embedSoundCloud,
    embedYouTube,
  } from "$lib/background-embed";
  import { contentTemplateMap } from "$lib/content-schema";
  import {
    parseAudioEmbedSoundCloud,
    parseVideoEmbedNicovideo,
    parseVideoEmbedYouTube,
  } from "$lib/embed";
  import { SiteInfo, findIn } from "$lib/whitelist/site-info";

  let { contentUrl = "", contentType = 0 } = $props();

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
        case 1601:
          videoEmbedYouTube = true;
          embedUrl = parseVideoEmbedYouTube(url) ?? "";
          if (embedUrl)
            embedYouTube({
              iframeParentDOM: document.querySelector(".middle-wrapper"),
              embedUrl,
              width,
              height,
            });
          break;
        case 1602:
          videoEmbedNicovideo = true;
          embedUrl = parseVideoEmbedNicovideo(url) ?? "";
          if (embedUrl)
            embedNicovideo({
              iframeDOM: document.querySelector("#musicfm-embed iframe"),
            });
          break;
        case 3201:
          audioEmbedSoundCloud = true;
          embedUrl = parseAudioEmbedSoundCloud(url) ?? "";
          if (embedUrl)
            embedSoundCloud({
              iframeDOM: document.querySelector("#musicfm-embed iframe"),
            });
          break;
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
    return () => {
      clearActiveController();
    };
  });

  let width = $state(0);
  let height = $state(0);
  const onResize = () => {
    const w = window.innerWidth * 0.7;
    const h = window.innerHeight * 0.7;
    let w2 = 0;
    let h2 = 0;
    if (w < h) {
      w2 = w;
      h2 = w2 * (9 / 16);
    } else {
      h2 = h * 0.6;
      w2 = h2 * (16 / 9);
    }
    width = w2 | 0;
    height = h2 | 0;
  };

  $effect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });
</script>

{#if embedding}
  <div id="musicfm-embed" class="w-full h-full">
    <div class="middle-wrapper w-full h-full">
      {#if videoEmbedYouTube}
        <script src="https://www.youtube.com/iframe_api"></script>
        <iframe
          class="w-full h-full block"
          title="embed"
          src={embedUrl}
          {width}
          {height}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          frameborder="0"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      {:else if videoEmbedNicovideo}
        <iframe
          class="w-full h-full block"
          title="embed"
          src={embedUrl}
          {width}
          {height}
          allow="autoplay"
          allowfullscreen
        ></iframe>
      {:else if audioEmbedSoundCloud}
        <script src="https://w.soundcloud.com/player/api.js"></script>
        <iframe
          class="w-full h-full block"
          title="embed"
          src={embedUrl}
          {width}
          {height}
          allow="autoplay"
          scrolling="no"
          frameborder="no"
        ></iframe>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* YT.PlayerによってSvelte用のセレクタから外れてしまうため */
  :global(#musicfm-embed iframe) {
    border-radius: 12px;
  }
</style>
