export function getApiUrl(
  configuredUrl: string | undefined,
  hostUri: string | undefined,
  development: boolean,
): string {
  if (configuredUrl?.trim()) return configuredUrl.trim().replace(/\/$/, "");
  if (development && hostUri) {
    const url = new URL(
      hostUri.includes("://") ? hostUri : `http://${hostUri}`,
    );
    if (
      url.hostname.endsWith(".exp.direct") ||
      url.hostname.includes(".ngrok")
    ) {
      url.protocol = "https:";
      if (url.port === "80") url.port = "";
    }
    return `${url.origin}/cineapp-api`;
  }
  return "http://localhost:3000";
}
