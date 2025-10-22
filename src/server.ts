import "dotenv/config";
import { connectDB } from "./db/mongoose";
import { app } from "./app";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI as string;

async function startApp() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
}

startApp().catch((error) => {
  console.error("failed to start server", error);
  process.exit(1);
});
