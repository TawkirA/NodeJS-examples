const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const app = express();
const PORT = 3000;

app.get('/', (req, res, next) => {
    res.send("Hello World!!");
});

/**
 * GET /api/search
 * Searches for assets, companies, or tickers by a query string
 * Query format: ?q=apple
 */
app.get('/api/search', async (req, res) => {
    console.log('INSIDE SEARCH');
    try {
        const queryStr = req.query.q;
        if (!queryStr) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        // EXPLICIT CONFIG: Force Yahoo to look for quotes and skip news to avoid empty fallbacks
        const searchOptions = {
            quotesCount: 5,        // Fetches up to 5 matching stock/ETF tickers
            newsCount: 0,          // Set to 0 to skip heavy news processing 
            enableFuzzyQuery: true // Required for partial ticker matching like "infy"
        };

        const YF = new yahooFinance();
        const searchResults = await YF.search(queryStr, { quotesCount: 5, newsCount: 0 });
        
        // Log this to your terminal to inspect the raw structure
        console.log("Raw search results:", searchResults);

        res.json({ 
            success: true, 
            data: searchResults 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/:n', (req, res, next) => {
    let n = parseInt(req.params.n);
    let count = 0;

    if (n > 5000000000) n = 5000000000;

    for (let i=0; i<=n; i++) {
        count += i;
    }

    res.send(`Final count is ${count}`);
});

/**
 * GET /api/quote/:symbol
 * Fetches real-time market data for a given ticker symbol (e.g., AAPL, TSLA)
 */
app.get('/api/quote/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const YF = new yahooFinance();
        const quote = await YF.quote(symbol);
        
        if (!quote) {
            return res.status(404).json({ error: 'Ticker symbol not found' });
        }
        
        res.json({ success: true, data: quote });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/historical/:symbol
 * Fetches historical price data using query parameters for date range
 * Query format: ?from=2026-01-01&to=2026-06-01&period=1d
 */
app.get('/api/historical/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const { from, to, period } = req.query;

        // Default constraints if parameters are missing
        const queryOptions = {
            period1: from || '2025-01-01', 
            period2: to || new Date().toISOString().split('T')[0],
            interval: period || '1d' // Choices: '1d', '1wk', '1mo'
        };

        const YF = new yahooFinance();
        const historicalData = await YF.historical(symbol, queryOptions);
        res.json({ success: true, symbol, data: historicalData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`App listening at PORT - ${PORT}`);
});



