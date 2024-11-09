// Trade.js
import fetch from 'node-fetch';

const API_TOKEN = process.env.DERIV_API_TOKEN;
const DERIV_API_URL = "https://api.deriv.com/v3";

async function placeTrade(tradeParams) {
  try {
    const response = await fetch(`${DERIV_API_URL}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`, // Ensure API token is securely sent
      },
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
          barrier: tradeParams.barrier,
        },
      }),
    });

    if (!response.ok) { // Check if the response status is not 2xx
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return { error: { message: "Request failed: " + error.message } };
  }
}

export default async function tradeHandler(req, res) { // Updated name for clarity
  if (req.method === "POST") {
    const { symbol, amount, contractType, duration, durationUnit, barrier } = req.body;

    const tradeResult = await placeTrade({ symbol, amount, contractType, duration, durationUnit, barrier });

    if (tradeResult.error) {
      return res.status(500).json({ error: "Trade failed", message: tradeResult.error.message });
    }

    res.status(200).json({ message: "Trade successful", tradeId: tradeResult.buy.contract_id });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
