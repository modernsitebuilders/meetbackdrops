import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

async function migrateSheetFilenames() {
  console.log('\n📊 MIGRATING GOOGLE SHEETS FILENAMES\n');
  console.log('='.repeat(60));

  try {
    // Setup Google Sheets auth
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read all data
    console.log('📥 Reading existing data...\n');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I'
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    console.log(`Found ${rows.length} rows\n`);
    console.log('🔄 Processing updates...\n');

    let updateCount = 0;
    const updates = [];

    // Process each row (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const filename = row[2]; // Column C contains filename
      
      if (!filename) continue;

      let newFilename = filename;
      let changed = false;

      // Update well-lit files
      const wellLitMatch = filename.match(/^well-lit-(\d+)\.png$/);
      if (wellLitMatch) {
        const num = parseInt(wellLitMatch[1]);
        if (num >= 1 && num <= 18) {
          newFilename = `bookshelves-bright-${String(num).padStart(2, '0')}.png`;
          changed = true;
        } else if (num >= 19 && num <= 47) {
          newFilename = `wall-shelves-bright-${String(num).padStart(2, '0')}.png`;
          changed = true;
        }
      }

      // Update ambient files
      const ambientMatch = filename.match(/^ambient-(\d+)\.png$/);
      if (ambientMatch) {
        const num = parseInt(ambientMatch[1]);
        if (num >= 1 && num <= 24) {
          newFilename = `bookshelves-dark-${String(num).padStart(2, '0')}.png`;
          changed = true;
        } else if (num >= 25 && num <= 41) {
          newFilename = `wall-shelves-dark-${String(num).padStart(2, '0')}.png`;
          changed = true;
        }
      }

      if (changed) {
        updates.push({
          range: `Analytics!C${i + 1}`,
          values: [[newFilename]]
        });
        updateCount++;
        console.log(`✓ Row ${i + 1}: ${filename} → ${newFilename}`);
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ No updates needed - all filenames are current!\n');
      return;
    }

    // Batch update
    console.log(`\n📤 Updating ${updateCount} rows in Google Sheets...\n`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log('='.repeat(60));
    console.log(`✅ MIGRATION COMPLETE!`);
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`  • Updated ${updateCount} filenames`);
    console.log(`  • Most Popular will now show correct data\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  }
}

migrateSheetFilenames();