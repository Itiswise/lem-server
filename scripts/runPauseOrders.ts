import { pauseOrdersJob } from "../jobs/pauseOrdersJob";
import { Logger } from "winston";

const logger: Logger = console as unknown as Logger;

const runJob = async () => {
    try {
        console.log("Running 'pause_orders' job...");

        await pauseOrdersJob(logger);

        console.log("Job 'pause_orders' completed.");
    } catch (error) {
        console.error("Error running 'pause_orders':", error);
    } finally {
        process.exit(0);
    }
};

(async () => {
    await runJob();
})();