import { ProgramExitController } from "./runtime/index.js";
import { Editor } from "./editor/index.js";
import { Status } from "./status/index.js";

export const playButton = document.getElementById("play");

export const output = document.getElementById("output");

export const input = document.getElementById("input");
export const inputForm = document.getElementById("input-form");
export const submit = document.getElementById("input-submit");

let submitActiveTimeout = undefined;
const handleSubmitActive = () => {
    clearTimeout(submitActiveTimeout);
    submit.classList.add("active");
};
const handleSubmitInactive = () => {
    submitActiveTimeout = setTimeout(() => {
        submit.classList.remove("active");
    }, 150);
};

submit.addEventListener("touchstart", handleSubmitActive);
submit.addEventListener("touchend", handleSubmitInactive);
submit.addEventListener("touchcancel", handleSubmitInactive);

submit.addEventListener("mousedown", handleSubmitActive);
submit.addEventListener("mouseup", handleSubmitInactive);
submit.addEventListener("mouseleave", handleSubmitInactive);

export const editor = new Editor();
export const status = new Status();
export const program = new ProgramExitController();
