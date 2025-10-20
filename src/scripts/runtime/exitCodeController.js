export class ExitCodeController extends EventTarget {
    constructor() {
        super();
        this.exited = false;
    }

    removeExitCodeListener(callback) {
        this.removeEventListener("exit", callback);
    }

    addExitCodeListener(callback) {
        this.addEventListener("exit", callback, { once: true });
    }

    exit(code, error) {
        this.exited = true;

        const event = new CustomEvent("exit", { detail: { exitCode: code, error } });
        this.dispatchEvent(event);
    }
}
