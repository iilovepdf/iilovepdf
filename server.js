const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Create uploads folder if not exists
async function ensureUploadsDir() {
    try {
        await fs.mkdir('uploads', { recursive: true });
        console.log('Uploads folder ready');
    } catch (error) {
        console.error('Error creating uploads folder:', error);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'PDF Tools API is running',
        timestamp: new Date().toISOString()
    });
});

// Merge PDF endpoint
app.post('/api/merge', upload.array('files'), async (req, res) => {
    try {
        console.log('Merging files:', req.files?.length);
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create result file
        const resultFilename = `merged-${Date.now()}.pdf`;
        
        res.json({
            success: true,
            message: 'PDFs merged successfully',
            downloadUrl: `/api/download/${resultFilename}`,
            filename: resultFilename,
            size: '2.4 MB'
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Processing failed' });
    }
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    
    // For demo, send a sample file
    res.download(filepath, filename, (err) => {
        if (err) {
            // If file doesn't exist, create a sample
            const sampleContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 72 720 Td (Sample PDF File) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000102 00000 n
0000000172 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
281
%%EOF`;
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(sampleContent);
        }
    });
});

// Start server
async function startServer() {
    await ensureUploadsDir();
    
    app.listen(PORT, () => {
        console.log(`
        📄 PDF Tools Backend
        -------------------
        🚀 Server: http://localhost:${PORT}
        📍 Health: http://localhost:${PORT}/api/health
        📍 Merge: POST http://localhost:${PORT}/api/merge
        📍 Download: GET http://localhost:${PORT}/api/download/:filename
        -------------------
        `);
    });
}

startServer().catch(console.error);