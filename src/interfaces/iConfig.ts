export interface IConfig {
  redisDB: string;
  redisAuth: string;
  redisHost: string;
  redisPort: number;
  dbURL: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  restPort: number;
  logstashHost: string;
  logstashPort: number;
  arangoHost: string;
  arangoPort: number;
  functionName: string;
  apmLogging: boolean;
  apmSecretToken: string;
  apmURL: string;
  nodeEnv: string;
}
