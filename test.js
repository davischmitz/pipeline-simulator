const createInitialRegister = () => ({
    op1: 0,
    op2: 0,
})

const registerClone = (register) => ({
    op1: register.op1,
    op2: register.op2,
})

let fetchRegister = createInitialRegister()
let decodeRegister = createInitialRegister()

fetchRegister.op1 = 20
fetchRegister.op2 = 30

decodeRegister = registerClone(fetchRegister)

fetchRegister.op2 = 3000
decodeRegister.op1 = 100

console.log("FETCH REGISTER", fetchRegister)
console.log("DECODE REGISTER", decodeRegister)
