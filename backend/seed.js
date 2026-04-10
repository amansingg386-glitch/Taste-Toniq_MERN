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

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/food-del");
        console.log("Connected to MongoDB for Seeding");

        const uploadsDir = path.resolve("./uploads");
        const files = fs.readdirSync(uploadsDir);

        for (const file of files) {
            let category = null;
            let name = file.replace(/\.[^/.]+$/, "").replace(/_/g, ' '); 

            if (file.toLowerCase().includes("bihari")) category = "Bihari";
            else if (file.toLowerCase().includes("gujrati") || file.toLowerCase().includes("gujarati")) category = "Gujrati";
            else if (file.toLowerCase().includes("punjabi")) category = "Punjabi";
            else if (file.toLowerCase().includes("southindian")) category = "South-Indian";
            else if (["food_33", "food_34", "food_35", "food_36", "food_37", "food_38"].some(f => file.includes(f))) {
                category = "Chinese";
                name = "Chinese Delight " + name.split(' ')[1];
            }
            
            if (category) {
                const existing = await foodModel.findOne({ image: file });
                if (!existing) {
                    const newFood = new foodModel({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        description: `A delicious local ${category} specialty made with traditional spices and fresh ingredients.`,
                        price: Math.floor(Math.random() * 15) + 15,
                        image: file,
                        category: category
                    });
                    await newFood.save();
                    console.log(`Seeded: ${file} -> Category: ${category}`);
                }
            }
        }

        console.log("All target images processed and mapped correctly!");
        process.exit();
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
}

seedDatabase();
