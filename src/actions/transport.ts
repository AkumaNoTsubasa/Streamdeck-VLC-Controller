import { action } from "@elgato/streamdeck";

import { VlcClient } from "../vlc/client";
import { VlcCommandAction } from "./base";

@action({ UUID: "com.akuma.vlc-controller.play" })
export class Play extends VlcCommandAction {
	protected execute(client: VlcClient): Promise<void> {
		return client.play();
	}
}

@action({ UUID: "com.akuma.vlc-controller.pause" })
export class Pause extends VlcCommandAction {
	protected execute(client: VlcClient): Promise<void> {
		return client.pause();
	}
}

@action({ UUID: "com.akuma.vlc-controller.stop" })
export class Stop extends VlcCommandAction {
	protected execute(client: VlcClient): Promise<void> {
		return client.stop();
	}
}

@action({ UUID: "com.akuma.vlc-controller.next" })
export class Next extends VlcCommandAction {
	protected execute(client: VlcClient): Promise<void> {
		return client.next();
	}
}

@action({ UUID: "com.akuma.vlc-controller.previous" })
export class Previous extends VlcCommandAction {
	protected execute(client: VlcClient): Promise<void> {
		return client.previous();
	}
}
