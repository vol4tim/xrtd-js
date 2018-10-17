let instance = null
export const setRobonomics = (r) => {
  instance = r
}
export const getRobonomics = () => {
  return instance
}
export const watchTx = (web3, tx) => {
  const transactionReceiptAsync = (resolve, reject) => {
    web3.eth.getTransactionReceipt(tx, (error, receipt) => {
      if (error) {
        reject(error)
      } else if (receipt === null) {
        setTimeout(() => transactionReceiptAsync(resolve, reject), 5000)
      } else {
        resolve(receipt)
      }
    })
  }
  if (Array.isArray(tx)) {
    return Promise.all(tx.map(oneTx => watchTx(oneTx)))
  } else if (typeof tx === 'string') {
    return new Promise(transactionReceiptAsync)
  }
  throw new Error(`Invalid Type: ${tx}`)
}
export const randomBase58 = (digits = 0) => {
  const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
  let result = ''
  let char
  while (result.length < digits) {
    char = base58[Math.random() * 57 >> 0]
    if (result.indexOf(char) === -1) result += char
    if (result.indexOf('Qm') > -1) result = ''
  }
  return result
}
