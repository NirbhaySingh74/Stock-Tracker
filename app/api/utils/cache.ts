type CacheData<T> = {
    data: T
    timestamp: number
  }
  
  class Cache {
    private store: Map<string, CacheData<any>> = new Map()
    private readonly DEFAULT_TTL = 60 * 1000 // 1 minute default TTL
  
    set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
      this.store.set(key, {
        data,
        timestamp: Date.now() + ttl,
      })
    }
  
    get<T>(key: string): T | null {
      const cached = this.store.get(key)
      if (!cached) return null
  
      if (Date.now() > cached.timestamp) {
        this.store.delete(key)
        return null
      }
  
      return cached.data as T
    }
  }
  
  export const cache = new Cache()
  
  