<script lang="ts">
    import { PauseIcon, PlayIcon, PlusIcon } from "@lucide/svelte";

    let url = "";
    let isPlaying = false;
    let currentAudio: HTMLAudioElement | null = null;

    let playlist: string[] = [];

    function addToPlaylist() {
        if (url.trim()) {
            playlist.push(url.trim());
            url = "";
        }
    }

    function playAudio(src: string) {
        if (currentAudio) {
            currentAudio.pause();
        }
        currentAudio = new Audio(src);
        currentAudio.play();
        isPlaying = true;
        currentAudio.onended = () => {
            isPlaying = false;
        };
    }

    function togglePlayback() {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                isPlaying = true;
            } else {
                currentAudio.pause();
                isPlaying = false;
            }
        }
    }
</script>

<div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold text-center">🎵 おぉんがくぷれぃやああ</h1>

    <!-- URL入力 + 追加ボタン -->
    <div class="flex gap-2">
        <input
            class="flex-1"
            placeholder="音楽のURLを入力..."
            bind:value={url}
        />
        <button onclick={addToPlaylist} title="追加">
            <PlusIcon class="w-5 h-5" />
        </button>
    </div>

    <!-- 再生・一時停止コントロール -->
    {#if currentAudio}
        <div class="flex justify-center">
            <button
                onclick={togglePlayback}
                class="text-3xl px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition transform hover:scale-105"
            >
                {#if isPlaying}
                    <PauseIcon class="w-6 h-6" />
                {:else}
                    <PlayIcon class="w-6 h-6" />
                {/if}
            </button>
        </div>
    {/if}

    <!-- プレイリスト表示 -->
    <ul class="space-y-2">
        {#each playlist as track, i}
            <li
                class="flex justify-between items-center bg-zinc-800 p-3 rounded-lg"
            >
                <span class="truncate text-sm">{track}</span>
                <button
                    onclick={() => playAudio(track)}
                    class="px-3 py-1 text-sm text-white bg-zinc-700 hover:bg-zinc-600 rounded-md shadow"
                >
                    <PlayIcon class="w-4 h-4" />
                </button>
            </li>
        {/each}
    </ul>
</div>
