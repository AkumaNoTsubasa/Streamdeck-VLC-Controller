import { action, KeyDownEvent } from "@elgato/streamdeck";

import { VlcStatus } from "../vlc/client";
import { createClient } from "../vlc/connection";
import { StatusDrivenAction } from "./base";

const STATE_OFF = 0;
const STATE_ALL = 1;
const STATE_ONE = 2;

/** Cycles off -> loop whole playlist -> repeat current track -> off. */
const TARGET: ReadonlyArray<{ loop: boolean; repeat: boolean }> = [
	{ loop: false, repeat: false }, // STATE_OFF
	{ loop: true, repeat: false }, // STATE_ALL
	{ loop: false, repeat: true }, // STATE_ONE
];

@action({ UUID: "com.akuma.vlc-controller.loop" })
export class Loop extends StatusDrivenAction {
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		try {
			const client = await createClient();
			const status = await client.getStatus();
			const want = TARGET[(loopState(status) + 1) % TARGET.length];
			if (want.loop !== Boolean(status.loop)) {
				await client.toggleLoop();
			}
			if (want.repeat !== Boolean(status.repeat)) {
				await client.toggleRepeat();
			}
		} catch {
			await ev.action.showAlert();
		}
	}

	protected render(status: VlcStatus | null): void {
		const state = loopState(status);
		for (const action of this.actions) {
			if (action.isKey()) {
				void action.setState(state);
			}
		}
	}
}

function loopState(status: VlcStatus | null): number {
	if (status?.repeat) {
		return STATE_ONE;
	}
	if (status?.loop) {
		return STATE_ALL;
	}
	return STATE_OFF;
}
