const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/analyze-crops', async (req, res) => {
  const { coordinates, area, unit } = req.body;

  if (!coordinates || coordinates.length === 0) {
    return res.status(400).json({ message: 'Coordinates are required' });
  }

  const { lat, lng } = coordinates[0];
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'gsk_your_actual_key_here') {
    return res.status(400).json({ message: 'Groq API Key not configured' });
  }

  try {
    const prompt = `You are an elite agronomist specialized in Indian agriculture. 
    Analyze a specific plot of land in Gujarat, India.
    Location: Latitude ${lat}, Longitude ${lng}
    Total Area: ${area} ${unit}

    Task:
    Suggest 4 distinct and highly suitable crops for this EXACT micro-location. 
    Consider the local soil profile (based on coordinates), typical rainfall in this specific district, and seasonal temperature variations.
    
    Provide a diverse mix (e.g., one cash crop, one grain, one legume, etc. if applicable).
    
    For each crop, provide:
    1. name: Common name of the crop.
    2. suitability: A realistic percentage (0-100) based on local data for these coordinates.
    3. reason: A 1-sentence HIGHLY SPECIFIC reason (mentioning local climate, soil, or water availability at these coordinates).
    
    Return ONLY a JSON array of objects.
    Format: [{"name": "Crop", "suitability": 85, "reason": "Specific local reason..."}]`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    const parsedData = JSON.parse(content);
    
    // Sometimes AI wraps it in an object like { "crops": [...] }
    const crops = Array.isArray(parsedData) ? parsedData : (parsedData.crops || Object.values(parsedData)[0]);

    res.json(crops);
  } catch (error) {
    console.error('Groq AI Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'AI Analysis failed', error: error.message });
  }
});

module.exports = router;
