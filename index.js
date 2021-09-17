const fs = require('fs')
const readline = require('readline');
const { formatNumber, formatCode, sleep } = require('./utils')

let PC = 0
const codes = []
const R = Array(32).fill(0)

const NOP = "nop"
const ADD = "add"
const ADDI = "addi"
const SUB = "sub"
const SUBI = "subi"
const BEQ = "beq"
const B = "b"

const defaultRegisterValues = {
    opCode: NOP,
    op1: 0,
    op2: 0,
    op3: 0,
    valid: 0,
    tempValue1: 0,
    tempValue2: 0,
    tempValue3: 0,
}

const operationCodes = {
    "add": (register) => { register.tempValue1 = register.tempValue2 + register.tempValue3 },
    "addi": (register) => { register.tempValue1 = register.tempValue2 + register.tempValue3 },
    "sub": (register) => { register.tempValue1 = register.tempValue2 - register.tempValue3 },
    "subi": (register) => { register.tempValue1 = register.tempValue2 - register.tempValue3 },
    "beq": (register) => { },
    "b": (register) => { },
    "nop": (register) => { },
}

let registerFetch = defaultRegisterValues
let registerDecode = defaultRegisterValues
let registerExecute = defaultRegisterValues
let registerMemory = defaultRegisterValues
let registerWriteBack = defaultRegisterValues

const fetch = () => {
    const code = codes[PC]

    const formattedCode = code.toLowerCase().replace(",", "").replace(",", "")

    if (formattedCode === NOP) {
        registerFetch = defaultRegisterValues
    } else {
        const codeList = formattedCode.split(" ")
        registerFetch.opCode = codeList[0]

        if (codeList.length > 3) {
            registerFetch.op1 = formatNumber(codeList[2])
            registerFetch.op2 = formatNumber(codeList[3])
            registerFetch.op3 = formatNumber(codeList[1])
        } else {
            registerFetch.op1 = formatNumber(codeList[1])
            registerFetch.op2 = formatNumber(codeList[2])
            registerFetch.op3 = 0
        }
    }

    console.log("Register Fetch", registerFetch)

    PC += 1
}

const decode = () => {
    registerDecode = registerFetch

    if (registerDecode.opCode === B)
        registerDecode.tempValue1 = registerDecode.op1;
    else {
        registerDecode.tempValue2 = R[registerDecode.op2];
        if ((registerDecode.opCode === ADDI) || (registerDecode.opCode === SUBI))
            registerDecode.tempValue3 = registerDecode.op3;
        else
            registerDecode.tempValue3 = R[registerDecode.op3];
    }

    console.log("Register Decode", registerDecode)
}

const execute = () => {
    registerExecute = registerDecode

    operationCodes[registerExecute.opCode](registerExecute)

    console.log("Register Execute", registerExecute)
}

const memory = () => {
    registerMemory = registerExecute
}

const writeBack = () => {
    registerWriteBack = registerMemory

    if ((registerWriteBack.opCode == ADDI) || (registerWriteBack.opCode == ADD) || (registerWriteBack.opCode == SUBI) || (registerWriteBack.opCode == SUB))
        R[registerWriteBack.op1] = registerWriteBack.tempValue1;

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
}

runner()