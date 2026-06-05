import { action, KeyDownEvent, KeyUpEvent, SingletonAction, WillDisappearEvent } from "@elgato/streamdeck";

import { VLC_VOLUME_FULL } from "../vlc/client";
import { createClient } from "../vlc/connection";

type VolumeSettings = {
	stepPercent?: number;
	capAt100?: boolean;
};

const DEFAULT_STEP_PERCENT = 5;
const HOLD_INTERVAL_MS = 300;

/** Tap applies one step; holding ramps continuously, accumulating locally without re-reading status each tick. */
abstract class VolumeAction extends SingletonAction<VolumeSettings> {
	protected abstract readonly direction: 1 | -1;

	readonly #holds = new Map<string, ReturnType<typeof setInterval>>();

	override async onKeyDown(ev: KeyDownEvent<VolumeSettings>): Promise<void> {
		const stepPercent = ev.payload.settings.stepPercent ?? DEFAULT_STEP_PERCENT;
		const stepUnits = Math.round((stepPercent / 100) * VLC_VOLUME_FULL) * this.direction;
		const cap = this.direction === 1 && (ev.payload.settings.capAt100 ?? true);

		try {
			const client = await createClient();
			const status = await client.getStatus();
			let target = status.volume;

			const apply = async (): Promise<void> => {
				target = clampVolume(target + stepUnits, cap);
				await client.setVolume(String(target));
			};

			await apply();
			this.#holds.set(ev.action.id, setInterval(() => void this.#tick(ev.action.id, apply), HOLD_INTERVAL_MS));
		} catch {
			this.#stop(ev.action.id);
			await ev.action.showAlert();
		}
	}

	override onKeyUp(ev: KeyUpEvent<VolumeSettings>): void {
		this.#stop(ev.action.id);
	}

	override onWillDisappear(ev: WillDisappearEvent<VolumeSettings>): void {
		this.#stop(ev.action.id);
	}

	async #tick(id: string, apply: () => Promise<void>): Promise<void> {
		try {
			await apply();
		} catch {
			this.#stop(id);
		}
	}

	#stop(id: string): void {
		const timer = this.#holds.get(id);
		if (timer !== undefined) {
			clearInterval(timer);
			this.#holds.delete(id);
		}
	}
}

function clampVolume(value: number, cap: boolean): number {
	if (value < 0) {
		return 0;
	}
	if (cap && value > VLC_VOLUME_FULL) {
		return VLC_VOLUME_FULL;
	}
	return value;
}

@action({ UUID: "com.akuma.vlc-controller.volume-up" })
export class VolumeUp extends VolumeAction {
	protected readonly direction = 1;
}

@action({ UUID: "com.akuma.vlc-controller.volume-down" })
export class VolumeDown extends VolumeAction {
	protected readonly direction = -1;
}
