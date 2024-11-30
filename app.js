const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketHandler = require("./sockets/socketHandler");
const { db } = require("./config/db"); // Database connection
require("dotenv").config();

// Import routes
const userRouter = require("./routes/user.routes");
const jobRouter = require("./routes/job.routes");
const chatRoute = require("./routes/chat.routes");

const app = express();

// Create an HTTP server
const server = http.createServer(app);
const io = socketHandler(server);

const PORT = process.env.PORT || 4000; // Default to 4000 if PORT is not defined

app.use(cors()); // Enable cross-origin resource sharing
app.use(bodyParser.json()); // Parse incoming JSON requests

// Root route for basic server status
app.get("/", (req, res) => {
	res.send("WebSocket server is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal Server Error" });
});

// Routes for API endpoints
app.use("/", userRouter);
app.use("/", jobRouter);
app.use("/", chatRoute);

// Connect to the database and start the server
const startServer = () => {
	try {
		db(); // Initialize database connection
		server.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
};

startServer();
