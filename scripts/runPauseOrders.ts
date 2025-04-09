import { pauseOrdersJob } from "../jobs/pauseOrdersJob";
import { Logger } from "winston";
import mongoose from "mongoose";
import {keys} from "../config/keys";

const logger: Logger = console as unknown as Logger;

const runJob = async () => {
    await mongoose.connect(keys.dbAtlas, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    });

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