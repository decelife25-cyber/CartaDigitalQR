const PUBLIC_PREFIX = '/carta-camborio';
const ORIGIN = 'https://cartadigitalqr.pages.dev';

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);

    // This Worker is only responsible for the CartaDigitalQR public path.
    if (
      incomingUrl.pathname !== PUBLIC_PREFIX &&
      !incomingUrl.pathname.startsWith(`${PUBLIC_PREFIX}/`)
    ) {
      return new Response('Not Found', { status: 404 });
    }

    // Keep the public URL in the browser. Only the origin request is changed:
    // /carta-camborio/foo -> https://cartadigitalqr.pages.dev/foo
    const upstreamUrl = new URL(ORIGIN);
    const upstreamPath = incomingUrl.pathname.slice(PUBLIC_PREFIX.length) || '/';
    upstreamUrl.pathname = upstreamPath;
    upstreamUrl.search = incomingUrl.search;

    const upstreamRequest = new Request(upstreamUrl.toString(), request);

    // No 301/302 redirect is returned to the browser. Cloudflare fetches the
    // Pages origin internally and returns that response under www.decelife.com.
    return fetch(upstreamRequest);
  },
};
