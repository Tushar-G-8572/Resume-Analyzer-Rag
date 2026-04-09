import dotenv from 'dotenv'

dotenv.config();


export const config = {
    PORT:process.env.PORT,
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY,
    PINECONE_API_KEY:process.env.PINECONE_API_KEY,
    PINECONE_INDEX:process.env.PINECONE_INDEX,
    MISTRAL_API_KEY:process.env.MISTRAL_API_KEY


}