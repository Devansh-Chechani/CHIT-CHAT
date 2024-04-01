import express from "express";
import {fetchmessages,offlinepeople} from '../controllers/messages.js'

const router = express.Router();


// CREATE A USER
router.get("/messages/:userId",fetchmessages)
router.get("/people",offlinepeople)


export default router