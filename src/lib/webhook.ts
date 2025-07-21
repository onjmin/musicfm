import { format } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * DiscordのWebhookは符号化のしようがないので素の状態で使う
 */
const sendDiscordWebhook = (
	url: string,
	array: string[],
	plaintext: string[] = [],
) =>
	fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			content: [
				"```",
				format(new Date(), "yyyy年MM月dd日 HH時mm分ss秒", { locale: ja }),
				array.join("\n").replace(/`/g, ""),
				"```",
				plaintext.join("\n").replace(/`/g, ""),
			].join("\n"),
			allowed_mentions: {
				parse: [],
			},
		}),
	});

/**
 * 共有ログ
 */
export const sharedLogger = (array: string[], plaintext: string[]) =>
	sendDiscordWebhook(
		import.meta.env.VITE_DISCORD_WEBHOOK_URL_OF_SHARE,
		array,
		plaintext,
	);
