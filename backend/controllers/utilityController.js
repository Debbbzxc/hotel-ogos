const axios = require('axios');

/**
 * GET /api/utility-bills/customer
 * Proxy request to Aquabill System to get Hotel Ogos customer details.
 */
const getCustomerDetails = async (req, res) => {
  try {
    const aquabillUrl = process.env.AQUABILL_URL || 'http://localhost:3000';
    const apiKey = process.env.AQUABILL_API_KEY || 'apikey1234';

    console.log(`Fetching customer details from Aquabill: ${aquabillUrl}/api/hotel-ogos/customer`);

    const response = await axios.get(`${aquabillUrl}/api/hotel-ogos/customer`, {
      headers: {
        'x-api-key': apiKey
      }
    });

    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching customer details from Aquabill:', error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || 'Error communicating with Aquabill System';
    res.status(statusCode).json({ success: false, message });
  }
};

/**
 * GET /api/utility-bills/bills
 * Proxy request to Aquabill System to get Hotel Ogos water bills.
 */
const getBills = async (req, res) => {
  try {
    const aquabillUrl = process.env.AQUABILL_URL || 'http://localhost:3000';
    const apiKey = process.env.AQUABILL_API_KEY || 'apikey1234';
    const { status } = req.query;

    console.log(`Fetching bills from Aquabill: ${aquabillUrl}/api/hotel-ogos/bills${status ? `?status=${status}` : ''}`);

    const response = await axios.get(`${aquabillUrl}/api/hotel-ogos/bills`, {
      headers: {
        'x-api-key': apiKey
      },
      params: status ? { status } : {}
    });

    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching bills from Aquabill:', error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || 'Error communicating with Aquabill System';
    res.status(statusCode).json({ success: false, message });
  }
};

/**
 * POST /api/utility-bills/pay
 * Proxy request to Aquabill System to post a direct payment for a water bill.
 */
const payBill = async (req, res) => {
  try {
    const aquabillUrl = process.env.AQUABILL_URL || 'http://localhost:3000';
    const apiKey = process.env.AQUABILL_API_KEY || 'apikey1234';
    const { billId, amountPaid, referenceNumber } = req.body;

    if (!billId || !amountPaid || isNaN(amountPaid) || parseFloat(amountPaid) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid or missing billId or amountPaid.' });
    }

    const refNum = referenceNumber || `OGOS-UTILITY-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    console.log(`Posting bill payment to Aquabill: ${aquabillUrl}/api/hotel-ogos/pay`, { billId, amountPaid, referenceNumber: refNum });

    const response = await axios.post(`${aquabillUrl}/api/hotel-ogos/pay`, {
      billId,
      amountPaid: Number(amountPaid),
      referenceNumber: refNum
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: response.data.data
    });
  } catch (error) {
    console.error('Error posting bill payment to Aquabill:', error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || 'Error communicating with Aquabill System';
    res.status(statusCode).json({ success: false, message });
  }
};

module.exports = {
  getCustomerDetails,
  getBills,
  payBill
};
