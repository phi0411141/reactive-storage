import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReactiveStorage } from '../ReactiveStorage'
import type { Adaptor, StorageKey } from '../reactive-storage-types'

// Mock storage adaptor
class MockAdaptor implements Adaptor {
  private storage: Map<string, string>
  private listeners: Map<string, Array<(value: any | null) => void>>

  constructor() {
    this.storage = new Map()
    this.listeners = new Map()
  }

  get(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  set(key: string, value: string): void {
    this.storage.set(key, value)
    this.notifyListeners(key, value)
  }

  remove(key: string): void {
    this.storage.delete(key)
    this.notifyListeners(key, null)
  }

  onValueChanged<Value>(key: string, callback: (value: Value) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)?.push(callback)

    return () => {
      const listeners = this.listeners.get(key) ?? []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(key: string, value: string | null) {
    this.listeners.get(key)?.forEach(listener => listener(value))
  }
}

describe('ReactiveStorage', () => {
  let adaptor: Adaptor
  let storage: ReactiveStorage<{
    count: StorageKey<number>
    name: StorageKey<string>
    items: StorageKey<string[]>
  }>

  beforeEach(() => {
    adaptor = new MockAdaptor()
    storage = new ReactiveStorage(adaptor, {
      count: {
        serialize: (val: number) => String(val),
        deserialize: (val: string) => Number(val),
        persistent: true,
      },
      name: {
        serialize: (val: string) => val,
        deserialize: (val: string) => val,
        persistent: true,
      },
      items: {
        serialize: (val: string[]) => JSON.stringify(val),
        deserialize: (val: string) => JSON.parse(val),
        persistent: true,
      },
    })
  })

  it('should set and get values correctly', () => {
    storage.set('count', 42)
    storage.set('name', 'test')
    storage.set('items', ['item1', 'item2'])

    expect(storage.get('count')).toBe(42)
    expect(storage.get('name')).toBe('test')
    expect(storage.get('items')).toEqual(['item1', 'item2'])
  })

  it('should return null for non-existent values', () => {
    expect(storage.get('count')).toBeNull()
    expect(storage.get('name')).toBeNull()
    expect(storage.get('items')).toBeNull()
  })

  it('should remove values correctly', () => {
    storage.set('count', 42)
    storage.set('name', 'test')

    storage.remove('count')
    expect(storage.get('count')).toBeNull()
    expect(storage.get('name')).toBe('test')
  })

  it('should clear non-persistent values', () => {
    const storageWithPersistent = new ReactiveStorage(adaptor, {
      count: {
        serialize: (val: number) => String(val),
        deserialize: (val: string) => Number(val),
        persistent: false,
      },
      name: {
        serialize: (val: string) => val,
        deserialize: (val: string) => val,
        persistent: true,
      },
    })

    storageWithPersistent.set('count', 42)
    storageWithPersistent.set('name', 'test')

    storageWithPersistent.clear()
    expect(storageWithPersistent.get('count')).toBeNull()
    expect(storageWithPersistent.get('name')).toBe('test')
  })

  it('should notify listeners when values change', () => {
    const listener = vi.fn()
    storage.registerListener('count', listener)

    storage.set('count', 42)
    expect(listener).toHaveBeenCalledWith(42)

    storage.remove('count')
    expect(listener).toHaveBeenCalledWith(null)
  })

  it('should unregister listeners correctly', () => {
    const listener = vi.fn()
    const unregister = storage.registerListener('count', listener)

    if (unregister) {
      unregister()
    }

    storage.set('count', 42)
    expect(listener).not.toHaveBeenCalled()
  })
}) 