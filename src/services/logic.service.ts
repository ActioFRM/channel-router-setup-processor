import { LoggerService } from './logger.service';
import { IPain001Message } from '../classes/iPain001';
import { NetworkMap, Rule } from '../classes/network-map';
import axios from 'axios';
import { dbService } from '..';

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
  if (networkConfigurationList && networkConfigurationList[0]) {
    const networkMap: NetworkMap = networkConfigurationList[0][0];

    // Prune NetworkMap
    let networkSubMap: NetworkMap;
    const prunedMap = networkMap.messages.filter((msg) => msg.txTp === req.TxTp);
    if (prunedMap && prunedMap[0]) {
      networkSubMap = Object.assign(new NetworkMap(), { messages: prunedMap });

      // Deduplicate all rules
      const rules = getRuleMap(networkMap, req.TxTp);

      // Send transaction to all rules
      const promises: Array<Promise<void>> = [];
      const failedRules: Array<string> = [];
      const sentTo: Array<string> = [];

      for (const rule of rules) {
        promises.push(sendRuleToRuleProcessor(rule, networkSubMap, req, sentTo, failedRules));
      }
      await Promise.all(promises);

      const result = {
        rulesSentTo: sentTo,
        failedToSend: failedRules,
        transaction: req,
        networkMap: networkSubMap,
      };
      return result;
    } else {
      LoggerService.log('No coresponding message found in Network map');
      const result = {
        networkMap: {},
        transaction: req,
      };
      return result;
    }
  } else {
    LoggerService.log('No network map found in DB');
    const result = {
      networkMap: {},
      transaction: req,
    };
    return result;
  }
};

const sendRuleToRuleProcessor = async (
  rule: Rule,
  networkMap: NetworkMap,
  req: IPain001Message,
  sentTo: Array<string>,
  failedRules: Array<string>,
) => {
  const toSend = { transaction: req, networkMap };
  try {
    const ruleRes = await axios.post(`${rule.host}/execute`, toSend);
    if (ruleRes.status === 200) {
      sentTo.push(rule.id);
      LoggerService.log(`Successfully sent to ${rule.id}`);
    }
  } catch (error) {
    failedRules.push(rule.id);
    LoggerService.trace(`Failed to send to Rule ${rule.id}`);
  }
};
