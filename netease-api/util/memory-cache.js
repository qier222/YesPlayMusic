class MemoryCache {
  constructor() {
    this.cache = new Map()
    this.size = 0
  }

  add(key, value, time, timeoutCallback) {
    // 移除旧的条目（如果存在）
    const old = this.cache.get(key)
    if (old) {
      clearTimeout(old.timeout)
    }

    // 创建新的缓存条目
    const entry = {
      value,
      expire: time + Date.now(),
      timeout: setTimeout(() => {
        this.delete(key)
        if (typeof timeoutCallback === 'function') {
          timeoutCallback(value, key)
        }
      }, time),
    }

    this.cache.set(key, entry)
    this.size = this.cache.size

    return entry
  }

  delete(key) {
    const entry = this.cache.get(key)
    if (entry) {
      clearTimeout(entry.timeout)
      this.cache.delete(key)
      this.size = this.cache.size
    }
    return null
  }

  get(key) {
    return this.cache.get(key) || null
  }

  getValue(key) {
    const entry = this.cache.get(key)
    return entry ? entry.value : undefined
  }

  clear() {
    this.cache.forEach((entry) => clearTimeout(entry.timeout))
    this.cache.clear()
    this.size = 0
    return true
  }

  has(key) {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expire) {
      this.delete(key)
      return false
    }

    return true
  }
}

module.exports = MemoryCache
