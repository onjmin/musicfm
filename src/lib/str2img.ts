export const str2img = (str: string): string => {
	const ar: number[] = [];

	for (const c of str) {
		const n = c.charCodeAt(0);
		if (n < 128) {
			ar.push(n);
		} else {
			ar.push(128);
			ar.push((n & 0xff00) >> 8); // 上位バイト
			ar.push(n & 0xff); // 下位バイト
		}
	}

	const width = Math.ceil(Math.sqrt(ar.length / 3));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = width;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("2D context not supported");

	const imgData = ctx.getImageData(0, 0, width, width);
	let cnt = 0;

	for (let i = 0; i < ar.length; i++) {
		const i4 = i * 4;
		for (let o = 0; o < 3; o++) {
			imgData.data[i4 + o] = ar[cnt++] || 0;
		}
		imgData.data[i4 + 3] = 255; // 不透明に固定
	}

	ctx.putImageData(imgData, 0, 0);
	return canvas.toDataURL("image/png");
};

export const img2str = async (imgURL: string): Promise<string> => {
	const img: HTMLImageElement = await new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject();
		image.crossOrigin = "anonymous";
		image.src = imgURL;
	});

	const width = img.width;
	const height = img.height;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("2D context not supported");

	ctx.drawImage(img, 0, 0);
	const data = ctx.getImageData(0, 0, width, height).data;

	const ar: number[] = [];
	for (let i = 0; i < data.length / 4; i++) {
		const i4 = i * 4;
		for (let o = 0; o < 3; o++) {
			ar.push(data[i4 + o]);
		}
	}

	let str = "";
	for (let p = 0; p < ar.length; p++) {
		const n = ar[p];
		if (n < 128) {
			str += String.fromCharCode(n);
		} else if (n === 128) {
			const high = ar[p + 1] ?? 0;
			const low = ar[p + 2] ?? 0;
			str += String.fromCharCode((high << 8) + low);
			p += 2;
		}
	}

	return str.replace(/\0+$/, ""); // 末尾のヌル文字を削除
};
