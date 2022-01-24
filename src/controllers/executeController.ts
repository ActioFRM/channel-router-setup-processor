import { LoggerService } from '../services/logger.service';
import { handleTransaction } from '../services/logic.service';
import { Context, Next } from 'koa';

export const execute = async (ctx: Context, next: Next): Promise<void | Context> => {
  let request = {};
  LoggerService.log('Start - Handle execute request');

  try {
    request = ctx.request.body;
  } catch (parseError) {
    const failMessage = 'Failed to parse execution request.';
    LoggerService.error(failMessage, parseError, 'ApplicationService');
    LoggerService.log('End - Handle execute request');
    ctx.status = 400;
    ctx.body = failMessage;
    return ctx;
  }

  try {
    const crspResp = await handleTransaction(request);
    ctx.status = 200;
    ctx.body = crspResp;
    return ctx;
  } catch (err) {
    const failMessage = 'Error while handling transaction.';
    LoggerService.error(failMessage, err, 'ApplicationService');
    ctx.status = 500;
    ctx.body = failMessage;
    return ctx;
  } finally {
    LoggerService.log('End - Handle execute request');
  }
};
