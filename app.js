import express from "express";
import dotenv from "dotenv";
import ejs from "ejs";
import cors from "cors";
import UserRoute from "./Routes/UserRoute.js";
import TacheRoute from "./Routes/TacheRoute.js";

const app = express();
dotenv.config();
const port = 3003;

app.engine("html", ejs.__express);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000", // autorise uniquement ton frontend
    credentials: true, // si tu utilises les cookies ou des headers d'authentification
  })
);

app.use("/", UserRoute);
app.use("/task", TacheRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
