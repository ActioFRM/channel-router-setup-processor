import path from 'path';
import { config as dotenv } from 'dotenv';
import { IConfig } from './interfaces/iConfig';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv({
  path: path.resolve(__dirname, '../.env'),
});

export const config: IConfig = {
  redis: {
    auth: <string>process.env.REDIS_AUTH,
    db: <string>process.env.REDIS_DB,
    host: <string>process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!, 10),
  },
  dbURL: <string>process.env.DB_URL,
  dbName: <string>process.env.DB_NAME,
  dbUser: <string>process.env.DB_USER,
  dbPassword: <string>process.env.DB_PASSWORD,
  restPort: parseInt(process.env.REST_PORT!, 10),
  logstashHost: <string>process.env.LOGSTASH_HOST,
  logstashPort: parseInt(process.env.LOGSTASH_PORT!, 10),
  arangoHost: <string>process.env.ARANGO_HOST,
  arangoPort: parseInt(process.env.arangoPort!, 10),
  functionName: <string>process.env.FUNCTION_NAME,
  apmLogging: <boolean>(process.env.APM_LOGGING === 'true'),
  apmSecretToken: <string>process.env.APM_SECRET_TOKEN,
  apmURL: <string>process.env.APM_URL,
  nodeEnv: <string>process.env.NODE_ENV,
};
