import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";
import connectDB from "./db.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: function (origin, callback) {
    // Dynamic origin matching to perfectly pass preflight for any domain
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Serve generated videos statically
app.use('/outputs', express.static(path.join(__dirname, 'public/outputs')));

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use.`);
    console.error("Please close any other terminals running this backend.");
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
