export async function register() {
  // Node.js 25+ has a built-in localStorage behind --localstorage-file.
  // When the flag is provided without a valid path, localStorage exists
  // but its methods throw. Polyfill with a no-op in-memory shim so
  // Next.js dev overlay and other server-side code doesn't crash.
  if (typeof globalThis.localStorage !== "undefined") {
    try {
      globalThis.localStorage.getItem("__test");
    } catch {
      const store = new Map<string, string>();
      (globalThis as Record<string, unknown>).localStorage = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, String(value)),
        removeItem: (key: string) => store.delete(key),
        clear: () => store.clear(),
        get length() {
          return store.size;
        },
        key: (index: number) => [...store.keys()][index] ?? null,
      };
    }
  }
}
