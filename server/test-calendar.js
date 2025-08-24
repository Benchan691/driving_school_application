import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

console.log('🔍 Testing Google Calendar Integration...\n');

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: 'https://www.googleapis.com/auth/calendar.events',
});

const calendar = google.calendar({ version: 'v3', auth });

// Test 1: Check credentials file
function testCredentialsFile() {
  console.log('1️⃣ Testing credentials file...');
  
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      console.log('   ✅ credentials.json found');
      console.log(`   📁 Path: ${CREDENTIALS_PATH}`);
      return true;
    } else {
      console.log('   ❌ credentials.json NOT found');
      console.log(`   📁 Expected path: ${CREDENTIALS_PATH}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error checking credentials file:', error.message);
    return false;
  }
}

// Test 2: Check environment variables
function testEnvironmentVariables() {
  console.log('\n2️⃣ Testing environment variables...');
  
  if (process.env.GOOGLE_CALENDAR_ID) {
    console.log('   ✅ GOOGLE_CALENDAR_ID found');
    console.log(`   📅 Calendar ID: ${process.env.GOOGLE_CALENDAR_ID}`);
    return true;
  } else {
    console.log('   ❌ GOOGLE_CALENDAR_ID not found in .env file');
    console.log('   💡 Add this to your .env file: GOOGLE_CALENDAR_ID=your-calendar-id@gmail.com');
    return false;
  }
}

// Test 3: Test calendar access
async function testCalendarAccess() {
  console.log('\n3️⃣ Testing calendar access...');
  
  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    console.log('   ✅ Calendar access successful!');
    console.log(`   📊 Found ${response.data.items.length} existing events`);
    
    if (response.data.items.length > 0) {
      console.log('   📅 Recent events:');
      response.data.items.forEach((event, index) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`      ${index + 1}. ${event.summary || 'No title'} (${start})`);
      });
    } else {
      console.log('   📅 No existing events found (this is normal for a new calendar)');
    }
    
    return true;
  } catch (error) {
    console.log('   ❌ Calendar access failed:', error.message);
    console.log('   💡 Check that:');
    console.log('      - Calendar is shared with service account');
    console.log('      - Service account has "Make changes to events" permission');
    console.log('      - Calendar ID is correct in .env file');
    return false;
  }
}

// Test 4: Test creating an event
async function testCreateEvent() {
  console.log('\n4️⃣ Testing event creation...');
  
  // Create a test event 1 hour from now
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const testEvent = {
    summary: '🧪 TEST EVENT - Safe to delete',
    description: 'This is a test event created by the driving school booking system. Safe to delete.',
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'UTC',
    },
  };
  
  try {
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: testEvent,
    });
    
    console.log('   ✅ Test event created successfully!');
    console.log(`   🔗 Event ID: ${response.data.id}`);
    console.log(`   📅 Event time: ${startTime.toLocaleString()} - ${endTime.toLocaleString()}`);
    console.log('   ℹ️  You can delete this test event from Google Calendar');
    
    return response.data.id;
  } catch (error) {
    console.log('   ❌ Event creation failed:', error.message);
    return null;
  }
}

// Test 5: Test time slot availability checking
async function testTimeSlotCheck() {
  console.log('\n5️⃣ Testing time slot availability...');
  
  const now = new Date();
  const testStart = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
  const testEnd = new Date(testStart.getTime() + 30 * 60 * 1000); // 30 minutes duration
  
  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: testStart.toISOString(),
      timeMax: testEnd.toISOString(),
      maxResults: 1,
      singleEvents: true,
    });
    
    const isAvailable = response.data.items.length === 0;
    
    console.log(`   📅 Testing time slot: ${testStart.toLocaleString()} - ${testEnd.toLocaleString()}`);
    console.log(`   ${isAvailable ? '✅' : '⚠️'} Time slot ${isAvailable ? 'available' : 'occupied'}`);
    console.log(`   📊 Conflicting events found: ${response.data.items.length}`);
    
    return true;
  } catch (error) {
    console.log('   ❌ Time slot check failed:', error.message);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🎯 Google Calendar Integration Test Suite\n');
  console.log('='.repeat(50));
  
  let allTestsPassed = true;
  
  // Run all tests
  try {
    allTestsPassed = testCredentialsFile() && allTestsPassed;
    allTestsPassed = testEnvironmentVariables() && allTestsPassed;
    allTestsPassed = (await testCalendarAccess()) && allTestsPassed;
    allTestsPassed = ((await testCreateEvent()) !== null) && allTestsPassed;
    allTestsPassed = (await testTimeSlotCheck()) && allTestsPassed;
  } catch (error) {
    console.log('\n❌ Unexpected error during testing:', error.message);
    allTestsPassed = false;
  }
  
  // Final results
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST RESULTS SUMMARY:');
  console.log('='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Google Calendar integration is working correctly.');
    console.log('\n✅ Your driving school application is ready to use with Google Calendar!');
    console.log('\n🎯 Next steps:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Test the booking endpoints with curl or your frontend');
    console.log('   3. Check that booking events appear in Google Calendar');
  } else {
    console.log('❌ Some tests failed. Please check the errors above and fix them.');
    console.log('\n📚 Common solutions:');
    console.log('   1. Make sure credentials.json is in the server folder');
    console.log('   2. Add GOOGLE_CALENDAR_ID to your .env file');
    console.log('   3. Share your calendar with the service account email');
    console.log('   4. Give the service account "Make changes to events" permission');
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error('\n💥 Fatal error running tests:', error.message);
  process.exit(1);
});