import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// --- API Endpoints ---

// IP Information
app.get('/api/ip/:ip', (req, res) => {
  const { ip } = req.params;
  // In a real app, query a geolocation API (e.g., ipapi.co)
  // For demonstration of the frontend "OFFLINE" states, this endpoint
  // returns actual mock data if you run the backend, but if the backend
  // is not running, the frontend will show SERVICE OFFLINE/NOT CONFIGURED.
  res.json({
    ip,
    country: 'United States',
    countryCode: 'US',
    region: 'California',
    city: 'Mountain View',
    isp: 'Google LLC',
    asn: 'AS15169',
    organization: 'Google Cloud',
    timezone: 'America/Los_Angeles',
    latitude: 37.4056,
    longitude: -122.0775,
    riskScore: 5,
    reputationScore: 98,
    isVPN: false,
    isProxy: false,
    isTor: false,
  });
});

// URL Safety
app.post('/api/url-safety', (req, res) => {
  const { url } = req.body;
  res.json({
    url,
    safe: true,
    score: 95,
    threats: [],
  });
});

// Phishing Detection
app.post('/api/phishing', (req, res) => {
  const { url } = req.body;
  res.json({
    url,
    probability: 0.1,
    isPhishing: false,
  });
});

// Malware Scanner
app.post('/api/malware', (req, res) => {
  const { hash } = req.body;
  res.json({
    hash,
    clean: true,
    detections: [],
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
