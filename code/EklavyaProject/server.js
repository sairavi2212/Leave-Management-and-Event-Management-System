import mongoose from "mongoose";

const url = "mongodb+srv://Users:craak@cluster0.qdosc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const connectDb = async () => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB!'))
        .catch(err => console.log('Error connecting to MongoDB:', err));
}
export default connectDb();
