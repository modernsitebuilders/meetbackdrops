export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const { page, category, referrer } = req.body;
    
    // Just log to console for now - no Google Sheets
    console.log("Page view:", { 
      page, 
      category, 
      referrer, 
      timestamp: new Date().toISOString() 
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    res.status(500).json({ error: "Failed to track page view" });
  }
}
