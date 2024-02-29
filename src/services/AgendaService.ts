import Agenda from 'agenda';
import { Logger } from "@/utils";
import { AuthService, PollService } from './index';

class AgendaService {
  private agenda: Agenda;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || '';
    const dbPassword = process.env.DATABASE_PASSWORD || '';

    const connectionString = dbPath.replace('<password>', dbPassword);

    this.agenda = new Agenda({
      db: { address: connectionString, collection: 'agendaJobs' }
    });

    this.agenda.define('check poll status', async () => {
      await PollService.startPollCheckService();
    });

    this.agenda.define('update validation tokens', async () => {
      Logger.log('Running a job at 01:00 to update verification tokens');
      await AuthService.updateValidationToken();
    });

    this.agenda.on('start', job => Logger.log(`Job ${job.attrs.name} started`));
    this.agenda.on('complete', job => Logger.log(`Job ${job.attrs.name} finished`));
    this.agenda.on('fail', (err, job) => Logger.log(`Job ${job.attrs.name} failed with error: ${err.message}`));
  }

  async initializeAgenda() {
    await this.agenda.start();

    await this.agenda.every('1 minute', 'check poll status');
    await this.agenda.schedule('1 day at 01:00', 'update validation tokens', {});
  }

  async stopAgenda() {
    await this.agenda.stop();
  }
}

export default new AgendaService();
