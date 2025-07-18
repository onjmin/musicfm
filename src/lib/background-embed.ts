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
		this.target?.setVolume(64);
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
			data: { volume: 96 / 100 },
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
		this.target?.setVolume(32);
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
export const embedNicovideo = ({
	cachedKey,
	iframeDOM,
}: {
	cachedKey: string;
	iframeDOM: HTMLIFrameElement | null;
}) => {
	if (!iframeDOM) return;
	activeController = nicovideoController;
	nicovideoController.target = iframeDOM;
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
				saveCache(cachedKey, thumbnail, title, author);
				break;
			}
		}
	};
	window.removeEventListener("message", handle);
	window.addEventListener("message", handle);
	handleUserAction(() => nicovideoController.play());
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
