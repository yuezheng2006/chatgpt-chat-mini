export async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const timeout = 30 * 1000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}
