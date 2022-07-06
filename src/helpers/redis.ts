import redis from 'redis';
import { config } from '../config';
import { LoggerService } from '../services/logger.service';

export class RedisService {
  client: redis.RedisClient;

  constructor() {
    this.client = redis.createClient({
      db: config.redis?.db,
      host: config.redis?.host,
      port: config.redis?.port,
      auth_pass: config.redis?.auth,
    });
    this.client.on('connect', () => {
      LoggerService.log('✅ Redis connection is ready');
    });
    this.client.on('error', (error) => {
      LoggerService.error('❌ Redis connection is not ready', error);
    });
  }

  getJson = (key: string): Promise<string> =>
    new Promise((resolve) => {
      this.client.get(key, (err, res) => {
        if (err) {
          LoggerService.error('Error while getting key from redis with message:', err, 'RedisService');

          resolve('');
        }
        resolve(res ?? '');
      });
    });

  setJson = (key: string, value: string, event: string, time: number): Promise<string | undefined> =>
    new Promise((resolve) => {
      if (time === 0)
        this.client.SET(key, value, (err, res) => {
          if (err) {
            LoggerService.error('Error while setting key to redis with message:', err, 'RedisService');

            resolve('');
          }
          resolve(res);
        });
      else
        this.client.SET(key, value, event, time, (err, res) => {
          if (err) {
            LoggerService.error('Error while setting key to redis with message:', err, 'RedisService');

            resolve('');
          }
          resolve(res);
        });
    });

  deleteKey = (key: string): Promise<number> =>
    new Promise((resolve) => {
      this.client.DEL(key, (err, res) => {
        if (err) {
          LoggerService.error('Error while deleting key from redis with message:', err, 'RedisService');

          resolve(0);
        }
        resolve(res);
      });
    });
}
