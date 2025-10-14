import { program, status } from "../global.js";

export async function waitForExitCode(controller) {
    return await new Promise(async (resolve, reject) => {
        const handleExit = (event) => {
            controller.signal.removeEventListener("abort", processAborted);
            const { exitCode, error } = event.detail;

            switch (exitCode) {
                case 0: {
                    status.attachInfo("Program exited successfully");
                    resolve();
                    break;
                }
                case 2: {
                    reject(error);
                    break;
                }
                case 1:
                default: {
                    reject("Error: Unknown");
                    break;
                }
            }
        };

        const processAborted = () => {
            program.removeExitListener(handleExit);
            resolve();
        };

        controller.signal.addEventListener("abort", processAborted, { once: true });
        program.addExitListener(handleExit);
    });
}
