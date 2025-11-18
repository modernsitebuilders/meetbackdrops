import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { rating, comment, name, email, date } = req.body;

  // Prevent duplicate submissions
  try {
    // Set up Google auth
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
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Check for duplicate reviews in last 7 days
    const recentReviews = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviews!A2:F'
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Check if this person already reviewed recently
    const existingReview = (recentReviews.data.values || []).find(row => {
      const reviewDate = new Date(row[0]);
      const reviewEmail = row[4];
      const reviewName = row[2];
      
      // Check if review is within last 7 days
      if (reviewDate < sevenDaysAgo) return false;
      
      // Match by email (if provided) or by name
      if (email && email !== 'Not provided' && reviewEmail === email) return true;
      if (name && name !== 'Anonymous' && reviewName === name) return true;
      
      return false;
    });

    if (existingReview) {
      return res.status(429).json({ 
        error: 'You have already submitted a review recently. Thank you for your feedback!' 
      });
    }

    // Save review to Reviews sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Reviews!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date(date).toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          rating,
          name,
          comment,
          email,
          'pending' // All new reviews start as pending
        ]]
      }
    });

    // If email was provided, save to Email List sheet (for easy export)
    if (email && email !== 'Not provided') {
      try {
        // Check if email already exists
        const existingEmails = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Email List!A:A'
        });

        const emails = existingEmails.data.values || [];
        const emailExists = emails.some(row => row[0] === email);

        // Only add if email doesn't exist
        if (!emailExists) {
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Email List!A:C',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[
                email,
                name || 'Anonymous',
                new Date(date).toLocaleString('en-US', { 
                  timeZone: 'America/New_York',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              ]]
            }
          });
        }
      } catch (emailError) {
        // If Email List sheet doesn't exist, log but don't fail the review
        console.log('Email List sheet not found, skipping email tracking');
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ error: 'Failed to save review' });
  }
}