const formatCode = () => {}

const formatNumber = (value) => Number(value.match(/\d/)[0] || 0)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    formatCode,
    formatNumber,
    sleep,
}