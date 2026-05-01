// Per-channel rolling short-term memory (in-memory, resets on restart).
const MAX_TURNS = 12;
const store = new Map(); // channelId -> [{role, content}]

export function remember(channelId, role, content) {
  const arr = store.get(channelId) || [];
  arr.push({ role, content });
  while (arr.length > MAX_TURNS * 2) arr.shift();
  store.set(channelId, arr);
}

export function recall(channelId) {
  return store.get(channelId) || [];
}

export function forget(channelId) {
  store.delete(channelId);
}
