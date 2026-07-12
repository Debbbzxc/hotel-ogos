const axios = require('axios');

/**
 * Sends a POST request to the admin dashboard notification endpoint
 * to trigger a real-time data refetch for the "hotel" system.
 * This function runs asynchronously in the background and catches errors
 * to prevent blocking/failing client request lifecycles.
 */
const notifyAdmin = () => {
  const adminUrl = process.env.ADMIN_URL;
  if (!adminUrl) {
    console.warn("ADMIN_URL is not defined in environment variables. Skipping admin notification.");
    return;
  }

  axios.post(`${adminUrl}/api/notify`, { system: 'hotel' }, { timeout: 5000 })
    .then(() => {
      console.log("Admin notification sent successfully for system 'hotel'.");
    })
    .catch((err) => {
      console.error("Failed to send admin notification:", err.message);
    });
};

module.exports = notifyAdmin;
