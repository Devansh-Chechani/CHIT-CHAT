import {Message} from '../models/Message.js'
import {User} from '../models/User.js'
import jwt from 'jsonwebtoken'




export const fetchmessages = async (req, res, next) => {
    const {userId} = req.params
    let user;
     const token = req.cookies?.token;
   //  console.log(token)
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, {}, async(err, userData) => {
      if (err) throw err;
       const ourId = userData.userId

  const messages = await Message.find({
     sender:{$in:[userId,ourId]},
     recipient:{$in:[userId,ourId]}
   }).sort({createdAt:1})
 
    res.json(messages)
    });
}


};


export const offlinepeople = async()=>{
  await User.find({},{'_id':1,username:1})
}
