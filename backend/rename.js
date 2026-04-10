import mongoose from "mongoose";
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

const fixDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/food-del");
        const items = await foodModel.find({ category: "Bihari" });
        for (const item of items) {
            if (item.image.includes("food_")) {
                let num = item.image.match(/\d+/)[0]; 
                item.name = `fooddel_${num}`;
                await item.save();
                console.log(`Renamed to ${item.name}`);
            }
        }
        process.exit();
    } catch(e) { console.error(e); process.exit(1); }
}
fixDatabase();
