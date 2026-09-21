import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore = new Map<string, string>();

async function nativeCall<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('Persistent storage is unavailable; using memory storage for this session.', error);
    return fallback;
  }
}

export const SafeStorage = {
  getItem(key: string): Promise<string | null> {
    return nativeCall(
      () => AsyncStorage.getItem(key),
      memoryStore.get(key) ?? null
    ).then((value) => {
      if (value !== null) memoryStore.set(key, value);
      return value;
    });
  },

  setItem(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);
    return nativeCall(() => AsyncStorage.setItem(key, value), undefined);
  },

  removeItem(key: string): Promise<void> {
    memoryStore.delete(key);
    return nativeCall(() => AsyncStorage.removeItem(key), undefined);
  },
};

export const SupabaseStorage = {
  getItem: (key: string) => SafeStorage.getItem(key),
  setItem: (key: string, value: string) => SafeStorage.setItem(key, value),
  removeItem: (key: string) => SafeStorage.removeItem(key),
};
