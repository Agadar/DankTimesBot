export class CronJobMock {

  constructor(
    cronTime: string | Date,
    onTick: () => void,
    onComplete?: () => void,
    start?: boolean,
    timeZone?: string,
    context?: any,
    runOnInit?: boolean) { /**/ }

  public start(): void { /**/ }

  public stop(): void { /**/ }
}
