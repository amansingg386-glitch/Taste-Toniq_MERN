import mongoose from "mongoose";

const deleteItems = async () => {
    try {
        await mongoose.connect("mongodb+srv://amansingg386_db_user:Aman%23rajput824036@cluster0.ihlayze.mongodb.net/food-del?appName=Cluster0");
        const collection = mongoose.connection.db.collection('foods');
        const count = await collection.countDocuments({ name: { $regex: 'Bihari Special', $options: 'i' } });
        console.log(`Found ${count} items to delete.`);
        
        await collection.deleteMany({ name: { $regex: 'Bihari Special', $options: 'i' } });
        
        console.log('Successfully deleted the 5 Bihari Specials!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deleteItems();
