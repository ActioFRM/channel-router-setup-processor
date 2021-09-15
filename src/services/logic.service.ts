import { LoggerService } from './logger.service';
import { CustomerCreditTransferInitiation } from '../classes/iPain001Transaction';
import { NetworkMap, Rule } from '../classes/network-map';
import axios from 'axios';
import { dbService } from '..';

function getRuleMap(networkMap: NetworkMap, transactionType: string): Rule[] {
  const rules: Rule[] = new Array<Rule>();

  const painChannel = networkMap.transactions.find((tran) => tran.transaction_type === transactionType);

  if (painChannel && painChannel.channels && painChannel.channels.length > 0) {
    for (const channel of painChannel.channels) {
      if (channel.typologies && channel.typologies.length > 0)
        for (const typology of channel.typologies) {
          if (typology.rules && typology.rules.length > 0)
            for (const rule of typology.rules) {
              const ruleIndex = rules.findIndex(
                (r: Rule) => `${r.rule_id}${r.rule_name}${r.rule_version}` === `${rule.rule_id}${rule.rule_name}${rule.rule_version}`,
              );
              if (ruleIndex < 0) {
                rules.push(rule);
              }
            }
        }
    }
  }

  return rules;
}

export const handleTransaction = async (req: CustomerCreditTransferInitiation): Promise<string> => {
  // Fetch the network map
  const networkConfigurationList = await dbService.getNetworkMap();
  const networkMap: NetworkMap = networkConfigurationList[0][0];

  // Deduplicate all rules
  const transactionType = 'pain.001.001.11';
  const rules = getRuleMap(networkMap, transactionType);
  let ruleCounter = 0;

  // Send transaction to all rules
  const promises: Array<Promise<void>> = [];

  for (const rule of rules) {
    ruleCounter++;
    promises.push(sendRule(rule, networkMap, req));
  }
  await Promise.all(promises);

  const result = `${ruleCounter} rules initiated for transaction ID: ${req.PaymentInformation.CreditTransferTransactionInformation.PaymentIdentification.EndToEndIdentification}`;
  LoggerService.log(result);
  return result;
};

const sendRule = async (rule: Rule, networkMap: NetworkMap, req: CustomerCreditTransferInitiation) => {
  const toSend = `{"transaction":${JSON.stringify(req)}, "networkmap":${JSON.stringify(networkMap)}}`;
  const ruleRes = await axios.post(rule.rule_host, toSend);
  if (ruleRes.status !== 200) {
    LoggerService.trace(`Error status ${ruleRes.status} from Rule ${rule.rule_id}, with message:\r\n${ruleRes.data}`);
    LoggerService.trace(`Request:\r\n${toSend}`);
  }
};
