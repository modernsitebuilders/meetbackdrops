import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fixCategories() {
  console.log('\n📊 FIXING CATEGORY MISMATCHES\n');
  console.log('='.repeat(60));

  try {
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

    console.log('📥 Reading data...\n');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I'
    });

    const rows = response.data.values;
    const updates = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const filename = row[2];
      const category = row[3];
      
      if (!filename || !category) continue;

      let newCategory = category;
      let changed = false;

      // If filename is wall-shelves-bright-XX but category is bookshelves-bright
      if (filename.startsWith('wall-shelves-bright-') && category === 'bookshelves-bright') {
        newCategory = 'wall-shelves-bright';
        changed = true;
      }
      
      // If filename is wall-shelves-dark-XX but category is bookshelves-dark
      if (filename.startsWith('wall-shelves-dark-') && category === 'bookshelves-dark') {
        newCategory = 'wall-shelves-dark';
        changed = true;
      }

      if (changed) {
        updates.push({
          range: `Analytics!D${i + 1}`,
          values: [[newCategory]]
        });
        console.log(`✓ Row ${i + 1}: ${filename} | ${category} → ${newCategory}`);
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ No mismatches found!\n');
      return;
    }

    console.log(`\n📤 Updating ${updates.length} categories...\n`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log('='.repeat(60));
    console.log(`✅ FIXED ${updates.length} CATEGORY MISMATCHES!`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
  }
}

fixCategories();
