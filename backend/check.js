import mongoose from "mongoose";

const check = async () => {
    try {
        await mongoose.connect("mongodb+srv://amansingg386_db_user:Aman%23rajput824036@cluster0.ihlayze.mongodb.net/food-del?appName=Cluster0");
        const collection = mongoose.connection.db.collection('foods');
        const counts = await collection.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]).toArray();
        console.log("Current Database Items:");
        console.log(counts);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
