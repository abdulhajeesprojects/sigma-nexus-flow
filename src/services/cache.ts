interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly PERSISTENT_KEYS = new Set(['user_profile', 'theme', 'settings']);

  private constructor() {
    this.memoryCache = new Map();
    this.loadPersistentCache();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private loadPersistentCache(): void {
    try {
      const persistentData = localStorage.getItem('sigma_cache');
      if (persistentData) {
        const cache = JSON.parse(persistentData);
        Object.entries(cache).forEach(([key, value]: [string, any]) => {
          if (this.PERSISTENT_KEYS.has(key)) {
            this.memoryCache.set(key, value);
          }
        });
      }
    } catch (error) {
      console.error('Error loading persistent cache:', error);
    }
  }

  private savePersistentCache(): void {
    try {
      const persistentData: Record<string, CacheItem<any>> = {};
      this.memoryCache.forEach((value, key) => {
        if (this.PERSISTENT_KEYS.has(key)) {
          persistentData[key] = value;
        }
      });
      localStorage.setItem('sigma_cache', JSON.stringify(persistentData));
    } catch (error) {
      console.error('Error saving persistent cache:', error);
    }
  }

  public set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_EXPIRY): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
    this.memoryCache.set(key, item);
    
    if (this.PERSISTENT_KEYS.has(key)) {
      this.savePersistentCache();
    }
  }

  public get<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.expiresIn;
    if (isExpired) {
      this.memoryCache.delete(key);
      if (this.PERSISTENT_KEYS.has(key)) {
        this.savePersistentCache();
      }
      return null;
    }

    return item.data as T;
  }

  public delete(key: string): void {
    this.memoryCache.delete(key);
    if (this.PERSISTENT_KEYS.has(key)) {
      this.savePersistentCache();
    }
  }

  public clear(): void {
    this.memoryCache.clear();
    this.savePersistentCache();
  }

  public has(key: string): boolean {
    return this.memoryCache.has(key);
  }

  // Batch operations
  public setBatch<T>(items: Array<{ key: string; data: T; expiresIn?: number }>): void {
    items.forEach(({ key, data, expiresIn }) => {
      this.set(key, data, expiresIn);
    });
  }

  public getBatch<T>(keys: string[]): Record<string, T | null> {
    return keys.reduce((acc, key) => {
      acc[key] = this.get<T>(key);
      return acc;
    }, {} as Record<string, T | null>);
  }

  // Cache key generators
  public static keys = {
    userProfile: (userId: string) => `user_profile_${userId}`,
    post: (postId: string) => `post_${postId}`,
    postLikes: (postId: string) => `post_likes_${postId}`,
    postComments: (postId: string) => `post_comments_${postId}`,
    feed: (userId: string) => `feed_${userId}`,
    notifications: (userId: string) => `notifications_${userId}`,
    settings: (userId: string) => `settings_${userId}`,
  };
}

export const cacheService = CacheService.getInstance(); 