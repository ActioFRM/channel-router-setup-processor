import { credentials, Metadata, ServiceError } from '@grpc/grpc-js';
import { FlowFileServiceClient } from '../models/nifi_grpc_pb';
import { FlowFileReply, FlowFileRequest } from '../models/nifi_pb';

/**
 * gRPC Rule Engine Client Service
 */
class RuleEngineService {
  public client(ruleHost: string): FlowFileServiceClient {
    return new FlowFileServiceClient(ruleHost, credentials.createInsecure());
  }

  public async send(client: FlowFileServiceClient, param: FlowFileRequest, metadata: Metadata = new Metadata()): Promise<FlowFileReply> {
    return new Promise((resolve: Resolve<FlowFileReply>, reject: Reject): void => {
      client.send(param, metadata, (err: ServiceError | null, res: FlowFileReply) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      });
    });
  }
}

export default RuleEngineService;
