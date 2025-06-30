import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import ejs from "ejs";
import cron from "node-cron";
import cors from "cors";
import UserRoute from "./Routes/UserRoute.js";
import TacheRoute from "./Routes/TacheRoute.js";
import { sendTaskNotifications } from "./services/notificationService.js";

const app = express();
dotenv.config();
const port = 3003;

app.engine("html", ejs.__express);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use("/", UserRoute);
app.use("/tasks", TacheRoute);

// Planifier la tâche pour s'exécuter tous les jours à 9h00 du matin.
// Le format cron est : 'minute heure jour-du-mois mois jour-de-la-semaine'
// '* * * * *' s'exécute toutes les minutes, ce qui est utile pour les tests.
// '0 9 * * *' s'exécute tous les jours à 9h00.
cron.schedule(
  "0 16 * * *",
  () => {
    console.log(
      "Exécution de la tâche cron de notification des tâches en cours..."
    );
    sendTaskNotifications();
  },
  {
    scheduled: true,
    timezone: "Africa/Libreville",
  }
);

app.listen(port, () => {
  console.log(`Le Serveur tourne sur le port ${port}`);
});
