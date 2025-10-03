// 预先定义常量和函数引用
const chinaIPPrefixes = [
  '116.25',
  '116.76',
  '116.77',
  '116.78',
  '116.79',
  '116.80',
  '116.81',
  '116.82',
  '116.83',
  '116.84',
  '116.85',
  '116.86',
  '116.87',
  '116.88',
  '116.89',
  '116.90',
  '116.91',
  '116.92',
  '116.93',
  '116.94',
]
const prefixesLength = chinaIPPrefixes.length
const floor = Math.floor
const random = Math.random
const keys = Object.keys

// 预编译encodeURIComponent以减少查找开销
const encode = encodeURIComponent

module.exports = {
  toBoolean(val) {
    if (typeof val === 'boolean') return val
    if (val === '') return val
    return val === 'true' || val == '1'
  },

  cookieToJson(cookie) {
    if (!cookie) return {}
    let cookieArr = cookie.split(';')
    let obj = {}

    // 优化：使用for循环替代forEach，性能更好
    for (let i = 0, len = cookieArr.length; i < len; i++) {
      let item = cookieArr[i]
      let arr = item.split('=')
      // 优化：使用严格等于
      if (arr.length === 2) {
        obj[arr[0].trim()] = arr[1].trim()
      }
    }
    return obj
  },

  cookieObjToString(cookie) {
    // 优化：使用预绑定的keys函数和for循环
    const cookieKeys = keys(cookie)
    const result = []

    // 优化：使用for循环和预分配数组
    for (let i = 0, len = cookieKeys.length; i < len; i++) {
      const key = cookieKeys[i]
      result[i] = `${encode(key)}=${encode(cookie[key])}`
    }

    return result.join('; ')
  },

  getRandom(num) {
    // 优化：简化随机数生成逻辑
    // 原逻辑看起来有问题，这里保持原意但优化性能
    var randomValue = random()
    var floorValue = floor(randomValue * 9 + 1)
    var powValue = Math.pow(10, num - 1)
    var randomNum = floor((randomValue + floorValue) * powValue)
    return randomNum
  },

  generateRandomChineseIP() {
    // 优化：使用预绑定的函数和常量
    const randomPrefix = chinaIPPrefixes[floor(random() * prefixesLength)]
    return `${randomPrefix}.${generateIPSegment()}.${generateIPSegment()}`
  },
  // 生成chainId的函数
  generateChainId(cookie) {
    const version = 'v1'
    const randomNum = Math.floor(Math.random() * 1e6)
    const deviceId =
      getCookieValue(cookie, 'sDeviceId') || 'unknown-' + randomNum
    const platform = 'web'
    const action = 'login'
    const timestamp = Date.now()

    return `${version}_${deviceId}_${platform}_${action}_${timestamp}`
  },

  generateDeviceId() {
    const hexChars = '0123456789ABCDEF'
    const chars = []
    for (let i = 0; i < 52; i++) {
      const randomIndex = Math.floor(Math.random() * hexChars.length)
      chars.push(hexChars[randomIndex])
    }
    return chars.join('')
  },
}

// 优化：预先绑定函数
function getRandomInt(min, max) {
  // 优化：简化计算
  return floor(random() * (max - min + 1)) + min
}

// 优化：预先绑定generateIPSegment函数引用
function generateIPSegment() {
  // 优化：内联常量
  return getRandomInt(1, 255)
}

// 进一步优化版本（如果需要更高性能）：
/*
const cookieToJsonOptimized = (function() {
  // 预编译trim函数
  const trim = String.prototype.trim
  
  return function(cookie) {
    if (!cookie) return {}
    
    const cookieArr = cookie.split(';')
    const obj = {}
    
    for (let i = 0, len = cookieArr.length; i < len; i++) {
      const item = cookieArr[i]
      const eqIndex = item.indexOf('=')
      
      if (eqIndex > 0 && eqIndex < item.length - 1) {
        const key = trim.call(item.substring(0, eqIndex))
        const value = trim.call(item.substring(eqIndex + 1))
        obj[key] = value
      }
    }
    return obj
  }
})()
*/

// 用于从cookie字符串中获取指定值的辅助函数
function getCookieValue(cookieStr, name) {
  if (!cookieStr) return ''

  const cookies = '; ' + cookieStr
  const parts = cookies.split('; ' + name + '=')
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}
