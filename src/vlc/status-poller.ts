import { VlcStatus } from "./client";
import { createClient } from "./connection";

type StatusListener = (status: VlcStatus | null) => void;

const POLL_INTERVAL_MS = 1000;

/** Single poller shared by all status-driven actions; queries VLC once per interval, only while subscribed. */
class StatusPoller {
	readonly #listeners = new Set<StatusListener>();
	#timer?: ReturnType<typeof setInterval>;

	subscribe(listener: StatusListener): void {
		this.#listeners.add(listener);
		if (this.#timer === undefined) {
			void this.#poll();
			this.#timer = setInterval(() => void this.#poll(), POLL_INTERVAL_MS);
		}
	}

	unsubscribe(listener: StatusListener): void {
		this.#listeners.delete(listener);
		if (this.#listeners.size === 0 && this.#timer !== undefined) {
			clearInterval(this.#timer);
			this.#timer = undefined;
		}
	}

	async #poll(): Promise<void> {
		let status: VlcStatus | null = null;
		try {
			status = await (await createClient()).getStatus();
		} catch {
			status = null;
		}
		for (const listener of this.#listeners) {
			listener(status);
		}
	}
}

export const statusPoller = new StatusPoller();
