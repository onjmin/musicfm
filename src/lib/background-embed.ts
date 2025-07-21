const saveCache = (
	cachedKey: string,
	thumbnail: string | null,
	title: string | null,
	author: string | null,
) => {
	if (thumbnail) localStorage.setItem(`${cachedKey}###thumbnail`, thumbnail);
	if (title) localStorage.setItem(`${cachedKey}###title`, title);
	if (author) localStorage.setItem(`${cachedKey}###author`, author);
};

let userActionDone = false;

/**
 * 初回遷移時、ユーザーの初回タップがなければ自動再生不可
 */
const handleUserAction = (callback: () => void) => {
	if (userActionDone) return;
	const play = () => {
		userActionDone = true;
		callback();
		window.removeEventListener("click", play);
		window.removeEventListener("touchstart", play);
	};
	window.addEventListener("click", play);
	window.addEventListener("touchstart", play);
};

export let activeController: Controller | null = null;
export const clearActiveController = () => {
	activeController = null;
};
let g_callback = () => {};
export const onEnded = (callback: () => void) => {
	g_callback = callback;
};

const youTubeVolume = 64;
const nicovideoVolume = 96;
let soundCloudVolume = 32;
// スマホ版の音量調整
if (globalThis?.window && globalThis.window.innerWidth < 768) {
	soundCloudVolume = 64;
}

type Controller = {
	target: any | null;
	play(): void;
	pause(): void;
	seekTo0(): void;
};
type NicovideoController = Controller & {
	origin: string;
	post(data: object): void;
};
const youTubeController = new (class implements Controller {
	target: any | null = null;
	play() {
		this.target?.setVolume(youTubeVolume);
		this.target?.playVideo();
		this.target?.setLoop(true);
	}
	pause() {
		this.target?.pauseVideo();
	}
	seekTo0() {
		this.target?.seekTo(0);
	}
})();
const nicovideoController = new (class implements NicovideoController {
	target: HTMLIFrameElement | null = null;
	origin = "https://embed.nicovideo.jp";
	play() {
		this.post({
			eventName: "volumeChange",
			data: { volume: nicovideoVolume / 100 },
		});
		this.post({ eventName: "play" });
	}
	pause() {
		this.post({ eventName: "pause" });
	}
	seekTo0() {
		this.post({ eventName: "seek", data: { time: 0 } });
	}
	post(data: object) {
		this.target?.contentWindow?.postMessage(
			Object.assign(
				{
					sourceConnectorType: 1,
				},
				data,
			),
			this.origin,
		);
	}
})();
const soundCloudController = new (class implements Controller {
	target: any | null = null;
	play() {
		this.target?.setVolume(soundCloudVolume);
		this.target?.play();
	}
	pause() {
		this.target?.pause();
	}
	seekTo0() {
		this.target?.seekTo(0);
	}
})();

declare global {
	var YT: any;
	var onYouTubeIframeAPIReady: () => void;
}
export const embedYouTube = ({
	cachedKey,
	iframeParentDOM,
	embedUrl,
	width,
	height,
}: {
	cachedKey: string;
	iframeParentDOM: Element | null;
	embedUrl: string;
	width: number;
	height: number;
}) => {
	if (!iframeParentDOM) return;
	activeController = youTubeController;
	const videoId = embedUrl.split("/").slice(-1)[0];
	const onYouTubeIframeAPIReady = () => {
		new window.YT.Player(iframeParentDOM, {
			width,
			height,
			videoId,
			playerVars: {
				playsinline: 1,
			},
			events: {
				onReady: (event: any) => {
					youTubeController.target = event.target;
					youTubeController.play();
					const data = event.target.getVideoData();
					const thumbnail = null;
					const title = data.title;
					const author = data.author;
					saveCache(cachedKey, thumbnail, title, author);
				},
				onError: console.error,
				onStateChange: (event: any) => {
					switch (event.target.getPlayerState?.()) {
						case YT.PlayerState.ENDED:
							g_callback();
							break;
					}
				},
			},
		});
	};
	if (window.YT) setTimeout(onYouTubeIframeAPIReady);
	else {
		window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
		handleUserAction(() => youTubeController.play());
	}
};

let g_cachedKey = "";
export const embedNicovideo = ({
	cachedKey,
	iframeDOM,
}: {
	cachedKey: string;
	iframeDOM: HTMLIFrameElement | null;
}) => {
	if (!iframeDOM) return;
	activeController = nicovideoController;
	g_cachedKey = cachedKey;
	nicovideoController.target = iframeDOM;
	window.removeEventListener("message", handle);
	window.addEventListener("message", handle);
	handleUserAction(() => nicovideoController.play());
};
const handle = (e: MessageEvent) => {
	if (e.origin !== nicovideoController.origin) return;
	const { data } = e.data;
	switch (e.data.eventName) {
		case "playerStatusChange": {
			switch (data.playerStatus) {
				case 4:
					g_callback();
					break;
			}
			break;
		}
		case "loadComplete": {
			nicovideoController.play();
			const thumbnail = data.videoInfo.thumbnailUrl;
			const title = data.videoInfo.title;
			const author = null;
			const videoId = data.videoInfo.videoId.slice(2);
			if (`Nicovideo###${videoId}` === g_cachedKey) {
				saveCache(g_cachedKey, thumbnail, title, author);
			}
			break;
		}
	}
};

declare global {
	var SC: any;
}
export const embedSoundCloud = ({
	cachedKey,
	iframeDOM,
}: {
	cachedKey: string;
	iframeDOM: HTMLIFrameElement | null;
}) => {
	if (!iframeDOM) return;
	activeController = soundCloudController;
	const ready = () => {
		soundCloudController.target = window.SC.Widget(iframeDOM);
		soundCloudController.target?.bind(window.SC.Widget.Events.READY, () => {
			soundCloudController.play();
			soundCloudController.target.getCurrentSound((res: any) => {
				const thumbnail = res.artwork_url || res.user.avatar_url;
				const title = res.title;
				const author = res.user.username;
				saveCache(cachedKey, thumbnail, title, author);
			});
		});
		soundCloudController.target?.bind(window.SC.Widget.Events.FINISH, () =>
			g_callback(),
		);
		soundCloudController.target?.bind(
			window.SC.Widget.Events.ERROR,
			console.error,
		);
	};
	if (window.SC?.Widget) setTimeout(ready);
	else {
		const id = setInterval(() => {
			if (!window.SC?.Widget) return;
			clearInterval(id);
			ready();
			handleUserAction(() => soundCloudController.play());
		}, 512);
	}
};
