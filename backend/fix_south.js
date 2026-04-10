import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true }
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

const fixSouth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/food-del");
        console.log("Connected to db");

        const uploadsDir = path.resolve("./uploads");
        const files = fs.readdirSync(uploadsDir);

        for (const file of files) {
            if (file.toLowerCase().includes("southindian")) {
                const category = "South-Indian";
                let name = file.replace(/\.[^/.]+$/, "").replace(/_/g, ' '); 
                
                const existing = await foodModel.findOne({ image: file });
                if (!existing) {
                    const newFood = new foodModel({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        description: `A delicious local ${category} specialty.`,
                        price: Math.floor(Math.random() * 15) + 15,
                        image: file,
                        category: category
                    });
                    await newFood.save();
                    console.log("Added:", name);
                } else {
                    console.log("Already exists but category is:", existing.category);
                    if (existing.category !== "South-Indian") {
                        existing.category = "South-Indian";
                        await existing.save();
                        console.log("Updated category to South-Indian for:", file);
                    }
                }
            }
        }
        process.exit();
    } catch(e) { console.error(e); process.exit(1); }
}
fixSouth();
