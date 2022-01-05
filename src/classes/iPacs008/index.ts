/* eslint-disable @typescript-eslint/no-empty-interface, no-prototype-builtins */
import { CdtTrfTxInf } from './CdtTrfTxInf';
import { GrpHdr } from './GrpHdr';

class Dtls {
  Tp = '';
  Cd = '';
}

class RgltryRptg {
  Dtls: Dtls = new Dtls();
}

class RmtInf {
  Ustrd = '';
}

class Envlp {
  Doc: Doc = new Doc();
}

class Doc {
  Xprtn = '';
}

class SplmtryData {
  Envlp: Envlp = new Envlp();
}

class FIToFICstmrCdt {
  GrpHdr: GrpHdr = new GrpHdr();
  CdtTrfTxInf: CdtTrfTxInf = new CdtTrfTxInf();
  RgltryRptg: RgltryRptg = new RgltryRptg();
  RmtInf: RmtInf = new RmtInf();
  SplmtryData: SplmtryData = new SplmtryData();
}

export class IPacs008Message {
  TxTp = '';
  FIToFICstmrCdt: FIToFICstmrCdt = new FIToFICstmrCdt();
}
