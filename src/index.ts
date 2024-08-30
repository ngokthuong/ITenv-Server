import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { connection } from './config';
dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
//  nén các phản hồi HTTP từ server trước khi gửi chúng về cho client.
app.use(compression());
// phân tích các cookie gửi từ client trong yêu cầu HTTP.
app.use(cookieParser());
// phân tích dữ liệu JSON từ body của các yêu cầu HTTP.
app.use(bodyParser.json())
// chi doc duoc json 
app.use(express.json())
// Nếu client push lên ko phải là string, json mà là mảng ... thì nó có thể convert qua json rồi đọc
app.use(express.urlencoded({ extended: true }))

const server = http.createServer(app);

// // create routes
const PORT = process.env.PORT || 7777

const listener = server.listen(PORT, () => {
    const address = listener.address();
    if (typeof address === 'string') {
        console.log(`Server running at ${address}`);
    } else if (address && typeof address === 'object') {
        console.log(`Server running at port ${address.port}`);
    }
});

