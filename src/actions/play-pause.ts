import { action, KeyDownEvent } from "@elgato/streamdeck";

import { VlcStatus } from "../vlc/client";
import { createClient } from "../vlc/connection";
import { StatusDrivenAction } from "./base";

const STATE_NOT_PLAYING = 0;
const STATE_PLAYING = 1;

@action({ UUID: "com.akuma.vlc-controller.play-pause" })
export class PlayPause extends StatusDrivenAction {
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		try {
			await (await createClient()).playPause();
		} catch {
			await ev.action.showAlert();
		}
	}

	protected render(status: VlcStatus | null): void {
		const state = status?.state === "playing" ? STATE_PLAYING : STATE_NOT_PLAYING;
		for (const action of this.actions) {
			if (action.isKey()) {
				void action.setState(state);
			}
		}
	}
}
