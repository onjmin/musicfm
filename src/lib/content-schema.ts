import * as v from "valibot";
import whitelistAudio from "./whitelist/audio.js";
import { findIn } from "./whitelist/site-info.js";
import whitelistVideo from "./whitelist/video.js";

const SAFE_TEXT = v.pipe(
	v.string(),
	v.trim(),
	v.maxLength(256),
	// 制御文字
	v.check(
		(input) =>
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>]
			!/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/u.test(input),
	),
	// 双方向テキスト制御
	v.check((input) => !/[\u202A-\u202E\u2066-\u2069\uFFF9-\uFFFB]/u.test(input)),
	// ゼロ幅・不可視・プライベートユースエリア
	v.check(
		(input) =>
			!/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF\u180E\uE000-\uF8FF]/u.test(
				input,
			),
	),
	// サロゲートペア全排除
	v.check((input) => !/[\uD800-\uDFFF]/u.test(input)),
);
const regexLf = /\n/;
const SAFE_URL = v.pipe(
	SAFE_TEXT,
	v.check((input) => !regexLf.test(input)),
	v.url(), // 暗黙的に空文字が許容されなくなる
);

export const VIDEO_URL = v.pipe(
	SAFE_URL,
	v.check((input) => !!findIn(whitelistVideo, new URL(input).hostname)),
);

export const AUDIO_URL = v.pipe(
	SAFE_URL,
	v.check((input) => !!findIn(whitelistAudio, new URL(input).hostname)),
);

export const Enum = {
	Video: 16,
	Audio: 32,
} as const;

/**
 * GUI用
 * content_typeに対応するテンプレ
 */
export const contentTemplateMap = new Map(
	Object.entries({
		[Enum.Video]: whitelistVideo,
		[Enum.Audio]: whitelistAudio,
	}).map(([k, v]) => [Number(k), v]),
);
