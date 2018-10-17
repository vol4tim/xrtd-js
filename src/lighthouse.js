import Promise from 'bluebird'
import _ from 'lodash'

const info = {
  members: [],
  timeoutBlocks: 0,
  keepaliveBlock: 0,
  marker: 0,
  quota: 0
}

export default (robonomics) => {
  return Promise.join(
    robonomics.lighthouse.call('quota'),
    robonomics.lighthouse.call('marker'),
    robonomics.lighthouse.call('keepaliveBlock'),
    robonomics.lighthouse.call('timeoutBlocks'),
    (...result) => {
      info.quota = Number(result[0])
      info.marker = Number(result[1])
      info.keepaliveBlock = Number(result[2])
      info.timeoutBlocks = Number(result[3])
    }
  )
    .then(() => robonomics.lighthouse.getMembers())
    .then((result) => {
      info.members = []
      const quotas = []
      result.forEach((member, i) => {
        info.members.push({
          i,
          address: member,
          quota: 0
        })
        quotas.push(robonomics.lighthouse.call('quotaOf', [member]))
      })
      return Promise.all(quotas)
    })
    .then((res) => {
      res.forEach((quota, i) => {
        info.members[i].quota = Number(quota)
      })
      info.members = _.sortBy(info.members, 'i')
      return info
    })
}
