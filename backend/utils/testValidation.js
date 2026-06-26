/**
 * Test Suite for validateReservation.js
 * Verifies all date, time, whitelist, XSS sanitization, and pricing integrity checks.
 */

const assert = require('assert');
const { validateReservation } = require('./validateReservation');

console.log('Starting reservation validation tests...\n');

// Helper to get formatted dates
const getOffsetDateStr = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const todayStr = getOffsetDateStr(0);
const tomorrowStr = getOffsetDateStr(1);
const dayAfterTomorrowStr = getOffsetDateStr(2);

let testsRun = 0;
let testsPassed = 0;

function runTest(name, fn) {
  testsRun++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

// Test 1: Happy Path - Single Day (12 hours)
runTest('Happy Path - Premium Room for 12 Hours', () => {
  const payload = {
    checkInDate: tomorrowStr,
    checkOutDate: tomorrowStr,
    checkInTime: '14:00',
    selectedRoom: 'premium',
    hours: 12,
    notes: 'Near the elevator, please.',
    clientTotalAmount: 825
  };

  const result = validateReservation(payload);
  assert.strictEqual(result.verified, true);
  assert.strictEqual(result.totalAmount, 825);
  assert.strictEqual(result.notes, 'Near the elevator, please.');
});

// Test 2: Happy Path - Multi-day (2 days stay, 24 hours locked package)
runTest('Happy Path - Deluxe Room for 2 Days (Multi-day stay)', () => {
  const payload = {
    checkInDate: tomorrowStr,
    checkOutDate: getOffsetDateStr(3),
    checkInTime: '12:00',
    selectedRoom: 'deluxe',
    hours: 24,
    notes: '',
    clientTotalAmount: 2810 // 1405 * 2
  };

  const result = validateReservation(payload);
  assert.strictEqual(result.verified, true);
  assert.strictEqual(result.totalAmount, 2810);
});

// Test 3: Failure - Past Check-in Date
runTest('Failure - Check-in Date in the past', () => {
  const payload = {
    checkInDate: '2025-01-01',
    checkOutDate: tomorrowStr,
    checkInTime: '12:00',
    selectedRoom: 'regency',
    hours: 24,
    notes: '',
    clientTotalAmount: 1475
  };

  assert.throws(() => {
    validateReservation(payload);
  }, /Check-in Date cannot be in the past/);
});

// Test 4: Failure - Check-out before Check-in
runTest('Failure - Check-out Date before Check-in Date', () => {
  const payload = {
    checkInDate: tomorrowStr,
    checkOutDate: todayStr,
    checkInTime: '12:00',
    selectedRoom: 'regency',
    hours: 24,
    notes: '',
    clientTotalAmount: 1475
  };

  assert.throws(() => {
    validateReservation(payload);
  }, /Check-out Date must be greater than or equal to Check-in Date/);
});

// Test 5: Failure - Same-Day Past Time (Dynamic calculation to guarantee past time)
runTest('Failure - Check-in Time in the past for today\'s date', () => {
  const now = new Date();
  // 30 minutes in the past
  now.setMinutes(now.getMinutes() - 30);
  const pastHour = String(now.getHours()).padStart(2, '0');
  const pastMin = String(now.getMinutes()).padStart(2, '0');
  const pastTimeStr = `${pastHour}:${pastMin}`;

  const payload = {
    checkInDate: todayStr,
    checkOutDate: todayStr,
    checkInTime: pastTimeStr,
    selectedRoom: 'premium',
    hours: 12,
    notes: '',
    clientTotalAmount: 825
  };

  assert.throws(() => {
    validateReservation(payload);
  }, /Check-in Time cannot be in the past for today/);
});

// Test 6: Failure - Invalid Stay Duration (Whitelist check)
runTest('Failure - Invalid Stay Duration (Whitelist violation)', () => {
  const payload = {
    checkInDate: tomorrowStr,
    checkOutDate: tomorrowStr,
    checkInTime: '12:00',
    selectedRoom: 'regency2',
    hours: 18, // Not in [12, 24]
    notes: '',
    clientTotalAmount: 1135
  };

  assert.throws(() => {
    validateReservation(payload);
  }, /Invalid stay duration selected/);
});

// Test 7: Failure - Altered clientTotalAmount (Price verification failure)
runTest('Failure - Price Payload altered (forgery check)', () => {
  const payload = {
    checkInDate: tomorrowStr,
    checkOutDate: tomorrowStr,
    checkInTime: '12:00',
    selectedRoom: 'mega_suite',
    hours: 24,
    notes: '',
    clientTotalAmount: 1500 // Alchemist forged value (correct is 2500)
  };

  assert.throws(() => {
    validateReservation(payload);
  }, /Price verification failed/);
});

// Test 8: Success - XSS Notes Sanitization
runTest('Success - XSS script tags stripped and length sliced', () => {
  const maliciousNotes = '<script>alert("xss")</script><b>Bold Note</b>';
  const payload = {
    checkInDate: tomorrowStr,
    checkOutDate: tomorrowStr,
    checkInTime: '12:00',
    selectedRoom: 'premium',
    hours: 24,
    notes: maliciousNotes,
    clientTotalAmount: 1365
  };

  const result = validateReservation(payload);
  assert.strictEqual(result.verified, true);
  assert.strictEqual(result.notes, 'alert("xss")Bold Note');
});

console.log(`\nTests finished: ${testsPassed}/${testsRun} passed.`);
if (testsPassed !== testsRun) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
}
