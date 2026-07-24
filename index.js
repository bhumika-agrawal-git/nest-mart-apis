import express from "express";
import dotenv from "dotenv";
import routes from "./app/routes/index.js";
import { connectDB } from "./app/configs/dbConfigs.js";

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

// app.use("/api/v1", routes);
routes(app);
app.get("/",(req,res)=>{
res.send("nest mart test apis")
})


const PORT = process.env.PORT || 5000;
const HOST=process.env.HOST || "localhost"

app.listen(PORT,HOST ,() => {
  console.log(`Server running on port http://${HOST}:${PORT}` );
});