import { Context, Next } from 'koa';

export const healthCheck = async (ctx: Context, next: Next): Promise<void | Context> => {
  ctx.body = 'UP';
  ctx.status = 200;
  await next();
};
