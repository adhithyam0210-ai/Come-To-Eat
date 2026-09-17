const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class UploadController {
  /**
   * Handle image upload from device
   * Supports base64 data URIs: data:image/png;base64,...
   */
  static async uploadImage(req, res) {
    try {
      const { image, filename } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, message: 'No image data provided.' });
      }

      // If it's already a regular HTTP/HTTPS URL, return as is
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return res.json({ success: true, url: image });
      }

      // Parse Data URI: data:image/jpeg;base64,.....
      const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      let ext = 'jpg';
      let buffer;

      if (matches && matches.length === 3) {
        ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace(/[^a-zA-Z0-9]/g, '');
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        // Raw base64 string
        buffer = Buffer.from(image, 'base64');
      }

      // Generate unique name
      const cleanOriginal = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) : 'upload';
      const uniqueName = `${Date.now()}_${cleanOriginal}_${uuidv4().slice(0, 8)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(filePath, buffer);

      // Determine public URL
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      const publicUrl = `${protocol}://${host}/uploads/${uniqueName}`;

      res.status(201).json({
        success: true,
        url: publicUrl,
        filename: uniqueName,
        size: buffer.length
      });
    } catch (err) {
      console.error('uploadImage error:', err);
      res.status(500).json({ success: false, message: 'Failed to save uploaded image: ' + err.message });
    }
  }
}

module.exports = { UploadController };
