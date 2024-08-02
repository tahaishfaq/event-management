const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
    }
});

const initializePayment = async (amount, email, callbackUrl) => {
    try {
        const response = await paystack.post('/transaction/initialize', {
            amount: amount * 100, // convert to kobo
            email: email,
            callback_url: callbackUrl
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};
const verifyPayment = async (reference) => {
    try {
        const response = await paystack.get(`/transaction/verify/${reference}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

const fetchBanks = async () => {
    try {
      const response = await paystack.get('/bank');
      return response.data;
    } catch (error) {
      console.error("Error fetching banks:", error.response.data);
      throw new Error(error.response.data.message);
    }
  };

  const createTransferRecipient = async (authorizationCode, name) => {
    try {
      const response = await paystack.post('/transferrecipient', {
        type: 'authorization',
        name,
        authorization_code: authorizationCode,
        currency: 'NGN',
      });
      return response.data;
    } catch (error) {
      console.error("Error creating transfer recipient:", error.response.data);
      throw new Error(error.response.data.message);
    }
  };
  
  const initiateTransfer = async (amount, recipientCode) => {
    try {
      const response = await paystack.post('/transfer', {
        source: 'balance',
        amount,
        recipient: recipientCode,
        reason: 'Withdrawal',
      });
      return response.data;
    } catch (error) {
      console.error("Error initiating transfer:", error.response.data);
      throw new Error(error.response.data.message);
    }
  };

  const chargeCard = async (email, amount, cardDetails) => {
    try {
      const response = await paystack.post('/charge', {
        email,
        amount, // Amount in kobo
        card: {
          number: cardDetails.card_number,
          cvv: cardDetails.card_cvv,
          expiry_month: cardDetails.card_expiry_month,
          expiry_year: cardDetails.card_expiry_year,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error charging card:", error.response.data);
      throw new Error(error.response.data.message);
    }
  };



module.exports = {
    initializePayment,
    verifyPayment,
    createTransferRecipient,
    initiateTransfer,
    fetchBanks,
    chargeCard
};
