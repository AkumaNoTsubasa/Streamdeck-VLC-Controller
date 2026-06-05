import { action, KeyDownEvent, KeyUpEvent, SingletonAction, WillDisappearEvent } from "@elgato/streamdeck";
import { pathToFileURL } from "node:url";

import { createClient } from "../vlc/connection";

type PlaylistSettings = {
	playlistPath?: string;
};

const HOLD_THRESHOLD_MS = 500;

/** Tap replaces the current playlist with the configured one; hold appends instead. */
@action({ UUID: "com.akuma.vlc-controller.load-playlist" })
export class LoadPlaylist extends SingletonAction<PlaylistSettings> {
	readonly #holdTimers = new Map<string, ReturnType<typeof setTimeout>>();

	override onKeyDown(ev: KeyDownEvent<PlaylistSettings>): void {
		const id = ev.action.id;
		this.#holdTimers.set(
			id,
			setTimeout(() => {
				this.#holdTimers.delete(id);
				void this.#load(ev, true);
			}, HOLD_THRESHOLD_MS),
		);
	}

	override onKeyUp(ev: KeyUpEvent<PlaylistSettings>): void {
		const timer = this.#holdTimers.get(ev.action.id);
		if (timer !== undefined) {
			clearTimeout(timer);
			this.#holdTimers.delete(ev.action.id);
			void this.#load(ev, false);
		}
	}

	override onWillDisappear(ev: WillDisappearEvent<PlaylistSettings>): void {
		const timer = this.#holdTimers.get(ev.action.id);
		if (timer !== undefined) {
			clearTimeout(timer);
			this.#holdTimers.delete(ev.action.id);
		}
	}

	async #load(ev: KeyDownEvent<PlaylistSettings> | KeyUpEvent<PlaylistSettings>, append: boolean): Promise<void> {
		const path = ev.payload.settings.playlistPath?.trim();
		if (!path) {
			await ev.action.showAlert();
			return;
		}

		try {
			const client = await createClient();
			const uri = pathToFileURL(path).href;
			if (append) {
				await client.enqueueUri(uri);
			} else {
				await client.empty();
				await client.playUri(uri);
			}
			await ev.action.showOk();
		} catch {
			await ev.action.showAlert();
		}
	}
}
