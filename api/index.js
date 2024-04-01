import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { Message} from './models/Message.js'
import messageRoutes from './routes/messages.js';
import authRoutes from './routes/auth.js';

const app = express();
dotenv.config();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Allow sending cookies and authorization headers
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

const Connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected Successfully");
  } catch (err) {
    console.log("Error in connecting to database");
  }
}

const server = app.listen(4000, () => {
  Connection();
  console.log("app is listening on port 4000");
});

const wss = new WebSocketServer({ server });

const connections = new Set();

wss.on('connection', (connection, req) => {

  connection.isAlive = true

  connection.timer = setInterval(()=>{
      connection.ping()
  },5000)

  connection.on('pong',()=>{
    // console.log('pong')
  })



  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find((str) => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, process.env.SECRET_KEY, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
          console.log(connection.username);
        });
      }
    }
  }

  connections.add(connection);

  connection.on('message', async (message) => {
    try {
      const messageData = JSON.parse(message.toString());
      const { recipient, text } = messageData;
      console.log(recipient);
      if (recipient && text) {

         const messageDoc = await Message.create({
          sender:connection.userId,
          recipient,
          text
         })

        console.log(connection.userId);
        [...connections].filter(c => c.userId === recipient)
          .forEach(c => c.send(JSON.stringify({ 
            text,
            sender:connection.userId ,
            recipient,
            _id:messageDoc._id
          
          })));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
 
  updateOnlineUsers();
});

function updateOnlineUsers() {
  const onlineUsers = [...connections].map((c) => ({
    userId: c.userId,
    username: c.username
  }));

  [...connections].forEach((connection) => {
    if (connection.readyState === connection.OPEN) {
      connection.send(JSON.stringify({ online: onlineUsers }));
    }
  });
}


wss.on('close',data=>{
   console.log('disconnected' ,data)
})