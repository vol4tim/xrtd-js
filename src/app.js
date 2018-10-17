import Web3 from 'web3'
import IPFS from 'ipfs-api'
import Robonomics, { MessageProviderIpfsApi } from 'robonomics-js'
import matcher from './matcher'
import watcher from './watcher'
import status from './status'
import logger from './logger'
import { setRobonomics, watchTx, randomBase58 } from './utils'
import * as liability from './liability'

const provider = (robonomics, model = null) => {
  robonomics.getBid(model, (msg) => {
    console.log('===================');
    console.log('bid', {
      account: msg.account,
      model: msg.model,
      objective: msg.objective,
      token: msg.token,
      cost: msg.cost,
    });
    const askbid = matcher(null, msg)
    if (askbid) {
      if (status.providerEnable) {
        liability.create(robonomics, askbid[0], askbid[1])
      } else {
        logger()
      }
    }
  })
  robonomics.getAsk(model, (msg) => {
    console.log('===================');
    console.log('ask', {
      account: msg.account,
      model: msg.model,
      objective: msg.objective,
      token: msg.token,
      cost: msg.cost,
    });
    const askbid = matcher(msg)
    if (askbid) {
      if (status.providerEnable) {
        liability.create(robonomics, askbid[0], askbid[1])
      } else {
        logger()
      }
    }
  })
  robonomics.getResult((msg) => {
    console.log('===================');
    console.log('result', {
      account: msg.account,
      liability: msg.liability,
    });
    if (status.providerEnable) {
      liability.finalize(robonomics, msg)
    } else {
      logger()
    }
  })
}

let liabilityAddress = null
const miner = (robonomics, model = null) => {
  if (liabilityAddress === null) {
    if (status.providerEnable) {
      const ask = robonomics.message.create('ask', {
        model: (model) ? model : randomBase58(46),
        objective: randomBase58(46),
        token: robonomics.xrt.address,
        cost: 1,
        validator: '0x0000000000000000000000000000000000000000',
        validatorFee: 0,
        deadline: 99999999
      });
      ask.sign()
      const bid = robonomics.message.create('bid', {
        model: ask.model,
        objective: ask.objective,
        token: ask.token,
        cost: ask.cost,
        lighthouseFee: 0,
        deadline: ask.deadline,
      });
      ask.sign()
        .then(() => bid.sign())
        .then(() => liability.create(robonomics, ask.getProps(), bid.getProps()))
        .then((tx) => watchTx(robonomics.web3, tx))
        .then((receipt) => {
          liabilityAddress = '0x' + receipt.logs[0].topics[1].substr(-40)
          miner(robonomics, model)
        })
    } else {
      logger()
      setTimeout(() => {
        miner(robonomics, model)
      }, 10000)
    }
  } else {
    if (status.providerEnable) {
      const result = robonomics.message.create('result', { liability: liabilityAddress, result: randomBase58(46) });
      result.sign()
        .then(() => liability.finalize(robonomics, result.getProps()))
      liabilityAddress = null
    } else {
      logger()
    }
    setTimeout(() => {
      miner(robonomics, model)
    }, 10000)
  }
}

export default (config) => {
  const robonomics = new Robonomics({
    web3: new Web3(new Web3.providers.HttpProvider(config.web3)),
    provider: new MessageProviderIpfsApi(new IPFS(config.ipfs)),
    ...config.robonomics
  })
  setRobonomics(robonomics)

  robonomics.ready().then(() => {
    console.log('account', robonomics.account)
    console.log('xrt', robonomics.xrt.address)
    console.log('factory', robonomics.factory.address)
    console.log('lighthouse', robonomics.lighthouse.address)

    watcher(robonomics)
    setInterval(logger, 10000)

    if (config.isProvider) {
      console.log('mode provider')
      provider(robonomics, config.model)
    }
    if (config.isMiner) {
      console.log('mode miner')
      miner(robonomics, config.model)
    }
  })
}
