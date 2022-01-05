/* eslint-disable @typescript-eslint/no-empty-interface, no-prototype-builtins */
import { GrpHdr } from './GrpHdr';
import { PmtInf } from './PmtInf';
import { SplmtryData } from './SplmtryData';

class CstmrCdtTrfInitn {
  MsgId = '';
  GrpHdr: GrpHdr = new GrpHdr();
  PmtInf: PmtInf = new PmtInf();
  SplmtryData: SplmtryData = new SplmtryData();
}

export class IPain013Message {
  TxTp = 'pain.013.001.09';
  CstmrCdtTrfInitn: CstmrCdtTrfInitn = new CstmrCdtTrfInitn();
}
