import { effect, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { Tweet } from "./tweet";

const CHARACTER_WIDTH = 115;
const CHARACTER_HEIGHT = 210;
const CANVAS_MARGIN_X = 50;
const CANVAS_MARGIN_Y = 20;
const characters: Record<string, { x: number; y: number }> = {
	オ: { x: 150, y: 250 },
	ー: { x: 262, y: 250 },
	イ: { x: 380, y: 250 },
	シ: { x: 490, y: 250 },
	マ: { x: 150, y: 457 },
	サ: { x: 262, y: 457 },
	ヨ: { x: 375, y: 457 },
	ブ: { x: 95, y: 660 },
	ド: { x: 205, y: 660 },
	カ: { x: 430, y: 660 },
	ン: { x: 545, y: 660 },
};
const specialCharacters = ["\n", " ", "　"] as const;
const acceptableCharacters = Object.keys(characters).concat(specialCharacters);
const notAcceptableRe = new RegExp(`[^${acceptableCharacters.join("")}]`, "g");
export function App() {
	const text$ = useSignal(" オーイシ\n マサヨシ\nブドーカン");
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const image = new Image();
		image.onload = render;
		image.crossOrigin = "anonymous";
		image.src = "https://pbs.twimg.com/media/GjwKtiKbUAA6bFx?format=jpg";

		function render() {
			const text = escapeText(text$.value);
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			const lines = text.split("\n");
			canvas.width =
				Math.max(...lines.map(calcLineWidth)) + CANVAS_MARGIN_X * 2;
			canvas.height = lines.length * CHARACTER_HEIGHT + CANVAS_MARGIN_Y * 2;
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				let x = CANVAS_MARGIN_X;
				for (let j = 0; j < line.length; j++) {
					const c = line[j];
					if (c === " ") {
						x += CHARACTER_WIDTH / 2;
						continue;
					}
					if (c === "　") {
						x += CHARACTER_WIDTH;
						continue;
					}
					const character = characters[c];
					if (!character) continue;
					ctx.drawImage(
						image,
						character.x,
						character.y,
						CHARACTER_WIDTH,
						CHARACTER_HEIGHT,
						x,
						i * CHARACTER_HEIGHT + CANVAS_MARGIN_Y,
						CHARACTER_WIDTH,
						CHARACTER_HEIGHT,
					);
					x += CHARACTER_WIDTH;
				}
			}
		}
		return effect(render);
	}, [text$]);

	return (
		<main class="flex flex-col items-center gap-1 p-1">
			<form
				class="flex flex-col gap-1 items-center"
				onSubmit={(e) => {
					e.preventDefault();
					if (!canvasRef.current) return;
					const canvas = canvasRef.current;
					canvas.toBlob((blob) => {
						if (!blob) return;
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = "oishi.png";
						a.click();
					});
				}}
			>
				<textarea
					class="w-full border border-slate-300 rounded py-1 px-2 field-sizing-content"
					value={text$}
					onInput={(e) => {
						text$.value = e.currentTarget.value;
					}}
					onBlur={(e) => {
						text$.value = escapeText(e.currentTarget.value);
					}}
				/>
				<canvas ref={canvasRef} class="max-w-full border border-slate-300" />
				<button
					type="submit"
					class="font-bold text-xl bg-blue-400 text-white py-2 px-4 rounded"
				>
					ダウンロード
				</button>
			</form>
			<Tweet />
		</main>
	);
}

function escapeText(text: string) {
	return hiraToKata(text).replace(notAcceptableRe, "");
}
function calcLineWidth(line: string) {
	return line.split("").reduce((acc, c) => {
		if (c === " ") return acc + CHARACTER_WIDTH / 2;
		if (c === "　") return acc + CHARACTER_WIDTH;
		return acc + CHARACTER_WIDTH;
	}, 0);
}
function hiraToKata(hira: string) {
	return hira
		.replace(/お/g, "オ")
		.replace(/ー/g, "ー")
		.replace(/い/g, "イ")
		.replace(/し/g, "シ")
		.replace(/ま/g, "マ")
		.replace(/さ/g, "サ")
		.replace(/よ/g, "ヨ")
		.replace(/ぶ/g, "ブ")
		.replace(/ど/g, "ド")
		.replace(/か/g, "カ")
		.replace(/ん/g, "ン");
}
