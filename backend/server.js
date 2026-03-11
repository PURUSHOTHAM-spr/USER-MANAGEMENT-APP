import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import { UserApp } from "./APIs/UserAPI.js";
import cors from "cors";

config();

const app = exp();

// CORRECTED CORS CONFIGURATION
const corsOptions = {
  origin: function (origin, callback) {
    // Allows localhost and any Vercel deployment URL
    if (!origin || origin.includes("localhost") || origin.endsWith("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS before any routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(exp.json());

// Routes
app.use("/user-api", UserApp);

// Database Connection
async function connectDB() {
  try {
    await connect(process.env.DB_URL);
    console.log("Connected to DB");

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server on port ${port}`));
  } catch (err) {
    console.log("Error in DB connection:", err);
  }
}

connectDB();

// Global Error Middleware
app.use((err, req, res, next) => {
  console.log("Error logic caught:", err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed", errors: err.errors });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate field value" });
  }

  res.status(500).json({ message: "Internal Server Error", error: err.message });
});