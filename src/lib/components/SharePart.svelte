<script lang="ts">
    import { base } from "$app/paths";
    import { imgurHistory, uploadImgur } from "$lib/imgur";
    import { str2img } from "$lib/str2img";
    import { sharedLogger } from "$lib/webhook";
    import { ShareIcon } from "@lucide/svelte";
    import IconX from "@lucide/svelte/icons/x";
    import { Popover } from "@skeletonlabs/skeleton-svelte";

    let { rawUrls } = $props();

    let open = $state(false);
    let sharedUrl = $state("");
    let disabled = $state(false);

    const genURL = async () => {
        disabled = true;
        try {
            if (!rawUrls.trim().length) return;
            const dataURL = str2img(rawUrls);
            if (!dataURL) return;
            const res = await uploadImgur(dataURL);
            const json = await res.json();
            const { link, id, deletehash } = json.data;
            try {
                sharedLogger([link, id, deletehash]);
            } catch (err) {}
            if (!id) return alert("共有に失敗しました");
            imgurHistory.get().then((v) => {
                const arr = v ? v : [];
                arr.push({ link, id, deletehash });
                imgurHistory.set(arr);
            });
            const params = new URLSearchParams();
            params.set("share", id);
            sharedUrl = `${window.location.origin}${base}/?${params.toString()}`;
        } catch (err) {
        } finally {
            disabled = false;
        }
    };
</script>

<Popover
    {open}
    onOpenChange={(e) => (open = e.open)}
    positioning={{ placement: "top" }}
    triggerBase="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm text-white transition"
    contentBase="card bg-surface-800 p-4 space-y-4 max-w-[320px] w-[320px] text-white"
    arrow
    arrowBackground="!bg-surface-800"
>
    {#snippet trigger()}
        <ShareIcon class="w-4 h-4 " />共有
    {/snippet}
    {#snippet content()}
        <header class="flex justify-between">
            <p class="font-bold text-xl">動画URLリストを共有</p>
            <button
                class="btn-icon hover:preset-tonal"
                onclick={() => {
                    open = false;
                }}><IconX /></button
            >
        </header>
        <article class="space-y-4">
            <div>
                <p class="opacity-60">動画URLリストが</p>
                <p class="opacity-60">サーバーにアップロードされます。</p>
            </div>

            <div class="pt-2">
                <button
                    type="button"
                    class="btn btn-primary w-full bg-blue-500 text-white rounded hover:bg-blue-600"
                    aria-label="submit"
                    onclick={genURL}
                    {disabled}
                >
                    共有リンク生成
                </button>
            </div>

            <a
                href={sharedUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="block min-h-[2rem] max-w-full truncate text-blue-800 hover:underline"
                >{sharedUrl}</a
            >
        </article>
    {/snippet}
</Popover>
