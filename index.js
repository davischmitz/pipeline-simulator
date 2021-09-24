const fs = require('fs')
const readline = require('readline');
const { cloneRegister, createDefaultRegister, formatNumber, formatCode, sleep } = require('./utils')

const OpCode = require("./op-code")

let PC = 0
const codes = []
const R = Array(32).fill(0)

let validInstructions = 0
let invalidInstructions = 0

const operationCodes = {
    "add": (register) => { register.tempValue2 = register.tempValue3 + register.tempValue1 },
    "addi": (register) => { register.tempValue2 = register.tempValue3 + register.tempValue1 },
    "sub": (register) => { register.tempValue2 = register.tempValue3 - register.tempValue1 },
    "subi": (register) => { register.tempValue2 = register.tempValue3 - register.tempValue1 },
    "beq": (register) => {
        if (register.tempValue1 === register.tempValue2) {
            PC += (register.tempValue3 - 2);
            registerFetch.valid = false
            registerDecode.valid = false
        }
    },
    "b": (register) => {
        PC += (register.tempValue3 - 2); 
        registerFetch.valid = false
        registerDecode.valid = false
    },
    "nop": (register) => { },
}

let registerFetch = createDefaultRegister()
let registerDecode = createDefaultRegister()
let registerExecute = createDefaultRegister()
let registerMemory = createDefaultRegister()
let registerWriteBack = createDefaultRegister()

const fetch = () => {
    const code = codes[PC]

    const formattedCode = formatCode(code)
    const codeList = formattedCode.split(" ")
    registerFetch.opCode = codeList[0]

    if (registerFetch.opCode === OpCode.NOP) {
        registerFetch = createDefaultRegister()
    } else if (registerFetch.opCode === OpCode.B) {
        registerFetch.op3 = formatNumber(codeList[1])
    } else {
        registerFetch.op1 = formatNumber(codeList[1])
        registerFetch.op2 = formatNumber(codeList[2])
        registerFetch.op3 = formatNumber(codeList[3])
    }

    PC++
}

const decode = () => {
    registerDecode = cloneRegister(registerFetch)

    if (registerDecode.opCode === OpCode.B)
        registerDecode.tempValue3 = registerDecode.op3;
    else if (registerDecode.opCode === OpCode.BEQ) {
        registerDecode.tempValue1 = R[registerDecode.op1]
        registerDecode.tempValue2 = R[registerDecode.op2]
        registerDecode.tempValue3 = registerDecode.op3
    } else {
        registerDecode.tempValue3 = R[registerDecode.op3];
        if ((registerDecode.opCode === OpCode.ADDI) || (registerDecode.opCode === OpCode.SUBI))
            registerDecode.tempValue1 = registerDecode.op1;
        else
            registerDecode.tempValue1 = R[registerDecode.op1];
    }

    console.log("Register Decode", registerDecode)
}

const execute = () => {
    registerExecute = cloneRegister(registerDecode)

    operationCodes[registerExecute.opCode](registerExecute)

    console.log("Register Execute", registerExecute)
}

const memory = () => {
    registerMemory = cloneRegister(registerExecute)
}

const writeBack = () => {
    registerWriteBack = cloneRegister(registerMemory)

    if (registerWriteBack.valid) {
        validInstructions++
        if ((registerWriteBack.opCode == OpCode.ADDI) || (registerWriteBack.opCode == OpCode.ADD) || (registerWriteBack.opCode == OpCode.SUBI) || (registerWriteBack.opCode == OpCode.SUB))
            R[registerWriteBack.op1] = registerWriteBack.tempValue2;
    } else {
        invalidInstructions++
    }

    console.log("Register WriteBack", registerWriteBack)
}

const loadCode = () => {
    const filename = "code.txt"

    const readInterface = readline.createInterface({
        input: fs.createReadStream(filename),
        console: false
    });

    readInterface.on('line', (line) => {
        codes.push(line)
    }).on("close", () => { })
}

const runNextLine = () => {
    console.log(`--------------------------------------------- Code: ${codes[PC]} Line: ${PC} ---------------------------------------------`)

    writeBack()
    memory()
    execute()
    decode()
    fetch()

    console.log("R", R)
}

loadCode()

const runner = async () => {
    loadCode()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)

    runNextLine()
    await sleep(500)
}

runner()