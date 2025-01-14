import {Agenda} from "@hokify/agenda";
import { keys } from "./config/keys";
import {pauseOrdersJob} from "./jobs/pauseOrdersJob";
import {Logger} from "winston";

export const initAgenda = async function(logger: Logger): Promise<void> {
    const agenda = new Agenda(
        {
            db: {
                address: keys.dbAtlas,
                collection: "agendaJobs",
            }
        }
    );

    const cronExpression = '0 13 * * *';

    agenda.define('pause_orders', async function() {
      await pauseOrdersJob(logger);
    });

    await agenda.start();

    await agenda.every(cronExpression, 'pause_orders');

    async function graceful() {
        await agenda.stop();
        await agenda.cancel({name: 'pause_orders'});
        process.exit(0);
    }

    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);
}