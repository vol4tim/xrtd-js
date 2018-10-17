import _ from 'lodash'
import lighthouse from './lighthouse'
import xrt from './xrt'
import status from './status'

let currentBlock = 0
let lastUpd = 0

const getStatusCode = (robonomics) => {
  const member = _.find(status.members, { address: robonomics.account })
  // я есть в работниках
  if (member) {
    if (status.balance < 0.001) {
      return 2
    } else if (status.timeoutBlocks < currentBlock - status.keepaliveBlock) { // если истек таймаут
      return 1
    } else if (member.i === status.marker && status.quota > 0) { // у меня маркер и есть квота
      return 1
    }
    return 3
  }
  return 4
}

export default (robonomics) => {
  const setCurrentBlock = () => {
    robonomics.web3.eth.getBlockNumber((e, r) => {
      currentBlock = r
      if (currentBlock !== lastUpd) {
        status.balance = Number(robonomics.web3.fromWei(robonomics.web3.eth.getBalance(robonomics.account)))
        xrt(robonomics.account)
          .then((r) => {
            status.xrt = r
          })
        lighthouse(robonomics)
          .then((result) => {
            status.members = result.members
            status.timeoutBlocks = result.timeoutBlocks
            status.keepaliveBlock = result.keepaliveBlock
            status.marker = result.marker
            status.quota = result.quota
            status.providerStatus = getStatusCode(robonomics)
            status.providerEnable = (status.providerStatus === 1) ? true : false
          })
        lastUpd = currentBlock
      }
      setTimeout(setCurrentBlock, 10000)
    })
  }
  setCurrentBlock()
}
