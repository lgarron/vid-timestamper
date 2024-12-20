// biome-ignore lint/style/noNonNullAssertion: Must exist
const fileInput = document.querySelector<HTMLInputElement>("#file-input")!;
// biome-ignore lint/style/noNonNullAssertion: Must exist
const videoElem = document.querySelector<HTMLVideoElement>("video")!;
const timestampListElem =
	// biome-ignore lint/style/noNonNullAssertion: Must exist
	document.querySelector<HTMLElement>("timestamp-list")!;
const copyTimestampsButton =
	// biome-ignore lint/style/noNonNullAssertion: Must exist
	document.querySelector<HTMLButtonElement>("#copy-timestamps")!;

fileInput.addEventListener("change", async () => {
	const newFile = fileInput.files?.[0];
	if (newFile) {
		videoElem.src = URL.createObjectURL(newFile);
		videoElem.focus();
	}
});

function roundToTenth(x: number): number {
	return Math.round(x * 10) / 10;
}

videoElem.addEventListener("keydown", (e) => {
	if (e.key === ",") {
		timestampListElem.appendChild(
			new TimestampEntry(roundToTenth(videoElem.currentTime)),
		);
		e.preventDefault();
		return;
	}
	if (e.key === ".") {
		const { lastChild } = timestampListElem;
		if (lastChild) {
			(lastChild as TimestampEntry).end = roundToTenth(videoElem.currentTime);
		}
		e.preventDefault();
		return;
	}
});

document.body.addEventListener("keydown", (e) => {
	if (e.key === "v") {
		videoElem.focus();
	}
});

class TimestampEntry extends HTMLElement {
	#start: number;
	#end: number | undefined;
	constructor(
		// biome-ignore lint/style/noInferrableTypes: Explicit is better than implicit.
		start: number = 0,
		end?: number,
	) {
		super();
		this.#start = start;
		this.#end = end;
	}

	get start(): number {
		return this.#start;
	}

	get end(): number | undefined {
		return this.#end;
	}

	get description(): string {
		return this.#descriptionElem.value;
	}

	set end(t: number) {
		this.#end = this.#end;
		this.#endTimestampElem.value = `${t}`;
	}

	#cachedStartTimestampElem: HTMLInputElement | undefined;
	get #startTimestampElem(): HTMLInputElement {
		if (this.#cachedStartTimestampElem) {
			return this.#cachedStartTimestampElem;
		}
		this.#cachedStartTimestampElem = this.appendChild(
			document.createElement("input"),
		);
		this.#cachedStartTimestampElem.type = "number";
		this.#cachedStartTimestampElem.step = "0.1";
		this.#cachedStartTimestampElem.value = `${this.#start}`;
		return this.#cachedStartTimestampElem;
	}

	#cachedEndTimestampElem: HTMLInputElement | undefined;
	get #endTimestampElem(): HTMLInputElement {
		if (this.#cachedEndTimestampElem) {
			return this.#cachedEndTimestampElem;
		}
		this.#cachedEndTimestampElem = this.appendChild(
			document.createElement("input"),
		);
		this.#cachedEndTimestampElem.type = "number";
		this.#cachedEndTimestampElem.step = "0.1";
		return this.#cachedEndTimestampElem;
	}

	#cachedDescriptionElem: HTMLInputElement | undefined;
	get #descriptionElem(): HTMLInputElement {
		if (this.#cachedDescriptionElem) {
			return this.#cachedDescriptionElem;
		}
		this.#cachedDescriptionElem = this.appendChild(
			document.createElement("input"),
		);
		this.#cachedDescriptionElem.type = "text";
		this.#cachedDescriptionElem.placeholder = "Enter a description";
		return this.#cachedDescriptionElem;
	}

	connectedCallback() {
		this.#startTimestampElem;
		this.#endTimestampElem;
		this.#descriptionElem;
	}
}

customElements.define("timestamp-entry", TimestampEntry);

copyTimestampsButton.addEventListener("click", () => {
	console.log("Collecting timestamps…");
	const lines: string[] = [];
	for (const uncastEntry of timestampListElem.children) {
		console.log(uncastEntry);
		const entry = uncastEntry as TimestampEntry;
		let line = `${entry.start}`;
		if (entry.end) {
			line += ` ${entry.end}`;
		}
		line += ` ${entry.description}`;
		lines.push(line);
	}
	const text = lines.join("\n");
	console.log(text);
	navigator.clipboard.writeText(text);
});
