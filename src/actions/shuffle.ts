import { action, KeyDownEvent } from "@elgato/streamdeck";

import { VlcStatus } from "../vlc/client";
import { createClient } from "../vlc/connection";
import { StatusDrivenAction } from "./base";

const STATE_SEQUENTIAL = 0;
const STATE_RANDOM = 1;

@action({ UUID: "com.akuma.vlc-controller.shuffle" })
export class Shuffle extends StatusDrivenAction {
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		try {
			await (await createClient()).toggleRandom();
		} catch {
			await ev.action.showAlert();
		}
	}

	protected render(status: VlcStatus | null): void {
		const state = status?.random ? STATE_RANDOM : STATE_SEQUENTIAL;
		for (const action of this.actions) {
			if (action.isKey()) {
				void action.setState(state);
			}
		}
	}
}
