import Agenda from 'agenda';
import { Logger } from "@/utils";


const dbPath = process.env.DATABASE_PATH || '';
const dbPassword = process.env.DATABASE_PASSWORD || '';

const connectionString = dbPath.replace('<password>', dbPassword);

const agenda = new Agenda({
  db: { address: connectionString, collection: 'agendaJobs' },
  processEvery: '30 seconds',
});

agenda.on('start', job => Logger.log(`Job ${job.attrs.name} started`));
agenda.on('complete', job => Logger.log(`Job ${job.attrs.name} finished`));
agenda.on('fail', (err, job) => Logger.log(`Job ${job.attrs.name} failed with error: ${err.message}`));

export default agenda;
