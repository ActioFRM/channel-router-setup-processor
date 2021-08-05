import http from 'http';
import { LoggerService } from './logger.service';
import { CustomerCreditTransferInitiation } from '../classes/iPain001Transaction';
import { NetworkMap, Rule, Typology } from '../classes/network-map';
import { FlowFileReply, FlowFileRequest } from '../models/nifi_pb';
import { sendUnaryData } from '@grpc/grpc-js';
import { ArangoDBService } from '../helpers/arango-client.service';
import { ruleEngineService } from '../clients/rule-engine.client';

const arangodb = new ArangoDBService();

export const handleTransaction = async (req: CustomerCreditTransferInitiation, callback: sendUnaryData<FlowFileReply>) => {
  
  const networkConfigurationQuery = `
      FOR doc IN networkConfiguration
      RETURN doc
    `;

  const networkConfigurationList = await arangodb.query(
    networkConfigurationQuery,
  );

  const networkMap: [NetworkMap] = networkConfigurationList[0];

  // Deduplicate all rules
  const transactionType = 'pain.001.001.11';
  const rules = getRuleMap(networkMap[0], transactionType);

  let ruleCounter = 0;
  // Send transaction to all rules
  let promises: Array<Promise<void>> = [];
  rules.map((rule) => {
    ruleCounter++;
    promises.push(sendRule(rule, req))
  })
  await Promise.all(promises);
  const result = `${ruleCounter} rules initiated for transaction ID: ${req.PaymentInformation.CreditTransferTransactionInformation.PaymentIdentification.EndToEndIdentification}`;
  LoggerService.log(result);
  const res: FlowFileReply = new FlowFileReply();
  res.setBody(result);
  res.setResponsecode(1);
  callback(null, res);
};

const sendRule = async (rule: Rule, req: CustomerCreditTransferInitiation) => {
  const toSend = `{"transaction":${JSON.stringify(req)}, "typologies":${JSON.stringify(rule.typologies)}}`;

  let ruleRequest = new FlowFileRequest();
  let objJsonB64 = Buffer.from(JSON.stringify(toSend)).toString("base64");
  ruleRequest.setContent(objJsonB64);
  ruleEngineService.send(ruleRequest);

  await executePost(rule.rule_host, toSend);
};

// Submit the score to the Rule Engine
const executePost = (endpoint: string, request: string): Promise<void | Error> => {
  return new Promise((resolve) => {
    const options: http.RequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': request.length,
      },
    };

    const req = http.request(endpoint, options, (res) => {
      LoggerService.log(`Rule response statusCode: ${res.statusCode}`);
      if (res.statusCode !== 200) {
        LoggerService.trace(`StatusCode != 200, request:\r\n${request}`);
      }

      res.on('data', (d) => {
        LoggerService.log(`Rule response data: ${d.toString()}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      LoggerService.error(`Rule response Error data: ${error}`);
      LoggerService.trace(`Request:\r\n${request}`);
      resolve(error);
    });

    req.write(request);
    req.end();
  });
};

function getRuleMap(networkMap: NetworkMap, transactionType: string): Rule[] {
  const rules: Rule[] = new Array<Rule>();
  const painChannel = networkMap.transactions.find((tran) => tran.transaction_type === transactionType);
  if (painChannel && painChannel.channels && painChannel.channels.length > 0)
    for (const channel of painChannel.channels) {
      if (channel.typologies && channel.typologies.length > 0)
        for (const typology of channel.typologies) {
          if (typology.rules && typology.rules.length > 0)
            for (const rule of typology.rules) {
              const ruleIndex = rules.findIndex(
                (r: Rule) => `${r.rule_id}${r.rule_name}${r.rule_version}` === `${rule.rule_id}${rule.rule_name}${rule.rule_version}`,
              );
              if (ruleIndex > -1) {
                rules[ruleIndex].typologies.push(new Typology(typology.typology_id, typology.typology_name, typology.typology_version));
              } else {
                const tempTypologies = Array<Typology>();
                tempTypologies.push(new Typology(typology.typology_id, typology.typology_name, typology.typology_version));
                rule.typologies = tempTypologies;
                rules.push(rule);
              }
            }
        }
    }

  return rules;
}
