// Node 25 ships a built-in Web Storage global that shadows jsdom's Storage and
// is inert without --localstorage-file, so `localStorage.setItem` is undefined
// in tests. Replacing it with an in-memory Storage keeps the app code under
// test unchanged.
class MemoryStorage {
    #items = new Map()

    getItem(key) {
        return this.#items.has(key) ? this.#items.get(key) : null
    }

    setItem(key, value) {
        this.#items.set(key, String(value))
    }

    removeItem(key) {
        this.#items.delete(key)
    }

    clear() {
        this.#items.clear()
    }
}

Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
})
