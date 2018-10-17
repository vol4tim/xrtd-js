import Promise from 'bluebird'
import EthereumTx from 'ethereumjs-tx'
import _has from 'lodash/has'

const send = (robonomics, contract, method, params = [], args = {}) => {
  if (!_has(args, 'gas') || args.gas <= 0) {
    args.gas = contract.contract[method].estimateGas(...params, args)
  }
  if (robonomics.isPrivateKey) {
    const data = contract.contract[method].getData(...params)
    return sendRaw(robonomics.web3, robonomics.account, robonomics.privateKey, contract.address, data, args)
  }
  return contract.send(method, params, args)
}
export default send

var NONCE = 0
var NONCE_LAST_TIME = 0
const getNonce = (web3, account) => {
  const current_time = Math.floor(Date.now() / 1000)
  if (NONCE === 0 || current_time > (NONCE_LAST_TIME + 30)) {
    NONCE = web3.eth.getTransactionCount(account);
  } else {
    NONCE += 1
  }
  NONCE_LAST_TIME = Math.floor(Date.now() / 1000)
  return NONCE
}

export const sendRaw = (web3, account, privateKey, address, data, args) => {
  return new Promise((resolve, reject) => {
    const nonce = getNonce(web3, account)
      web3.eth.getGasPrice((e, r) => {
        if (e) {
          reject(e)
        }
        web3.eth.estimateGas({
          to: address,
          data,
          ...args
        }, (e, g) => {
          if (e) {
            reject(e)
          }
          const tx = new EthereumTx({
            nonce,
            gasPrice: web3.toHex(r),
            gasLimit: g,
            to: address,
            value: 0,
            data
          })
          tx.sign(Buffer.from(privateKey.replace('0x', ''), 'hex'))

          const raw = '0x' + tx.serialize().toString('hex')
          web3.eth.sendRawTransaction(raw, (e, transactionHash) => {
            if (e) {
              reject(e)
            }
            resolve(transactionHash)
          })
        })
      })
  })
}
