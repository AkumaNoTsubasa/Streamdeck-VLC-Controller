import streamDeck from "@elgato/streamdeck";

import { ConnectionSettings, VlcClient } from "./client";

/** Connection lives in global settings so every button shares one VLC target. */
export async function getConnection(): Promise<ConnectionSettings> {
	return streamDeck.settings.getGlobalSettings<ConnectionSettings>();
}

export async function createClient(): Promise<VlcClient> {
	return new VlcClient(await getConnection());
}
