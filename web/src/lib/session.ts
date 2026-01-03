export function getGuestSessionId(): string {
  const key = "agora_guest_session_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const newId =
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(key, newId);
  return newId;
}
