// lib/reviews.js
import { google } from 'googleapis';

export async function getReviewsData() {
  try {
    // Same Google auth you're already using
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Fetch all reviews from your sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reviews!A2:F', // Skip header row
    });

    const rows = response.data.values || [];
    
    // Parse reviews
    const reviews = rows.map(row => ({
      date: row[0],
      rating: parseInt(row[1]),
      name: row[2],
      comment: row[3],
      email: row[4],
      status: row[5]
    })).filter(review => review.rating); // Only include rows with ratings

    // Calculate aggregate rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    // Get reviews with actual comments (not "No comment provided")
    const reviewsWithComments = reviews
      .filter(review => review.comment && review.comment !== 'No comment provided')
      .slice(0, 5); // Get up to 5 most recent reviews with comments

    return {
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating),
      reviewsWithComments
    };

  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Return fallback data if fetch fails
    return {
      totalReviews: 0,
      averageRating: 0,
      reviewsWithComments: []
    };
  }
}