import status from './status'

export default () => {
  console.log('===================');
  if (status.providerStatus === 0) {
    console.log('load app');
  } else if (status.providerStatus === 1) {
    // все ок
    console.log('balance', status.balance + ' ETH / ' + status.xrt + ' XRT', '| marker', status.marker, '| quota', status.quota);
  } else if (status.providerStatus === 2) {
    console.log('not enough balance');
    console.log('balance', status.balance + ' ETH');
  } else if (status.providerStatus === 3) {
    console.log('not your turn');
    console.log('timeoutBlocks', status.timeoutBlocks);
    console.log('keepaliveBlock', status.keepaliveBlock);
    console.log('marker', status.marker);
    console.log('quota', status.quota);
  } else if (status.providerStatus === 4) {
    console.log('member not found');
    console.log('members', status.members);
  }
}
