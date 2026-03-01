export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await fetch(url, {
      redirect: 'follow',
      headers
    });
    
    if (!response.ok && response.status !== 206) {
      return res.status(response.status).send(`Proxy error: ${response.statusText}`);
    }

    res.status(response.status);

    // Forward headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    // Pipe the response
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(value);
      }
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error");
  }
}
