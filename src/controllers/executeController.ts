import { Context, Next } from 'koa';
import { CustomerCreditTransferInitiation } from '../classes/iPain001Transaction';
import { LoggerService } from '../services/logger.service';
import { handleTransaction } from '../services/logic.service';

export const execute = async (ctx: Context, next: Next): Promise<void | Context> => {
  let request!: CustomerCreditTransferInitiation;
  LoggerService.log('Start - Handle execute request');

  try {
    const reqBody = ctx.request.rawBody ?? JSON.parse('');
    request = new CustomerCreditTransferInitiation(JSON.parse(reqBody));
  } catch (parseError) {
    const failMessage = 'Failed to parse execution request.';
    LoggerService.error(failMessage, parseError, 'ApplicationService');
    LoggerService.log('End - Handle execute request');
    ctx.status = 400;
    ctx.body = failMessage;
    return ctx;
  }

  try {
    await handleTransaction(request);
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
