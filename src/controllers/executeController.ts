import { Context, Next } from 'koa';
import { IPain001Message } from '../classes/iPain001';
import { LoggerService } from '../services/logger.service';
import { handleTransaction } from '../services/logic.service';

export const execute = async (ctx: Context, next: Next): Promise<void | Context> => {
  let request!: IPain001Message;
  LoggerService.log('Start - Handle execute request');

  try {
    const reqBody = ctx.request.body;
    request = Object.assign(new IPain001Message(), reqBody);
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
