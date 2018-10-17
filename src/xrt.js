import Promise from 'bluebird'
// import { Token } from 'robonomics-js'
import { getRobonomics } from './utils'

export default (walletAddress) => {
  const robonomics = getRobonomics()
  const minABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}]
  const contract = robonomics.web3.eth.contract(minABI).at(robonomics.xrt.address);
  return new Promise((resolve) => {
    contract.balanceOf(walletAddress, (e, balance) => {
      contract.decimals((e, decimals) => {
        balance = balance.div(10**decimals)
        resolve(balance.toString())
      })
    })
  })
}

// const token = new Token(robonomics.web3, config.TOKEN)

// export default (token, wallet) => {
//   return token.call('balanceOf', [web3.eth.accounts[0]])
// }
// export default (token, wallet) => {
//   return token.call('allowance', [web3.eth.accounts[0], robonomics.factory.address])
// }
