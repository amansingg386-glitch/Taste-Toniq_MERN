import express from 'express';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import adminAuth from '../middleware/adminAuth.js';

const foodRouter = express.Router();

foodRouter.post("/add", adminAuth, addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", adminAuth, removeFood);
foodRouter.post("/update", adminAuth, updateFood);

export default foodRouter;
