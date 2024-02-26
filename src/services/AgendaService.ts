import Agenda from 'agenda';
import { Logger } from "@/utils";
import { PollService } from './PollCheckService';
import { AuthService } from './AuthService';

const dbPath = process.env.DATABASE_PATH || '';
const dbPassword = process.env.DATABASE_PASSWORD || '';

const connectionString = dbPath.replace('<password>', dbPassword);

const agenda = new Agenda({
  db: { address: connectionString, collection: 'agendaJobs' }
});

agenda.define('check poll status', async () => {
  await PollService.startPollCheckService();
});


agenda.define('update validation tokens', async () => {
  Logger.log('Running a job at 01:00 to update verification tokens');
  await AuthService.updateValidationToken();
});

agenda.on('start', job => Logger.log(`Job ${job.attrs.name} started`));
agenda.on('complete', job => Logger.log(`Job ${job.attrs.name} finished`));
agenda.on('fail', (err, job) => Logger.log(`Job ${job.attrs.name} failed with error: ${err.message}`));

async function initializeAgenda() {
  await agenda.start();

  await agenda.every('1 minute', 'check poll status');
  await agenda.schedule('1 day at 01:00', 'update validation tokens', {});
}

export { agenda, initializeAgenda };
