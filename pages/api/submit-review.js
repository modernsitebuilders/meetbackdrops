import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { rating, comment, name, email, date } = req.body;

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

    // NEW: Check if user has any page views
    const visitorId = req.cookies?.sb_visitor_id;
    
    if (visitorId) {
      const analytics = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Analytics!A2:O'
      });

      const userActivity = (analytics.data.values || []).filter(row => {
        const rowVisitorId = row[10]; // Column K (Visitor ID)
        const eventType = row[1]; // Column B (Event Type)
        return rowVisitorId === visitorId && eventType === 'page_view';
      });

      // Reject if 0 page views
      if (userActivity.length === 0) {
        return res.status(403).json({ 
          error: 'Reviews must be from actual site visitors. Please browse the site before submitting feedback.' 
        });
      }
    } else {
      // No visitor ID = suspicious, reject
      return res.status(403).json({ 
        error: 'Unable to verify site usage. Please enable cookies and browse the site before submitting a review.' 
      });
    }

    // Check for duplicate reviews in last 7 days
    const recentReviews = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviews!A2:F'
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const existingReview = (recentReviews.data.values || []).find(row => {
      const reviewDate = new Date(row[0]);
      const reviewEmail = row[4];
      const reviewName = row[2];
      
      if (reviewDate < sevenDaysAgo) return false;
      
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
          'pending'
        ]]
      }
    });

    // If email was provided, save to Email List sheet
    if (email && email !== 'Not provided') {
      try {
        const existingEmails = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Email List!A:A'
        });

        const emails = existingEmails.data.values || [];
        const emailExists = emails.some(row => row[0] === email);

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
        console.log('Email List sheet not found, skipping email tracking');
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ error: 'Failed to save review' });
  }
}