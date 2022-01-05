import { TxInfAndSts } from './TxInfAndSts';

class GrpHdr {
  MsgId = '';
  CreDtTm = '';
}

class FIToFIPmtSts {
  GrpHdr: GrpHdr = new GrpHdr();
  TxInfAndSts: TxInfAndSts = new TxInfAndSts();
}

export class IPacs002Message {
  TxTp = '';
  FIToFIPmtSts: FIToFIPmtSts = new FIToFIPmtSts();
}
