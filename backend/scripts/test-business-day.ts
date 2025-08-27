/**
 * Business day utility-г тест хийх script
 */

import {
  getBusinessDay,
  getBusinessDayString,
  getCurrentBusinessDayString,
  getBusinessDayRange,
  getBusinessDayRangeString,
} from "../utils/business-day-utils.js";

console.log("🧪 Business Day Utility Test");
console.log("==============================");

// Одоогийн цаг
const now = new Date();
console.log(`📅 Одоогийн цаг: ${now.toISOString()}`);
console.log(
  `🌍 UTC+8 цаг: ${now.toLocaleString("en-US", {
    timeZone: "Asia/Ulaanbaatar",
  })}`
);

// Business day тооцоолох
const businessDay = getBusinessDay(now);
console.log(`🏢 Business day: ${businessDay.toISOString()}`);

// Business day string
const businessDayString = getBusinessDayString(now);
console.log(`📝 Business day string: ${businessDayString}`);

// Одоогийн business day
const currentBusinessDay = getCurrentBusinessDayString();
console.log(`🎯 Одоогийн business day: ${currentBusinessDay}`);

// Business day range
const range = getBusinessDayRange(now);
console.log(`⏰ Business day range:`);
console.log(`   Start: ${range.start.toISOString()}`);
console.log(`   End: ${range.end.toISOString()}`);

// Business day range string
const rangeString = getBusinessDayRangeString(now);
console.log(`📊 Business day range string:`);
console.log(`   Start: ${rangeString.start}`);
console.log(`   End: ${rangeString.end}`);

// Өөр өөр цагуудад тест хийх
console.log("\n🔍 Өөр өөр цагуудад тест:");
console.log("==============================");

const testTimes = [
  { name: "Өглөө 08:00", time: new Date("2024-01-15T08:00:00.000Z") },
  { name: "Өглөө 09:00", time: new Date("2024-01-15T09:00:00.000Z") },
  { name: "Өдөр 12:00", time: new Date("2024-01-15T12:00:00.000Z") },
  { name: "Орой 20:00", time: new Date("2024-01-15T20:00:00.000Z") },
  { name: "Шөнө 02:00", time: new Date("2024-01-15T02:00:00.000Z") },
  { name: "Шөнө 04:00", time: new Date("2024-01-15T04:00:00.000Z") },
];

testTimes.forEach(({ name, time }) => {
  const utc8Time = new Date(
    time.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })
  );
  const businessDayStr = getBusinessDayString(time);
  console.log(`${name}:`);
  console.log(`   UTC+8: ${utc8Time.toISOString()}`);
  console.log(`   Business day: ${businessDayStr}`);
  console.log("");
});

console.log("✅ Test дууслаа!");
