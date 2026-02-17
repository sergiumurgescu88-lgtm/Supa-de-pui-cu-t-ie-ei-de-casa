import CryptoJS from 'crypto-js';

const FUTURES_URL = 'https://fapi.binance.com';
const SPOT_URL = 'https://api.binance.com';

export type MarketType = 'Futures' | 'Spot';

export class BinanceService {
  private apiKey: string;
  private apiSecret: string;
  private market: MarketType;
  private baseUrl: string;

  constructor(apiKey: string, apiSecret: string, market: MarketType = 'Futures') {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.market = market;
    this.baseUrl = market === 'Futures' ? FUTURES_URL : SPOT_URL;
  }

  private sign(queryString: string): string {
    return CryptoJS.HmacSHA256(queryString, this.apiSecret).toString(CryptoJS.enc.Hex);
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', params: Record<string, any> = {}) {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error("API Keys missing");
    }

    const timestamp = Date.now();
    let queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    // Add timestamp
    queryString += (queryString ? '&' : '') + `timestamp=${timestamp}`;

    // Sign
    const signature = this.sign(queryString);
    queryString += `&signature=${signature}`;

    const url = `${this.baseUrl}${endpoint}?${queryString}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Handle specific error for Spot keys on Futures
        if (this.market === 'Futures' && errorText.includes('API key does not have permission')) {
           throw new Error("Permission Error: Your keys might be Spot only. Switch to Spot in Settings.");
        }
        throw new Error(`Binance API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Binance Request Failed:", error);
      throw error;
    }
  }

  // --- Unified Methods ---

  async getAccountBalance() {
    if (this.market === 'Futures') {
      const data = await this.makeRequest('/fapi/v2/account');
      const usdtAsset = data.assets.find((a: any) => a.asset === 'USDT');
      return usdtAsset ? parseFloat(usdtAsset.walletBalance) : 0;
    } else {
      // SPOT: /api/v3/account
      const data = await this.makeRequest('/api/v3/account');
      const usdtAsset = data.balances.find((a: any) => a.asset === 'USDT');
      return usdtAsset ? parseFloat(usdtAsset.free) : 0;
    }
  }

  async getOpenPositions() {
    if (this.market === 'Futures') {
      const data = await this.makeRequest('/fapi/v2/positionRisk');
      return data.filter((pos: any) => parseFloat(pos.positionAmt) !== 0).map((pos: any) => ({
        id: `${pos.symbol}-${Date.now()}`,
        pair: pos.symbol,
        type: parseFloat(pos.positionAmt) > 0 ? 'Long' : 'Short',
        entry: parseFloat(pos.entryPrice),
        size: Math.abs(parseFloat(pos.positionAmt) * parseFloat(pos.entryPrice)),
        amount: Math.abs(parseFloat(pos.positionAmt)),
        leverage: parseInt(pos.leverage),
        stopLoss: 0,
        unRealizedProfit: parseFloat(pos.unRealizedProfit),
        markPrice: parseFloat(pos.markPrice),
        market: 'Futures'
      }));
    } else {
      // SPOT: Treat positive asset balances as "Long" positions
      const data = await this.makeRequest('/api/v3/account');
      const balances = data.balances.filter((b: any) => parseFloat(b.free) > 0 && b.asset !== 'USDT');
      
      // We need current prices to estimate value
      // This is a simplified "Mock" for spot positions because getting all prices is heavy
      // Real implementation would fetch ticker prices here.
      
      return balances.map((b: any) => ({
        id: `${b.asset}USDT-${Date.now()}`,
        pair: `${b.asset}USDT`,
        type: 'Long', // Spot is always Long (unless Margin borrowed)
        entry: 0, // Spot API doesn't give avg entry price easily, would need trade history
        size: parseFloat(b.free), // This is amount, not USD value. UI handles approx.
        amount: parseFloat(b.free),
        leverage: 1,
        stopLoss: 0,
        unRealizedProfit: 0, // Cannot calc without entry price
        market: 'Spot'
      }));
    }
  }
}
