// fetch with timeout

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const timeout = 600000; //60s超时(固定)

  const controller = new AbortController();

  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...init,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}
