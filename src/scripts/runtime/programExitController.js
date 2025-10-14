export class ProgramExitController extends EventTarget {
    constructor() {
        super();
    }

    removeExitListener(callback) {
        this.removeEventListener("exit", callback);
    }

    addExitListener(callback) {
        this.addEventListener("exit", callback, { once: true });
    }

    exit(value, error) {
        const event = new CustomEvent("exit", { detail: { exitCode: value, error } });
        this.dispatchEvent(event);
    }
}
