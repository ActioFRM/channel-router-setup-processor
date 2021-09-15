import { config } from '../config';
import log4js, { Log4js } from 'log4js';

let logger: log4js.Logger;

if (config.dev !== 'dev') {
  log4js.configure({
    appenders: {
      logstash: {
        type: '@log4js-node/logstash-http',
        url: `http://${config.logstashHost}:${config.logstashPort}/_bulk`,
        application: 'logstash-log4js',
        logType: 'application',
        logChannel: config.functionName,
      },
    },
    categories: {
      default: { appenders: ['logstash'], level: 'info' },
    },
  });

  logger = log4js.getLogger();
}

export abstract class LoggerService {
  static timeStamp(): string {
    const dateObj = new Date();

    let date = dateObj.toISOString();
    date = date.substring(0, date.indexOf('T'));

    const time = dateObj.toLocaleTimeString([], { hour12: false });

    return `${date} ${time}`;
  }

  static messageStamp(serviceOperation?: string): string {
    return `[${LoggerService.timeStamp()}][${config.functionName}${serviceOperation ? ' - ' + serviceOperation : ''}]`;
  }

  static trace(message: string, serviceOperation?: string) {
    if (config.dev !== 'dev') logger.trace(`${LoggerService.messageStamp(serviceOperation)}[TRACE] - ${message}`);
  }

  static log(message: string, serviceOperation?: string) {
    if (config.dev !== 'dev') logger.info(`${LoggerService.messageStamp(serviceOperation)}[INFO] - ${message}`);
  }

  static warn(message: string, serviceOperation?: string) {
    if (config.dev !== 'dev') logger.warn(`${LoggerService.messageStamp(serviceOperation)}[WARN] - ${message}`);
  }

  static error(message: string | Error, innerError?: unknown, serviceOperation?: string) {
    if (config.dev === 'dev') return;

    let errMessage = typeof message === 'string' ? message : message.stack;

    if (innerError) {
      if (innerError instanceof Error) {
        errMessage += `\r\n${innerError.stack}`;
      }
    }

    logger.error(`${LoggerService.messageStamp(serviceOperation)}[ERROR] - ${errMessage}`);
  }
}
