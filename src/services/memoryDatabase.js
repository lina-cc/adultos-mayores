function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createMemoryDatabase() {
  const collections = new Map();

  function bucket(name) {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name);
  }

  return {
    async set(collection, id, data) {
      bucket(collection).set(id, clone(data));
      return { id, ...clone(data) };
    },
    async add(collection, data) {
      const id = `${collection}_${bucket(collection).size + 1}_${Math.random().toString(36).slice(2, 8)}`;
      return this.set(collection, id, { ...data, id });
    },
    async get(collection, id) {
      const doc = bucket(collection).get(id);
      return doc ? clone(doc) : null;
    },
    async update(collection, id, patch) {
      const current = bucket(collection).get(id);
      if (!current) throw new Error('Documento no encontrado.');
      const next = { ...current, ...clone(patch) };
      bucket(collection).set(id, next);
      return clone(next);
    },
    async list(collection) {
      return [...bucket(collection).values()].map(clone);
    },
    async find(collection, predicate) {
      return (await this.list(collection)).filter(predicate);
    },
  };
}
