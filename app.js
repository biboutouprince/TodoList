import express from "express";
import dotenv from "dotenv";
import ejs from "ejs";
import cors from "cors";
import UserRoute from "./Routes/UserRoute.js";
import TacheRoute from "./Routes/TacheRoute.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
const port = 3003;

app.engine("html", ejs.__express);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/", UserRoute);
app.use("/tasks", TacheRoute);

app.listen(port, () => {
  console.log(`Le Serveur tourne sur le port ${port}`);
});
