import { attachActivationEvent } from "./helpers/index.js";
import { Editor } from "./editor/index.js";
import { Status } from "./status/index.js";
import { Input } from "./input/index.js";
import { Output } from "./output/index.js";

export const playButton = document.getElementById("play");
attachActivationEvent(playButton);

export const shareButton = document.getElementById("share");
attachActivationEvent(shareButton);

export const editor = new Editor();
export const status = new Status();
export const input = new Input();
export const output = new Output();
