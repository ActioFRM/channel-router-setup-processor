export interface IConfig {
  redis: {
    auth: string;
    db: string;
    host: string;
    port: number;
  };
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
