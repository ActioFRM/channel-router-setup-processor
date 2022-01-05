class SttlmInf {
  SttlmMtd = '';
}

export class GrpHdr {
  MsgId = '';
  CreDtTm = '';
  NbOfTxs = 0;
  SttlmInf: SttlmInf = new SttlmInf();
}
