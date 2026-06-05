export type ConnectionSettings = {
	host?: string;
	port?: string;
	password?: string;
};

export type VlcStatus = {
	state: "playing" | "paused" | "stopped";
	volume: number;
	currentplid?: number;
	random?: boolean;
	loop?: boolean;
	repeat?: boolean;
	information?: {
		category?: {
			meta?: Record<string, string>;
		};
	};
};

export const VLC_VOLUME_FULL = 256;

const REQUEST_TIMEOUT_MS = 4000;

export class VlcUnreachableError extends Error {}

export class VlcClient {
	readonly #base: string;
	readonly #authorization: string;

	constructor(connection: ConnectionSettings) {
		const host = connection.host?.trim() || "127.0.0.1";
		const port = connection.port?.trim() || "8080";
		this.#base = `http://${host}:${port}/requests`;
		this.#authorization = "Basic " + Buffer.from(`:${connection.password ?? ""}`).toString("base64");
	}

	async getStatus(): Promise<VlcStatus> {
		return this.#getJson("/status.json");
	}

	play(): Promise<void> {
		return this.#command("pl_forceresume");
	}

	pause(): Promise<void> {
		return this.#command("pl_forcepause");
	}

	playPause(): Promise<void> {
		return this.#command("pl_pause");
	}

	stop(): Promise<void> {
		return this.#command("pl_stop");
	}

	next(): Promise<void> {
		return this.#command("pl_next");
	}

	toggleRandom(): Promise<void> {
		return this.#command("pl_random");
	}

	toggleLoop(): Promise<void> {
		return this.#command("pl_loop");
	}

	toggleRepeat(): Promise<void> {
		return this.#command("pl_repeat");
	}

	previous(): Promise<void> {
		return this.#command("pl_previous");
	}

	setVolume(value: string): Promise<void> {
		return this.#command("volume", { val: value });
	}

	playUri(uri: string): Promise<void> {
		return this.#command("in_play", { input: uri });
	}

	enqueueUri(uri: string): Promise<void> {
		return this.#command("in_enqueue", { input: uri });
	}

	empty(): Promise<void> {
		return this.#command("pl_empty");
	}

	async #command(command: string, params: Record<string, string> = {}): Promise<void> {
		const query = new URLSearchParams({ command, ...params });
		await this.#getJson(`/status.json?${query.toString()}`);
	}

	async #getJson<T = VlcStatus>(path: string): Promise<T> {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
		try {
			const response = await fetch(this.#base + path, {
				headers: { Authorization: this.#authorization },
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new VlcUnreachableError(`VLC responded with status ${response.status}`);
			}
			return (await response.json()) as T;
		} catch (cause) {
			if (cause instanceof VlcUnreachableError) {
				throw cause;
			}
			throw new VlcUnreachableError("Could not reach VLC", { cause });
		} finally {
			clearTimeout(timeout);
		}
	}
}
