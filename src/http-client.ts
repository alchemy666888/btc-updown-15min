import https from 'https';
import { URL } from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
}

/**
 * Simple HTTP client that works well with proxies
 */
export async function fetchJSON<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY;

    const requestOptions: https.RequestOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'polymarket-btc-monitor/1.0.0',
        'Accept': 'application/json',
        ...options.headers
      }
    };

    // Add proxy agent if proxy is configured
    if (proxyUrl) {
      requestOptions.agent = new HttpsProxyAgent(proxyUrl);
    }

    const req = https.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}
