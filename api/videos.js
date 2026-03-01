export default async function handler(req, res) {
  const query = req.query.q || "nature";
  const orientation = req.query.orientation || "portrait";
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return res.status(400).json({ error: "PEXELS_API_KEY is not configured in the environment." });
  }

  try {
    const response = await fetch(`https://api.pexels.com/videos/search?query=${query}&orientation=${orientation}&size=medium&per_page=80`, {
      headers: {
        Authorization: apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pexels API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos from Pexels." });
  }
}
