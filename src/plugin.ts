import streamDeck from "@elgato/streamdeck";

import { LoadPlaylist } from "./actions/load-playlist";
import { Loop } from "./actions/loop";
import { PlayPause } from "./actions/play-pause";
import { Shuffle } from "./actions/shuffle";
import { TrackTitle } from "./actions/track-title";
import { Next, Pause, Play, Previous, Stop } from "./actions/transport";
import { VolumeDown, VolumeUp } from "./actions/volume";

streamDeck.actions.registerAction(new Play());
streamDeck.actions.registerAction(new Pause());
streamDeck.actions.registerAction(new PlayPause());
streamDeck.actions.registerAction(new Stop());
streamDeck.actions.registerAction(new Next());
streamDeck.actions.registerAction(new Previous());
streamDeck.actions.registerAction(new VolumeUp());
streamDeck.actions.registerAction(new VolumeDown());
streamDeck.actions.registerAction(new Shuffle());
streamDeck.actions.registerAction(new Loop());
streamDeck.actions.registerAction(new LoadPlaylist());
streamDeck.actions.registerAction(new TrackTitle());

streamDeck.connect();
