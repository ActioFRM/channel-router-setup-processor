class Amt {
  Amt = '';
  Ccy = '';
}

class ClrSysMmbId {
  MmbId = '';
}

class FinInstnId {
  ClrSysMmbId: ClrSysMmbId = new ClrSysMmbId();
}

class Agt {
  FinInstnId: FinInstnId = new FinInstnId();
}

class ChrgsInf {
  Amt: Amt = new Amt();
  Agt: Agt = new Agt();
}

class InstgAgt {
  FinInstnId: FinInstnId = new FinInstnId();
}

class InstdAgt {
  FinInstnId: FinInstnId = new FinInstnId();
}

export class TxInfAndSts {
  OrgnlInstrId = '';
  OrgnlEndToEndId = '';
  TxSts = '';
  ChrgsInf: ChrgsInf[] = [];
  AccptncDtTm = '';
  InstgAgt: InstgAgt = new InstgAgt();
  InstdAgt: InstdAgt = new InstdAgt();
}
