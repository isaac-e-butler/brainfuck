import { ProgramExitController } from "./runtime/index.js";
import { Editor } from "./editor/index.js";
import { Status } from "./status/index.js";

export const playButton = document.getElementById("play");

export const output = document.getElementById("output");

export const input = document.getElementById("input");
export const inputForm = document.getElementById("input-form");

export const icons = {
    stop: "./src/icons/states/stop.svg",
    play: "./src/icons/states/play.svg",
    paste: "./src/icons/actions/paste.svg",
    pasteDisabled: "./src/icons/actions/paste-disabled.svg",
};

export const editor = new Editor();
export const status = new Status();
export const program = new ProgramExitController();
