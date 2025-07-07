import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import db from './config/Database.js';
import router from './routes/index.js';

dotenv.config();

const app = express();

try {
  await db.authenticate();
  console.log('Database Connected...');
} catch (error) {
  console.error(error);
}

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Kalau tidak ada origin (misalnya curl / server to server), tetap izinkan
      if (!origin) return callback(null, true);
      // Kalau kamu benar-benar mau semua domain, izinkan semua asal request
      return callback(null, true);
    }
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(router);

app.listen(process.env.PORT, () => console.log('Server running at port 5000'));
