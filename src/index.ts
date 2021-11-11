import { config } from './config';
import apm from 'elastic-apm-node';
import { LoggerService } from './services/logger.service';
import App from './app';
import { ArangoDBService } from './helpers/arango-client.service';
import { iDBService } from './interfaces/iDBService';

if (config.apmLogging) {
  apm.start({
    serviceName: config.functionName,
    secretToken: config.apmSecretToken,
    serverUrl: config.apmURL,
    usePathAsTransactionName: true,
  });
}
export const app = new App();

export const runServer = async (): Promise<void> => {
  /**
   * KOA Rest Server
   */
  const app = new App();
  app.listen(config.restPort, () => {
    LoggerService.log(`HTTP Server listening on port ${config.restPort}`);
  });
};

process.on('uncaughtException', (err) => {
  LoggerService.error(`process on uncaughtException error: ${err}`);
});

process.on('unhandledRejection', (err) => {
  LoggerService.error(`process on unhandledRejection error: ${err}`);
});

try {
  runServer();
} catch (err) {
  LoggerService.error('Error while starting gRPC server', err);
}

export const dbService: iDBService = new ArangoDBService();
