import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true }
});

const migrateData = async () => {
    try {
        // Connect to local DB and fetch original exactly named foods
        console.log("Connecting to LOCAL db...");
        const localConnection = await mongoose.createConnection("mongodb://127.0.0.1:27017/food-del").asPromise();
        const LocalFoodModel = localConnection.model("food", foodSchema);
        
        const localFoods = await LocalFoodModel.find({
            category: { $in: ["Bihari", "Gujrati", "Punjabi", "South-Indian"] }
        });
        
        console.log(`Found ${localFoods.length} manually named custom foods in Local DB`);

        if (localFoods.length > 0) {
            // Disconnect from local and connect to Atlas
            await localConnection.close();
            
            console.log("Connecting to ATLAS db...");
            const atlasConnection = await mongoose.createConnection("mongodb+srv://amansingg386_db_user:Aman%23rajput824036@cluster0.ihlayze.mongodb.net/food-del?appName=Cluster0").asPromise();
            const AtlasFoodModel = atlasConnection.model("food", foodSchema);
            
            // Delete the messy ones I just added using seed.js
            console.log("Removing the bad seeded ones from Atlas...");
            await AtlasFoodModel.deleteMany({
                category: { $in: ["Bihari", "Gujrati", "Punjabi", "South-Indian"] }
            });
            
            // Insert exactly what they had in local
            console.log("Migrating pure local foods into Atlas...");
            const cleanFoods = localFoods.map(f => {
                const { _id, __v, ...rest } = f.toObject();
                return rest;
            });
            await AtlasFoodModel.insertMany(cleanFoods);
            
            console.log("Migration completely restored all custom names!");
            await atlasConnection.close();
            process.exit(0);
        } else {
            console.log("No custom foods found in local DB.");
            await localConnection.close();
            process.exit(1);
        }
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
migrateData();
