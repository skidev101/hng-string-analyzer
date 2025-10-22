import express, { Express } from "express";
import stringsRouter from "./routes/strings.routes"
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

export const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use('/strings', stringsRouter);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    })
})