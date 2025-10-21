import { status } from "../components/index.js";

export async function waitForExitCode(controller) {
    return await new Promise(async (resolve, reject) => {
        const handleExit = (event) => {
            const { exitCode, error } = event.detail;

            switch (exitCode) {
                case 0: {
                    status.addInfo("Program exited successfully");
                    resolve();
                    break;
                }
                case 2: {
                    reject(error);
                    break;
                }
                case 3: {
                    status.addError("Program was aborted");
                    resolve();
                    break;
                }
                case 1:
                default: {
                    reject("Error: Unknown");
                    break;
                }
            }
        };

        controller.addExitCodeListener(handleExit);
    });
}
