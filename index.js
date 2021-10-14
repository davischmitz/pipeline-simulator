const fs = require("fs");
const readline = require("readline");
const readlineSync = require("readline-sync");
const {
  cloneRegister,
  createDefaultRegister,
  formatNumber,
  formatCode,
  sleep,
} = require("./utils");

// CONFIG
const isPredictionEnabled = true; //por default, a predição é habilitada
const runLineByLine = true;

const OpCode = require("./op-code");

let PC = 0;
const codes = [];
const R = Array(32).fill(0);
const predictionTable = Array(32).fill(0);

let validInstructions = 0;
let invalidInstructions = 0;

let registerFetch = createDefaultRegister();
let registerDecode = createDefaultRegister();
let registerExecute = createDefaultRegister();
let registerMemory = createDefaultRegister();
let registerWriteBack = createDefaultRegister();

const updatePredictionTable = (pc, increment) => {
  const address = pc % 32;
  predictionTable[address] += increment;

  if (predictionTable[address] > 3) {
    predictionTable[address] = 3;
  } else if (predictionTable[address] < 0) {
    predictionTable[address] = 0;
  }
};

const operationCodes = {
  add: (register) => {
    register.tempValue1 = register.tempValue3 + register.tempValue2;
  },
  addi: (register) => {
    register.tempValue1 = register.tempValue3 + register.tempValue2;
  },
  sub: (register) => {
    register.tempValue1 = register.tempValue2 - register.tempValue3;
  },
  subi: (register) => {
    register.tempValue1 = register.tempValue2 - register.tempValue3;
  },
  beq: (register) => {
    if (register.tempValue1 === register.tempValue2) {
      register.tempValue1 = register.pc + register.tempValue3;
      updatePredictionTable(register.pc, 1);
    } else {
      updatePredictionTable(register.pc, -1);
    }
  },
  b: (register) => {
    register.tempValue1 = register.pc + register.tempValue3;
    updatePredictionTable(register.pc, 1);
  },
  nop: () => {},
};

const shouldBranch = (pc) => {
  const address = pc % 32;
  return predictionTable[address] >= 2;
};

const incrementPC = () => {
  if (!isPredictionEnabled) {
    PC++;
    return;
  }

  if (
    registerFetch.opCode === OpCode.BEQ ||
    registerFetch.opCode === OpCode.B
  ) {
    if (shouldBranch(registerFetch.pc)) {
      // desvio deve ser tomado
      PC += registerFetch.op3;
      registerFetch.branchWasTaken = true;
      return;
    }
  }

  PC++;
};

const handleMissPrediction = () => {
  if (!registerMemory.valid) {
    return;
  }

  // testa se deve desviar
  if (registerMemory.tempValue1) {
    // predição desligada ou desvio não tomado
    if (!isPredictionEnabled || !registerMemory.branchWasTaken) {
      PC = registerMemory.tempValue1;
      registerFetch.valid = false;
      registerDecode.valid = false;
      registerExecute.valid = false;
    }
    // não deve desviar, mas desviou
  } else if (registerMemory.branchWasTaken) {
    PC = registerMemory.pc + 1;
    registerFetch.valid = false;
    registerDecode.valid = false;
    registerExecute.valid = false;
  }
};

const fetch = () => {
  registerFetch = createDefaultRegister();
  registerFetch.pc = PC;

  const code = codes[PC];

  if (!code) {
    registerFetch.valid = false;
    return;
  }

  const formattedCode = formatCode(code);
  const codeList = formattedCode.split(" ");
  registerFetch.opCode = codeList[0];

  if (registerFetch.opCode !== OpCode.NOP) {
    if (registerFetch.opCode === OpCode.B) {
      registerFetch.op3 = formatNumber(codeList[1]);
    } else {
      registerFetch.op1 = formatNumber(codeList[1]);
      registerFetch.op2 = formatNumber(codeList[2]);
      registerFetch.op3 = formatNumber(codeList[3]);
    }
  }

  registerFetch.code = code;
  incrementPC();
};

const decode = () => {
  registerDecode = cloneRegister(registerFetch);

  if (registerDecode.opCode === OpCode.B)
    registerDecode.tempValue3 = registerDecode.op3;
  else if (registerDecode.opCode === OpCode.BEQ) {
    registerDecode.tempValue1 = R[registerDecode.op1];
    registerDecode.tempValue2 = R[registerDecode.op2];
    registerDecode.tempValue3 = registerDecode.op3;
  } else {
    registerDecode.tempValue2 = R[registerDecode.op2];
    if (
      registerDecode.opCode === OpCode.ADDI ||
      registerDecode.opCode === OpCode.SUBI
    )
      registerDecode.tempValue3 = registerDecode.op3;
    else registerDecode.tempValue3 = R[registerDecode.op3];
  }
};

const execute = () => {
  registerExecute = cloneRegister(registerDecode);

  operationCodes[registerExecute.opCode](registerExecute);
};

const memory = () => {
  registerMemory = cloneRegister(registerExecute);
};

const writeBack = () => {
  registerWriteBack = cloneRegister(registerMemory);

  if (registerWriteBack.pc === 0) {
    return;
  }

  if (registerWriteBack.valid) {
    validInstructions++;
    if (
      registerWriteBack.opCode == OpCode.ADDI ||
      registerWriteBack.opCode == OpCode.ADD ||
      registerWriteBack.opCode == OpCode.SUBI ||
      registerWriteBack.opCode == OpCode.SUB
    )
      R[registerWriteBack.op1] = registerWriteBack.tempValue1;
  } else {
    invalidInstructions++;
  }
};

const loadCode = () => {
  const filename = "code.txt";

  const readInterface = readline.createInterface({
    input: fs.createReadStream(filename),
    console: false,
  });

  readInterface
    .on("line", (line) => {
      codes.push(line);
    })
    .on("close", () => {});
};

const runNextLine = () => {
  console.log(`-------------- Code: ${codes[PC]} Line: ${PC} --------------`);

  writeBack();
  memory();
  execute();
  decode();
  fetch();

  if (
    registerMemory.opCode === OpCode.B ||
    registerMemory.opCode === OpCode.BEQ
  ) {
    handleMissPrediction();
  }

  console.log("Register Fetch", registerFetch);
  console.log("Register Decode", registerDecode);
  console.log("Register Execute", registerExecute);
  console.log("Register Memory", registerMemory);
  console.log("Register WriteBack", registerWriteBack);
  console.log("R", R);
};

const runner = async () => {
  loadCode();
  await sleep(500);

  console.log("Code lines:", codes.length);

  runNextLine();

  while (
    registerFetch.valid ||
    registerDecode.valid ||
    registerExecute.valid ||
    registerMemory.valid ||
    registerWriteBack.valid
  ) {
    if (runLineByLine) {
      readlineSync.question("Run next line? (Press Enter)");
    }
    runNextLine();
  }

  console.log("Total cycles:", validInstructions + invalidInstructions);
  console.log("Valid instructions:", validInstructions);
  console.log("Invalid instructions:", invalidInstructions);
};

runner();
