import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";

import testRouter from "./routes/testRoutes";

const PORT = process.env.PORT || 9030;

// Create an instance of the Express application
const app = express();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "./public")));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Set up Cross-Origin Resource Sharing (CORS) options
// app.use(cors())
app.use(cors({ origin: "*" }));

app.use("/api/test", testRouter);

const server = http.createServer(app);
// End Socket

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;
