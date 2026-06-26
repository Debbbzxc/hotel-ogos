/**
 * Server-side Validation Utility for Hotel Ogos Room Reservations
 * Recalculates price payload and sanitizes notes to prevent XSS.
 */

const ROOM_RATES = {
  premium: { 12: 825, 24: 1365 },
  deluxe: { 12: 865, 24: 1405 },
  regency: { 12: 935, 24: 1475 },
  regency2: { 12: 1135, 24: 1675 },
  mega_suite: { 12: 1960, 24: 2500 }
};

const HOURS_WHITELIST = [12, 24];

/**
 * Strips HTML tags and angle brackets to prevent XSS injection.
 */
function sanitizeString(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').replace(/[<>]/g, '');
}

/**
 * Validates the reservation payload and returns the verified price or throws an error.
 */
function validateReservation(payload) {
  const {
    checkInDate,
    checkOutDate,
    checkInTime,
    selectedRoom,
    hours,
    notes,
    clientTotalAmount
  } = payload;

  // 1. Check Required Fields
  if (!checkInDate || !checkOutDate || !checkInTime || !selectedRoom || !hours) {
    throw new Error('All reservation fields are required.');
  }

  // 2. Validate Date Formats and Chronology
  const [ciYear, ciMonth, ciDay] = checkInDate.split('-').map(Number);
  const [coYear, coMonth, coDay] = checkOutDate.split('-').map(Number);

  const checkIn = new Date(ciYear, ciMonth - 1, ciDay);
  const checkOut = new Date(coYear, coMonth - 1, coDay);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error('Invalid date formats.');
  }

  if (checkIn < today) {
    throw new Error('Check-in Date cannot be in the past.');
  }

  if (checkOut < checkIn) {
    throw new Error('Check-out Date must be greater than or equal to Check-in Date.');
  }

  // 3. Same-Day Time Validation
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (checkInDate === todayStr) {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const [inputHour, inputMin] = checkInTime.split(':').map(Number);
    if (isNaN(inputHour) || isNaN(inputMin)) {
      throw new Error('Invalid check-in time format.');
    }

    if (inputHour < currentHour || (inputHour === currentHour && inputMin <= currentMin)) {
      throw new Error('Check-in Time cannot be in the past for today.');
    }
  }

  // 4. Validate Room ID
  const roomRates = ROOM_RATES[selectedRoom];
  if (!roomRates) {
    throw new Error('Invalid room type selected.');
  }

  // 5. Whitelist Stay Duration
  const duration = Number(hours);
  if (!HOURS_WHITELIST.includes(duration)) {
    throw new Error('Invalid stay duration selected.');
  }

  // 6. Calculate Stay Duration in Days
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // 7. Recalculate Total Price (Server-Side Source of Truth)
  let calculatedPrice = 0;
  if (diffDays > 1) {
    // Timeline > 24 Hours: 24-Hr Rate * Number of Days Stayed
    const dayRate = roomRates[24];
    calculatedPrice = dayRate * diffDays;
  } else {
    // Timeline <= 24 Hours: Base Rate for selected hours package
    calculatedPrice = roomRates[duration] || 0;
  }

  // 8. Server-Side Verification: Compare with Client-Side Payload
  if (calculatedPrice !== Number(clientTotalAmount)) {
    throw new Error(`Price verification failed. Expected PHP ${calculatedPrice}, got PHP ${clientTotalAmount}.`);
  }

  // 9. Sanitize Optional Notes
  const sanitizedNotes = sanitizeString(notes).slice(0, 500);

  return {
    verified: true,
    totalAmount: calculatedPrice,
    notes: sanitizedNotes
  };
}

module.exports = {
  validateReservation
};
