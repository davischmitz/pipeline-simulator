const OpCode = require("./op-code");

const cloneRegister = (register) => ({
  opCode: register.opCode,
  op1: register.op1,
  op2: register.op2,
  op3: register.op3,
  valid: register.valid,
  tempValue1: register.tempValue1,
  tempValue2: register.tempValue2,
  tempValue3: register.tempValue3,
  code: register.code,
  pc: register.pc,
  branchWasTaken: register.branchWasTaken,
});

const createDefaultRegister = (pc = 0) => ({
  opCode: OpCode.NOP,
  op1: 0,
  op2: 0,
  op3: 0,
  tempValue1: 0,
  tempValue2: 0,
  tempValue3: 0,
  valid: true,
  code: "",
  pc,
  branchWasTaken: false,
});

const formatCode = (code) =>
  code.toLowerCase().replace(",", "").replace(",", "");

const formatNumber = (value) =>
  Number(value.match(/-?[0-9]\d*(\.\d+)?/)[0] || 0);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  cloneRegister,
  createDefaultRegister,
  formatCode,
  formatNumber,
  sleep,
};
