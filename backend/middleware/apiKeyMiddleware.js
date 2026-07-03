const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.INTERNAL_API_KEY || 'apikey1234';

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing API key.'
    });
  }

  next();
};

module.exports = apiKeyMiddleware;
