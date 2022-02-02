import redis from 'redis-mock';
jest.mock('redis', () => redis);