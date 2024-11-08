// api/trade.js

const fetch = require('node-fetch');
const DERIV_API_URL = "https://api.deriv.com/v3";

async function authorize(token) {
    const response = await fetch(`${DERIV_API_URL}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorize: token })
    });
    return response.json();
}

async function placeTrade(token, tradeParams) {
    const response = await fetch(`${DERIV_API_URL}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            buy: 1,
            price: tradeParams.amount,
            parameters: {
                amount: tradeParams.amount,
                basis: 'stake',
                contract_type: tradeParams.contractType,
                currency: 'USD',
                duration: tradeParams.duration,
                duration_unit: tradeParams.durationUnit,
                symbol: tradeParams.symbol,
                barrier: tradeParams.barrier
            }
        })
    });
    return response.json();
}

module.exports = async (req, res) => {
    if (req.method === "POST") {
        try {
            const token = process.env.DERIV_API_TOKEN;
            
            // Authorize with Deriv API
            const auth = await authorize(token);
            if (auth.error) {
                console.error("Authorization error:", auth.error);
                return res.status(401).json({ error: "Authorization failed", message: auth.error.message });
            }

            // Get trade parameters from request
            const { symbol, amount, contractType, duration, durationUnit, barrier } = req.body;

            // Place a trade
            const tradeResult = await placeTrade(token, { symbol, amount, contractType, duration, durationUnit, barrier });
            
            if (tradeResult.error) {
                console.error("Trade error:", tradeResult.error);
                return res.status(500).json({ error: "Trade failed", message: tradeResult.error.message });
            }

            // Send successful trade ID
            return res.status(200).json({ message: "Trade successful", tradeId: tradeResult.buy.contract_id });

        } catch (error) {
            console.error("Server error:", error);
            res.status(500).json({ error: "Server error", message: error.message });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
};
