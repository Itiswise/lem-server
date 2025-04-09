import { clearOperatorsJob } from "../jobs/clearOperatorsJob";
import { Logger } from "winston";

const logger: Logger = console as unknown as Logger;

const runJob = async () => {
    try {
        console.log("Running 'clear_operators' job...");

        await clearOperatorsJob(logger);

        console.log("Job 'clear_operators' completed.");
    } catch (error) {
        console.error("Error running 'clear_operators':", error);
    } finally {
        process.exit(0);
    }
};

(async () => {
    await runJob();
})();