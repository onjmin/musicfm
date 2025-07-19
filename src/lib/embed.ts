export const parseVideoEmbedYouTube = (url: URL): string | null => {
	const path = url.pathname;
	let id = "";
	// youtu.be 短縮URLの場合: https://youtu.be/VIDEO_ID
	if (url.hostname === "youtu.be") {
		// pathname は "/VIDEO_ID" になってる
		id = path.slice(1);
	}
	// ショート動画の場合: https://www.youtube.com/shorts/VIDEO_ID
	else if (path.startsWith("/shorts/")) {
		// "/shorts/VIDEO_ID" となっているので、2 番目の要素が動画ID
		const parts = path.split("/");
		id = parts[2];
	}
	// 埋め込み済みの場合: https://www.youtube.com/embed/VIDEO_ID
	else if (path.startsWith("/embed/")) {
		const parts = path.split("/");
		id = parts[2];
	}
	// 通常の動画の場合: https://www.youtube.com/watch?v=VIDEO_ID など
	else {
		// URLSearchParams から "v" パラメータを取得
		id = url.searchParams.get("v") || "";
	}
	// 動画 ID が抽出できた場合、埋め込み URL を返す
	if (id) {
		return id;
	}
	return null;
};
export const makeYouTubeEmbedURL = (id: string) =>
	`https://www.youtube.com/embed/${id}`;
export const makeYouTubeThumbnailURL = (id: string) =>
	`https://i.ytimg.com/vi/${id}/default.jpg`;

export const parseVideoEmbedNicovideo = (url: URL): string | null => {
	const id = url.pathname.match(/sm([0-9]+)/)?.[1];
	if (id) {
		return id;
	}
	return null;
};
export const makeNicovideoEmbedURL = (id: string) =>
	`https://embed.nicovideo.jp/watch/sm${id}?jsapi=1&amp;from=0`;
export const makeNicovideoThumbnailURL = (id: string) =>
	`https://nicovideo.cdn.nimg.jp/thumbnails/${id}/${id}`;

export const parseAudioEmbedSoundCloud = (url: URL): string | null =>
	encodeURIComponent(url.href);
export const makeSoundCloudEmbedURL = (url: string) =>
	`https://w.soundcloud.com/player/?url=${url}&visual=true`;
export const makeSoundCloudThumbnailURL = (id: string) =>
	"https://logo.clearbit.com/https://soundcloud.com";
