import { action } from "@elgato/streamdeck";

import { VlcStatus } from "../vlc/client";
import { StatusDrivenAction } from "./base";

type TrackTitleSettings = {
	lineLength?: number;
};

const DEFAULT_LINE_LENGTH = 10;

@action({ UUID: "com.akuma.vlc-controller.track-title" })
export class TrackTitle extends StatusDrivenAction {
	protected render(status: VlcStatus | null): void {
		const title = displayTitle(status);
		for (const action of this.actions) {
			if (!action.isKey()) {
				continue;
			}
			void action.getSettings<TrackTitleSettings>().then((settings) => {
				action.setTitle(wrapTitle(title, settings.lineLength ?? DEFAULT_LINE_LENGTH));
			});
		}
	}
}

function displayTitle(status: VlcStatus | null): string {
	const meta = status?.information?.category?.meta;
	if (!meta) {
		return "";
	}

	const title = meta.title?.trim();
	if (title) {
		return title;
	}

	const filename = meta.filename?.trim();
	return filename ? filename.replace(/\.[^.]+$/, "") : "";
}

/** Stream Deck does not wrap key titles, so they are broken into lines explicitly. */
function wrapTitle(text: string, maxLength: number): string {
	if (!text) {
		return "";
	}

	const lines: string[] = [];
	let line = "";

	const flush = (): void => {
		if (line) {
			lines.push(line);
			line = "";
		}
	};

	for (const word of text.split(/\s+/)) {
		if (word.length > maxLength) {
			flush();
			for (let i = 0; i < word.length; i += maxLength) {
				const chunk = word.slice(i, i + maxLength);
				if (chunk.length === maxLength) {
					lines.push(chunk);
				} else {
					line = chunk;
				}
			}
		} else if (!line) {
			line = word;
		} else if (line.length + 1 + word.length <= maxLength) {
			line += " " + word;
		} else {
			flush();
			line = word;
		}
	}
	flush();

	return lines.join("\n");
}
