import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken'

import authRoutes from './routes/auth.js';

const app = express();
dotenv.config();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Allow sending cookies and authorization headers
}));

app.use(express.json())
app.use(cookieParser())
 
app.use('/api/auth',authRoutes)

 const Connection = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database Connected Successfully")
    }
    catch(err){
        console.log("Error in connecting to database")
    }
   
 }

      

const server = app.listen(4000,()=>{
    Connection()
    console.log("app is listening on port 4000")
})

const wss = new  WebSocketServer({server})

const connections = new Set();
wss.on('connection',(req,connection)=>{
  // console.log(connection)

//    req.on('message', (message) => {
//     console.log('Received message:', message);
//     ws.send('Server received message: ' + message); // Echo back the received message
//   });

   const cookies = connection.headers.cookie
    if(cookies){
       const tokenCookieString =  cookies.split(';').find((str)=> str.startsWith('token='))
       if(tokenCookieString){
          const  token = tokenCookieString.split('=')[1]
          if(token){
            jwt.verify( token,process.env.SECRET_KEY,{},(err,userData)=>{
                if(err)throw err
                
                  const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;
             //  console.log(connection.username)
           })
         }
       }
   }

     req.on('message', (message) => {
   // console.log('Received message:', message); // Log the received message
    try {
      const messageData = JSON.parse(message.toString());
      console.log('Parsed message:', messageData);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });


    connections.add(connection);
   // console.log(connections)
    updateOnlineUsers(); 

   
})




function updateOnlineUsers() {
    const onlineUsers = [...connections].map((c) => ({
        userId: c.userId,
        username: c.username
    }));

   // console.log(onlineUsers)

    [...wss.clients].forEach((connection) => {
        // Check if the connection is open before sending data
    //   console.log( connection.readyState)
        if (connection.readyState === connection.OPEN) { // readyState 1 means the connection is open
            connection.send(JSON.stringify({
                online: onlineUsers

            }));
        }
    });
}