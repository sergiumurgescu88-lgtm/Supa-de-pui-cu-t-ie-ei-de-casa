export interface FreqtradeConfig {
  url: string;
  username: string;
  password?: string;
  token?: string;
  skipNgrokHeader?: boolean;
}

export interface BotTrade {
  trade_id: number;
  pair: string;
  is_short: boolean;
  open_date: string;
  close_date?: string;
  open_rate: number;
  current_rate: number;
  profit_ratio: number;
  profit_abs: number;
  strategy: string;
  stake_amount: number;
}

export interface BotProfit {
  profit_all_coin: number;
  profit_closed_coin: number;
  profit_ratio: number;
  winrate: number;
  trade_count: number;
}

export class FreqtradeService {
  private config: FreqtradeConfig;

  constructor(config: FreqtradeConfig) {
    this.config = { ...config };
  }

  private async request(endpoint: string, method: string = 'GET', body?: any, retryCount: number = 0): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const isNgrok = this.config.url.includes('ngrok');
    const useNgrokHeader = isNgrok && this.config.skipNgrokHeader !== true;

    if (useNgrokHeader) {
       headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    let baseUrl = this.config.url.replace(/\/$/, '');
    if (baseUrl.endsWith('/api/v1')) {
        baseUrl = baseUrl.replace('/api/v1', '');
    }
    
    const url = `${baseUrl}/api/v1${endpoint}`;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        mode: 'cors',
        credentials: 'omit'
      });

      if (!res.ok) {
          const text = await res.text().catch(() => 'No response body');
          
          if (res.status === 401) {
              if (endpoint === '/token/login') {
                  throw new Error("Login Failed: Invalid Username or Password. Please check your credentials in Settings.");
              } else {
                  throw new Error("Session Expired: Your bot session is no longer valid. Reconnecting...");
              }
          }

          throw new Error(`Bot API Error: ${res.status} ${res.statusText}\n${text}`);
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
          throw new Error("Ngrok Intercepted: The bot returned a web page instead of data.\n\nACTION: Click 'Bypass Ngrok Landing Page' to set the bypass cookie.");
      }

      return await res.json();
    } catch (err: any) {
      // Handle Preflight/CORS rejection
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
         const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
         const isBotHttp = url.startsWith('http:');
         
         if (isHttps && isBotHttp) {
            throw new Error(`Mixed Content Block: Browsers block HTTPS -> HTTP requests.\n\nFIX: Use an 'https://' Ngrok URL.`);
         }

         if (isNgrok) {
             if (useNgrokHeader && retryCount === 0) {
                 this.config.skipNgrokHeader = true;
                 return this.request(endpoint, method, body, 1);
             }

             throw new Error(`CORS/Preflight Rejected: The bot server is refusing the connection header.\n\nTO FIX THIS, add this line to your bot's config.json under 'api_server':\n\n"cors_allow_headers": ["ngrok-skip-browser-warning", "Authorization", "Content-Type"]`);
         }

         throw new Error(`Network Error: Could not connect to ${baseUrl}. Check if the bot is running.`);
      }
      throw err;
    }
  }

  async login() {
    const data = await this.request('/token/login', 'POST', {
      username: this.config.username,
      password: this.config.password
    });
    this.config.token = data.access_token;
    return data.access_token;
  }

  async getPing() { return this.request('/ping'); }
  async getProfit(): Promise<BotProfit> { return this.request('/profit'); }
  async getBalance() { return this.request('/balance'); }
  async getStatus(): Promise<BotTrade[]> { return this.request('/status'); }
  async getTrades(limit: number = 30): Promise<{ trades: BotTrade[], total_trades: number }> {
    return this.request(`/trades?limit=${limit}`);
  }
  async start() { return this.request('/start', 'POST'); }
  async stop() { return this.request('/stop', 'POST'); }
}