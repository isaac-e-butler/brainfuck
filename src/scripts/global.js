import { ProgramExitController } from "./runtime/index.js";
import { Editor } from "./editor/index.js";
import { Status } from "./status/index.js";
import { attachActivationEvent } from "./helpers/index.js";

export const playButton = document.getElementById("play");
attachActivationEvent(playButton);

export const shareButton = document.getElementById("share");
attachActivationEvent(shareButton);

export const output = document.getElementById("output");
export const input = document.getElementById("input");
export const inputForm = document.getElementById("input-form");
export const submit = document.getElementById("input-submit");
attachActivationEvent(submit);

export const editor = new Editor();
export const status = new Status();
export const program = new ProgramExitController();
