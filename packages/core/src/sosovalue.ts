/**
 * SosoValue API Client
 * Base URL: https://gw.sosovalue.com
 * API Key: SOSO-11e7d4e379b24d0fb33598939aa1356e
 */

const SOSO_VALUE_BASE = 'https://gw.sosovalue.com'
const SOSO_VALUE_API_KEY = 'SOSO-11e7d4e379b24d0fb33598939aa1356e'

interface SosoValueResponse<T> {
  code: string
  message: string
  data: T
}

class SosoValueClient {
  private apiKey: string

  constructor(apiKey: string = SOSO_VALUE_API_KEY) {
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    body?: unknown
  ): Promise<T> {
    const url = `${SOSO_VALUE_BASE}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...(options.headers as Record<string, string>),
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body: body ? JSON.stringify(body) : options.body,
    })

    if (!res.ok) {
      throw new Error(`SosoValue API error: ${res.status} ${res.statusText}`)
    }

    const json: SosoValueResponse<T> = await res.json()

    // Handle both string and number codes - '0', '00000', 0, '200' are all success codes
    const code = String(json.code)
    if (code !== '200' && code !== '00000' && code !== '0') {
      throw new Error(`SosoValue API error: ${json.message || 'Unknown error'} (${json.code})`)
    }

    return json.data
  }

  // ============ Market Data ============

  async getGlobalMarket(): Promise<{
    totalMarketCap: number
    volume24h: number
    btcDominance: number
  }> {
    const data = await this.request<{
      marketCap: number
      volume: number
      marketCapChange: number
    }>('/data/anno/market/quotation/getCryptoTotal')
    return {
      totalMarketCap: data.marketCap,
      volume24h: data.volume,
      btcDominance: 0, // This API doesn't return BTC dominance
    }
  }

  async getTokenList(params: {
    pageNum?: number
    pageSize?: number
    categoriesAtomId?: number
  } = {}): Promise<{
    list: Array<{
      symbol: string
      name: string
      fullName: string
      price: string
      change24h: string
      marketCap: string
      volume24h: string
    }>
    total: number
  }> {
    const data = await this.request<Array<{
      symbol: string
      name: string
      fullName: string
      price: string
      change24Percent: string
      volume24h: string
      marketcap: string
    }>>('/data/symbols/v2/market', { method: 'POST' }, {
      status: 1,
      pageNum: 1,
      pageSize: 100,
      ...params,
    })
    return {
      list: data.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        fullName: item.fullName,
        price: item.price,
        change24h: item.change24Percent,
        marketCap: item.marketcap,
        volume24h: item.volume24h,
      })),
      total: data.length,
    }
  }

  async getHotSectors(): Promise<Array<{
    sectorId: string
    sectorName: string
    slugKey: string
    change24h: number
  }>> {
    return this.request('/data/sector-hot/anno/getConfigSectorHot', { method: 'POST' }, {})
  }

  async getIndexList(): Promise<Array<{
    indexId: string
    indexTicker: string
    indexName: string
    indexType: string
  }>> {
    return this.request('/data/index/anno/findList/v1', { method: 'POST' }, {})
  }

  async getSymbolById(symbolId: string): Promise<{
    id: string
    fullName: string
    name: string
    iconUrl: string
    status: number
  }> {
    return this.request(`/data/symbols/getBySymbolId/${symbolId}`)
  }

  // ============ SSI Indices ============

  async getSSIIndices(): Promise<Array<{
    indexId: string
    indexTicker: string
    indexName: string
    indexType: string
    createTime: string
  }>> {
    return this.request('/indices/index/anno/get/index/list')
  }

  async getIndexInfo(indexTicker: string): Promise<{
    indexId: string
    indexTicker: string
    indexName: string
    description: string
  }> {
    return this.request('/indices/index/anno/find/index/info', { method: 'POST' }, { indexTicker })
  }

  async getIndexConstituents(indexTicker: string): Promise<Array<{
    currencyId: string
    currencyName: string
    symbol: string
  }>> {
    return this.request('/indices/index/anno/find/currency/list', { method: 'POST' }, { indexTicker })
  }

  async getIndexWeights(indexTicker: string): Promise<Array<{
    currencyId: string
    currencyName: string
    weight: number
  }>> {
    return this.request('/indices/index/currencyWeightInfo/anno/findIndexCurrencyList', { method: 'POST' }, { indexTicker })
  }

  // ============ ETF Data ============

  async getETFList(params: {
    pageNum?: number
    pageSize?: number
    market?: 'US' | 'HK'
  } = {}): Promise<{
    list: Array<{
      etfTicker: string
      fundName: string
      issuer: string
      listingDate: string
      expenseRatio: number
      market: string
    }>
    total: number
  }> {
    return this.request('/finance/etf-info-do/anno/findPage', { method: 'POST' }, {
      pageNum: 1,
      pageSize: 20,
      market: 'US',
      ...params,
    })
  }

  async getETFStatistics(params: {
    pageNum?: number
    pageSize?: number
    market?: 'US' | 'HK'
  } = {}): Promise<{
    list: Array<{
      etfTicker: string
      totalNetInflow: number
      cumNetInflow: number
      nav: number
      price: number
      change24h: number
    }>
    total: number
  }> {
    return this.request('/finance/etf-statistics-do/v2/findPage', { method: 'POST' }, {
      pageNum: 1,
      pageSize: 20,
      market: 'US',
      ...params,
    })
  }

  // ============ Crypto Stocks ============

  async getCryptoStocks(params: {
    pageNum?: number
    pageSize?: number
  } = {}): Promise<{
    list: Array<{
      id: string
      ticker: string
      stockFullName: string
      exchange: string
      listingRegion: string
      listingDate: string
      weight: number
      delistingFlag: number
    }>
    total: number
  }> {
    return this.request('/data/crypto-stock-do/findPage', { method: 'POST' }, {
      pageNum: 1,
      pageSize: 50,
      ...params,
    })
  }

  // ============ Bitcoin Treasuries ============

  async getBTCHoldingsByRegion(): Promise<Array<{
    countryEnName: string
    countryTotalHoldingNum: number
    nationalReserveNum: number
    publicCompanyNum: number
  }>> {
    return this.request('/data/coin-reserves-do/getDistributionOfBTCHoldingRegions')
  }

  // ============ Chain On-Chain Data ============

  async getChainStats(params: {
    pageNum?: number
    pageSize?: number
  } = {}): Promise<{
    list: Array<{
      chainId: string
      chainName: string
      chainTvl: number
      changeTvl24h: number
      changeTvl7d: number
      dexVolume1d: number
      activeAddress24h: number
      transaction24h: number
    }>
    total: number
  }> {
    return this.request('/finance/s-chains-statistics-do/findPage', { method: 'POST' }, {
      pageNum: 1,
      pageSize: 20,
      ...params,
    })
  }

  // ============ Chart Data ============

  async getChartData(innerKey: string): Promise<{
    innerKey: string
    chartName: string
    indicatorDataList: Array<{
      indicatorName: string
      data: string
    }>
  }> {
    return this.request('/data/s-chart-config-do/findByName', { method: 'POST' }, {
      innerKey,
      langType: 1,
    })
  }

  // ============ News ============

  async getNews(params: {
    pageNum?: number
    pageSize?: number
    categoryList?: string[]
    sector?: string
  } = {}): Promise<{
    list: Array<{
      id: string
      title: string
      source: string
      publishTime: number
      summary: string
      url: string
      sector: string
    }>
    total: number
  }> {
    return this.request('/contentAndSocial/content/information/v2/findPage', { method: 'POST' }, {
      pageSize: 10,
      categoryList: ['1', '9'],
      userType: 1,
      weight: 0.1,
      isExcludeDuplicate: true,
      ...params,
    })
  }

  // ============ Search ============

  async search(params: {
    keyword: string
    category?: string[]
    pageNum?: number
    pageSize?: number
  }): Promise<{
    pairs: {
      list: Array<{
        symbol: string
        exchangeName: string
        currencyFullName: string
        volume24h: number
      }>
      total: number
    }
    coins: {
      list: Array<{
        coinId: string
        name: string
        symbol: string
        price: number
      }>
      total: number
    }
  }> {
    return this.request('/search/search/v3/globalSearch', { method: 'POST' }, {
      category: ['pairs'],
      pageNum: 1,
      pageSize: 20,
      ...params,
    })
  }
}

// Singleton instance
const sosovalue = new SosoValueClient()

export default sosovalue
