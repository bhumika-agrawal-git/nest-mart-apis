import express from "express";
import dotenv from "dotenv";
import routes from "./app/routes/index.js";
import { connectDB } from "./app/configs/dbConfigs.js";
import cors from "cors"
dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://192.168.51.23:5173"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

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