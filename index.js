const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  'https://ugalfvlbxwvrcsewtmjh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYWxmdmxieHd2cmNzZXd0bWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODU0MDUsImV4cCI6MjA2MTg2MTQwNX0.aZ8OyCmPMvfYFjMiVBikKCCxzb-9Mp1p-ZOi18swKN0'
);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// GET endpoint
app.get('/messages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chatter')
      .select('id, content, username, created_at, image_url')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST endpoint
app.post('/messages', async (req, res) => {
  try {
    const { content, username, image_url } = req.body;
    
    if ((!content && !image_url) || !username) {
      return res.status(400).json({ error: "Content or image, and username required" });
    }

    const { data, error } = await supabase
      .from('chatter')
      .insert([{ content, username, image_url }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Image upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `images/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat-images') // Make sure this bucket exists in your Supabase storage
      .upload(filePath, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    res.json({ 
      imageUrl: urlData.publicUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// DELETE endpoint
app.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('chatter')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
