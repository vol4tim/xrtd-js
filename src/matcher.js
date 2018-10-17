import _ from 'lodash'
import md5 from 'md5'

let asks = {}
let bids = {}
export default (ask = null, bid = null) => {
  let h
  if (bid) {
    h = md5([bid.model, bid.objective, bid.token, bid.cost])
    if (!_.has(bids, h)) {
      bids[h] = bid
    }
  } else {
    h = md5([ask.model, ask.objective, ask.token, ask.cost])
    if (!_.has(asks, h)) {
      asks[h] = ask
    }
  }
  if (_.has(asks, h) && _.has(bids, h)) {
    const ask = asks[h]
    const bid = bids[h]
    asks = _.omit(asks, h);
    bids = _.omit(bids, h);
    console.log('===================');
    console.log('match', {
      promisee: ask.account,
      promisor: bid.account,
      model: ask.model,
      objective: ask.objective,
      token: ask.token,
      cost: ask.cost,
    });
    return [ask, bid]
  }
  return false
}
