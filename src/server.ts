import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { connection, setupSocket } from './config';
import initRoutes from './routes/index.routes';
import { logEvents } from './helper/logEvents';
import { countConnect } from './helper/check.connect';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

//  nén các phản hồi HTTP từ server trước khi gửi chúng về cho client.
app.use(compression());
countConnect();
// phân tích các cookie gửi từ client trong yêu cầu HTTP.
app.use(cookieParser());
// phân tích dữ liệu JSON từ body của các yêu cầu HTTP.
app.use(bodyParser.json());
// chi doc duoc json
app.use(express.json());
// Nếu client push lên ko phải là string, json mà là mảng ... thì nó có thể convert qua json rồi đọc
app.use(express.urlencoded({ extended: true }));
connection();
initRoutes(app);
const server = http.createServer(app);
setupSocket(server);

app.use(async (err: any, req: any, res: any) => {
  await logEvents(err.message);
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});
// create routes
const PORT = process.env.PORT || 7777;

const listener = server.listen(PORT, () => {
  const address = listener.address();
  if (typeof address === 'string') {
    console.log(`Server running at ${address}`);
  } else if (address && typeof address === 'object') {
    console.log(`Server running at port ${address.port}`);
  }
});

// POST, PUT ( Body )
// GET DELETE ( Query )
