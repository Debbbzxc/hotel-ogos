

const ROOM_RATES = {
  premium: { 12: 825, 24: 1365 },
  deluxe: { 12: 865, 24: 1405 },
  regency: { 12: 935, 24: 1475 },
  regency2: { 12: 1135, 24: 1675 },
  mega_suite: { 12: 1960, 24: 2500 }
};

const HOURS_WHITELIST = [12, 24];


function sanitizeString(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').replace(/[<>]/g, '');
}


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

  
  if (!checkInDate || !checkOutDate || !checkInTime || !selectedRoom || !hours) {
    throw new Error('All reservation fields are required.');
  }

  
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

  
  const roomRates = ROOM_RATES[selectedRoom];
  if (!roomRates) {
    throw new Error('Invalid room type selected.');
  }

  
  const duration = Number(hours);
  const isValidDuration = duration === 12 || (duration % 24 === 0 && duration > 0);
  if (!isValidDuration) {
    throw new Error('Invalid stay duration selected.');
  }

  
  let calculatedPrice = 0;
  if (duration > 24) {
    const dayRate = roomRates[24];
    calculatedPrice = dayRate * (duration / 24);
  } else {
    calculatedPrice = roomRates[duration] || 0;
  }

  
  if (calculatedPrice !== Number(clientTotalAmount)) {
    throw new Error(`Price verification failed. Expected PHP ${calculatedPrice}, got PHP ${clientTotalAmount}.`);
  }

  
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
