import {config} from './src/config/config.js'
import app from "./src/app.js";
import { connectToDB } from './src/config/db.js';


const port = config.PORT;


connectToDB();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
