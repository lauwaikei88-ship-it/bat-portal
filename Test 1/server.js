require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const AGNES_API_KEY = process.env.AGNES_API_KEY;
const API_BASE_URL = 'https://apihub.agnes-ai.com/v1';

// Headers for Agnes API
const getHeaders = () => ({
  'Authorization': `Bearer ${AGNES_API_KEY}`,
  'Content-Type': 'application/json'
});

// Image Generation Endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const response = await axios.post(`${API_BASE_URL}/images/generations`, {
      model: 'agnes-image-2.1-flash',
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    }, { headers: getHeaders() });

    res.json(response.data);
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate image', details: error.response?.data });
  }
});

// Video Generation Endpoint (Accepts Image Upload)
app.post('/api/generate-video', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    let payload = {
      model: 'agnes-video-v2.0',
      prompt: prompt
    };

    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      payload.image_url = imageUrl;
    }

    const response = await axios.post(`${API_BASE_URL}/videos`, payload, { headers: getHeaders() });

    res.json(response.data); // Should return a task_id
  } catch (error) {
    console.error('Error generating video:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate video generation', details: error.response?.data });
  }
});

// Helper: deeply search an object for any key containing 'url' or 'video'
function findVideoUrl(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return null;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.startsWith('http') && /\.(mp4|mov|webm|m3u8)/i.test(val)) {
      return val;
    }
    if (typeof val === 'string' && val.startsWith('http') && (key.toLowerCase().includes('url') || key.toLowerCase().includes('video'))) {
      return val;
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        const found = findVideoUrl(item, depth + 1);
        if (found) return found;
      }
    } else if (typeof val === 'object') {
      const found = findVideoUrl(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// Video Generation Status Polling Endpoint
app.get('/api/video-status/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const response = await axios.get(`${API_BASE_URL}/videos/${task_id}`, { headers: getHeaders() });
    const data = response.data;

    const detectedUrl = findVideoUrl(data);
    if (detectedUrl) {
      data._detected_video_url = detectedUrl;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check video status', details: error.response?.data });
  }
});

// Convert MP4 to GIF Endpoint
app.post('/api/convert-to-gif', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });

    const timestamp = Date.now();
    const tempMp4Path = path.join(__dirname, 'temp', `${timestamp}.mp4`);
    const outputGifFilename = `${timestamp}.gif`;
    const outputGifPath = path.join(__dirname, 'public', 'gifs', outputGifFilename);

    // Download the video
    const response = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(tempMp4Path);
    response.data.pipe(writer);

    writer.on('finish', () => {
      // Convert to GIF using FFmpeg
      ffmpeg(tempMp4Path)
        .outputOptions([
          '-vf', 'fps=10,scale=512:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
          '-loop', '0'
        ])
        .toFormat('gif')
        .on('end', () => {
          // Cleanup temp mp4
          fs.unlinkSync(tempMp4Path);
          res.json({ gifUrl: `/gifs/${outputGifFilename}` });
        })
        .on('error', (err) => {
          console.error('Error converting to GIF:', err);
          fs.unlinkSync(tempMp4Path);
          res.status(500).json({ error: 'Error during GIF conversion' });
        })
        .save(outputGifPath);
    });

    writer.on('error', (err) => {
      console.error('Error downloading video:', err);
      res.status(500).json({ error: 'Error downloading video for conversion' });
    });

  } catch (error) {
    console.error('Conversion Error:', error);
    res.status(500).json({ error: 'Failed to process GIF conversion' });
  }
});

// --- Database & Portal APIs ---
const DB_FILE = path.join(__dirname, 'database.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) return { posts: [] };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { posts: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/calendar', (req, res) => {
  res.json(readDB().posts);
});

app.post('/api/post/add', (req, res) => {
  const { prompt, date } = req.body;
  if (!prompt || !date) return res.status(400).json({ error: 'Prompt and date required' });
  const db = readDB();
  db.posts.push({
    id: Date.now(),
    date: date,
    prompt: prompt.trim(),
    status: 'pending_approval'
  });
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/post/edit', (req, res) => {
  const { id, prompt, date } = req.body;
  const db = readDB();
  const post = db.posts.find(p => p.id === id);
  if (post) {
    if (prompt) post.prompt = prompt.trim();
    if (date) post.date = date;
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/post/approve', (req, res) => {
  const { id } = req.body;
  const db = readDB();
  const post = db.posts.find(p => p.id === id);
  if (post) {
    post.status = 'approved';
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/post/delete', (req, res) => {
  const { id } = req.body;
  const db = readDB();
  db.posts = db.posts.filter(p => p.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Chat API for Agnes
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await axios.post(`https://apihub.agnes-ai.com/v1/chat/completions`, {
      model: 'agnes-2.0-flash',
      messages: messages
    }, { 
      headers: {
        'Authorization': `Bearer ${process.env.AGNES_API_KEY}`,
        'Content-Type': 'application/json'
      } 
    });
    res.json(response.data);
  } catch (error) {
    console.error('Chat Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Chat failed' });
  }
});

const { exec } = require('child_process');
app.post('/api/queue/run', (req, res) => {
  exec('py daily_ig_poster.py', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).json({ error: 'Script failed', details: stderr });
    }
    res.json({ success: true, output: stdout });
  });
});
// -----------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
