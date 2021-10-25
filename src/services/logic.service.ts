import { LoggerService } from './logger.service';
import { IPain001Message } from '../classes/iPain001';
import { NetworkMap, Rule } from '../classes/network-map';
import axios from 'axios';
import { dbService } from '..';

class CRSPResponse {
  networkMap: NetworkMap = new NetworkMap();
  transaction: IPain001Message = new IPain001Message();
}

function getRuleMap(networkMap: NetworkMap, transactionType: string): Rule[] {
  const rules: Rule[] = new Array<Rule>();

  const painChannel = networkMap.messages.find((tran) => tran.txTp === transactionType);

  if (painChannel && painChannel.channels && painChannel.channels.length > 0) {
    for (const channel of painChannel.channels) {
      if (channel.typologies && channel.typologies.length > 0)
        for (const typology of channel.typologies) {
          if (typology.rules && typology.rules.length > 0)
            for (const rule of typology.rules) {
              const ruleIndex = rules.findIndex((r: Rule) => `${r.id}` === `${rule.id}`);
              if (ruleIndex < 0) {
                rules.push(rule);
              }
            }
        }
    }
  }

  return rules;
}

export const handleTransaction = async (req: IPain001Message) => {
  // Fetch the network map
  const networkConfigurationList = await dbService.getNetworkMap();
  const networkMap: NetworkMap = networkConfigurationList[0][0];
  // Deduplicate all rules
  const transactionType = 'pain.001.001.11';
  const rules = getRuleMap(networkMap, transactionType);
  let ruleCounter = 0;

  // Prune NetworkMap
  let networkSubMap: NetworkMap;
  const prunedMap = networkMap.messages.filter((msg) => msg.txTp === transactionType);
  if (prunedMap?.length > 0) {
    networkSubMap = Object.assign(new NetworkMap(), { messages: prunedMap });

    // Send transaction to all rules
    const promises: Array<Promise<void>> = [];

    for (const rule of rules) {
      ruleCounter++;
      promises.push(sendRuleToRuleProcessor(rule, networkSubMap, req));
    }
    await Promise.all(promises);

    const message = `${ruleCounter} rules initiated for transaction ID: ${req.CstmrCdtTrfInitn.PmtInf.PmtInfId}`;
    const result: CRSPResponse = {
      networkMap: networkSubMap,
      transaction: req,
    };
    LoggerService.log(message);
    return result;
  }
};

const sendRuleToRuleProcessor = async (rule: Rule, networkMap: NetworkMap, req: IPain001Message) => {
  const toSend = { transaction: req, networkMap };
  console.log(`${rule.host}/execute`);
  const ruleRes = await axios.post(`${rule.host}/execute`, toSend);
  console.log(rule.host, ruleRes.status);
  if (ruleRes.status !== 200) {
    LoggerService.trace(`Error status ${ruleRes.status} from Rule ${rule.id}, with message:\r\n${ruleRes.data}`);
    LoggerService.trace(`Request:\r\n${toSend}`);
  }
};
