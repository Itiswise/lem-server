import { clearOperatorsJob } from "../jobs/clearOperatorsJob";
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