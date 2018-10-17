import abi from 'web3-eth-abi'
import base58 from 'base-58'
import { utils } from 'robonomics-js'
import sendTx from './sendTx'

function encodeAsk(ask) {
  return abi.encodeParameters(
    [ "bytes", "bytes", "address", "uint256", "address", "uint256", "uint256", "bytes32", "bytes" ],
    [
      utils.web3Beta.utils.bytesToHex(base58.decode(ask.model)),
      utils.web3Beta.utils.bytesToHex(base58.decode(ask.objective)),
      ask.token,
      ask.cost,
      ask.validator,
      ask.validatorFee,
      ask.deadline,
      ask.nonce,
      ask.signature
    ]
  );
}

function encodeBid(bid) {
  return abi.encodeParameters(
    [ "bytes", "bytes", "address", "uint256", "uint256", "uint256", "bytes32", "bytes" ],
    [
      utils.web3Beta.utils.bytesToHex(base58.decode(bid.model)),
      utils.web3Beta.utils.bytesToHex(base58.decode(bid.objective)),
      bid.token,
      bid.cost,
      bid.lighthouseFee,
      bid.deadline,
      bid.nonce,
      bid.signature
    ]
  );
}

export function create(robonomics, ask, bid) {
  return sendTx(robonomics, robonomics.lighthouse, 'createLiability', [encodeAsk(ask), encodeBid(bid)], { from: robonomics.account, gas: 900000 })
    .then((r) => {
      console.log('===================');
      console.log('Liability create tx', r);
      return r
    })
    .catch((e) => {
      console.log('===================');
      console.log('Liability create e', e);
    })
}

export function finalize(robonomics, msg) {
  const finalizeAbi = {"constant":false,"inputs":[{"name":"_result","type":"bytes"},{"name":"_signature","type":"bytes"},{"name":"_agree","type":"bool"}],"name":"finalize","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"};
  const data = abi.encodeFunctionCall(finalizeAbi, [utils.web3Beta.utils.bytesToHex(base58.decode(msg.result)), msg.signature, true]);
  return sendTx(robonomics, robonomics.lighthouse, 'to', [msg.liability, data], { from: robonomics.account, gas: 400000 })
    .then((r) => {
      console.log('===================');
      console.log('Liability finalize tx', r);
      return r
    })
    .catch((e) => {
      console.log('===================');
      console.log('Liability finalize e', e);
    })
}
