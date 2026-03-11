import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import { UserApp } from "./APIs/UserAPI.js";
import cors from "cors";

config();

const app = exp();

// CORS options
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "https://user-management-app-gilt-seven.vercel.app" // No trailing slash!
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(exp.json());

app.use("/user-api", UserApp);

async function connectDB() {
  try {
    await connect(process.env.DB_URL);
    console.log("Connected to DB");

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server on port ${port}`));
  } catch (err) {
    console.log("err in DB connection :", err);
  }
}

connectDB();

// Error middleware
app.use((err, req, res, next) => {
  console.log("err is ", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format"
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate field value"
    });
  }

  res.status(500).json({
    message: "Internal Server Error"
  });
});