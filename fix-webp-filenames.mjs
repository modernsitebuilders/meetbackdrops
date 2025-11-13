import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fixWebpFilenames() {
  console.log('\n📊 FIXING WEBP FILENAMES\n');
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
      
      if (!filename) continue;

      let newFilename = filename;
      let newCategory = category;
      let changed = false;

      // Fix well-lit .webp files
      const wellLitWebpMatch = filename.match(/^well-lit-(\d+)\.webp$/);
      if (wellLitWebpMatch) {
        const num = wellLitWebpMatch[1];
        newFilename = `wall-shelves-bright-${String(num).padStart(2, '0')}.webp`;
        newCategory = 'wall-shelves-bright';
        changed = true;
      }

      // Fix ambient .webp files
      const ambientWebpMatch = filename.match(/^ambient-(\d+)\.webp$/);
      if (ambientWebpMatch) {
        const num = ambientWebpMatch[1];
        newFilename = `wall-shelves-dark-${String(num).padStart(2, '0')}.webp`;
        newCategory = 'wall-shelves-dark';
        changed = true;
      }

      if (changed) {
        updates.push({
          range: `Analytics!C${i + 1}:D${i + 1}`,
          values: [[newFilename, newCategory]]
        });
        console.log(`✓ Row ${i + 1}: ${filename} (${category}) → ${newFilename} (${newCategory})`);
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ No webp updates needed!\n');
      return;
    }

    console.log(`\n📤 Updating ${updates.length} rows...\n`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log('='.repeat(60));
    console.log(`✅ FIXED ${updates.length} WEBP ENTRIES!`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
  }
}

fixWebpFilenames();