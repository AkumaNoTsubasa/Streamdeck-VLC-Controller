import { KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";

import { VlcClient, VlcStatus } from "../vlc/client";
import { createClient } from "../vlc/connection";
import { statusPoller } from "../vlc/status-poller";

/** Base for buttons that fire a single VLC command per press; subclasses implement {@link execute}. */
export abstract class VlcCommandAction extends SingletonAction {
	protected abstract execute(client: VlcClient): Promise<void>;

	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		try {
			await this.execute(await createClient());
		} catch {
			await ev.action.showAlert();
		}
	}
}

/** Base for buttons that mirror VLC's live state via the shared poller while visible. */
export abstract class StatusDrivenAction extends SingletonAction {
	#visibleCount = 0;
	readonly #listener = (status: VlcStatus | null): void => this.render(status);

	protected abstract render(status: VlcStatus | null): void;

	override onWillAppear(_ev: WillAppearEvent): void {
		if (this.#visibleCount++ === 0) {
			statusPoller.subscribe(this.#listener);
		}
	}

	override onWillDisappear(_ev: WillDisappearEvent): void {
		if (--this.#visibleCount === 0) {
			statusPoller.unsubscribe(this.#listener);
		}
	}
}
