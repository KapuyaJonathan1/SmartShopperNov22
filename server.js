const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch'); // Ensure fetch is available

const app = express();

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'build'))); // Serve static files

// Google OAuth2 Configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Image paths
const imagePath = path.join(__dirname, 'images', `image.png`);
const mediaPath = './images';

// Route: Save Image
app.post('/api/save-image', (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  const base64Data = image.replace(/^data:image\/png;base64,/, '');

  fs.writeFile(imagePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.status(500).json({ error: 'Failed to save image' });
    }

    res.status(200).json({ message: 'Image saved successfully', path: imagePath });
  });
});

// Route: Start OAuth 2.0 Flow
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/generative-language.tuning'],
  });
  res.redirect(authUrl);
});

// Route: Handle OAuth 2.0 Callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      fs.writeFileSync('.env', `REFRESH_TOKEN=${tokens.refresh_token}\n`);
      console.log('Refresh token saved to .env');
    } else {
      console.log("No refresh token received; ensure 'access_type: offline' is set.");
    }

    res.json({ message: 'Authentication successful', tokens });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Route: Generate Content
app.post('/api/get-info', async (req, res) => {
  const { prompt } = req.body;
  console.log(prompt);

  try {
    oAuth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    function fileToGenerativePart(path, mimeType) {
      return {
        inlineData: {
          data: Buffer.from(fs.readFileSync(path)).toString("base64"),
          mimeType,
        },
      };
    }

    const imagePart = fileToGenerativePart(`${mediaPath}/image.png`, "image/png");
    const result = await model.generateContent([prompt, imagePart]);

    if (result.response.text()) {
      res.json({ information: result.response.text() });
    } else {
      res.status(500).json({ error: 'Failed to generate content' });
    }

    // Optionally delete the image
    if (req.body.delete) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
        else console.log("Image deleted successfully:", imagePath);
      });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to fetch information from Gemini.' });
  }
});

// Serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
