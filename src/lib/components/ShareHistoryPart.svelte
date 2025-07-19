<script lang="ts">
    import { base } from "$app/paths";
    import { type ImgurResponse, deleteImgur, imgurHistory } from "$lib/imgur";
    import IconX from "@lucide/svelte/icons/x";
    import { Modal } from "@skeletonlabs/skeleton-svelte";

    let open = $state(false);
    let initTimestamp = $state(0);

    let imgurList: ImgurResponse[] = $state([]);
    $effect(() => {
        if (!initTimestamp) return;
        imgurHistory.get().then((v) => {
            imgurList = v ? v : [];
        });
    });

    const toURL = (imgur: ImgurResponse) =>
        `${window.location.origin}${base}/?share=${imgur.id}`;
</script>

<Modal
    {open}
    onOpenChange={(e) => {
        open = e.open;
        if (e.open) {
            initTimestamp = performance.now();
        }
    }}
    triggerBase="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm text-white transition"
    contentBase="bg-zinc-900 text-zinc-100 p-6 space-y-6 shadow-2xl w-[480px] h-screen"
    backdropBackground="bg-black/60 backdrop-blur-sm"
    positionerJustify="justify-start"
    positionerAlign=""
    positionerPadding=""
    transitionsPositionerIn={{ x: -480, duration: 200 }}
    transitionsPositionerOut={{ x: -480, duration: 200 }}
>
    {#snippet trigger()}共有履歴{/snippet}
    {#snippet content()}
        <header class="flex justify-between">
            <h2 class="h2">共有履歴</h2>
            <button
                class="btn-icon hover:preset-tonal"
                onclick={() => {
                    open = false;
                }}><IconX /></button
            >
        </header>
        <article class="space-y-4">
            <div>
                <p class="opacity-60">ここから共有停止できます。</p>
            </div>

            {#if !imgurList.length}
                <div style="color:gray">
                    <div>NO DATA...</div>
                    <div>いまんとこ共有履歴は空っぽみたい。。</div>
                    <div>動画URLリストを共有してから出直してね。</div>
                </div>
            {:else}
                <ul class="space-y-2">
                    {#each imgurList as imgurResponse, i}
                        <li class="flex items-center gap-2 text-sm">
                            <span class="text-zinc-400">{i + 1}.</span>
                            <a
                                href={toURL(imgurResponse)}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="block flex-1 min-h-[2rem] max-w-full truncate text-blue-500 hover:underline"
                            >
                                {toURL(imgurResponse)}
                            </a>
                            <button
                                class="text-zinc-400 hover:text-red-500"
                                onclick={async () => {
                                    if (
                                        !confirm(
                                            `${imgurResponse.id}を共有停止しますか？`,
                                        )
                                    )
                                        return;
                                    try {
                                        await deleteImgur(
                                            imgurResponse.deletehash,
                                        );
                                    } catch (err) {
                                        alert(
                                            `${imgurResponse.id}の共有停止に失敗しました`,
                                        );
                                        return;
                                    }
                                    imgurList = imgurList.filter(
                                        (v) => v.id !== imgurResponse.id,
                                    );
                                    imgurHistory.set(imgurList);
                                }}
                                aria-label="共有停止"
                            >
                                <i class="lucide lucide-trash w-4 h-4"></i>
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </article>
        <footer></footer>
    {/snippet}
</Modal>
