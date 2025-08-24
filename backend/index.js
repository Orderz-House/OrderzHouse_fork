const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000
require("./models/db");
app.use(cors());
app.use(express.json());
// app.use(cors({
//   origin: ["https://mywebsite.com"], 
//   methods: ["GET", "POST"],
//   credentials: true
// }));
 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 
  message: "try again later",
});

app.use(limiter);
// app.use("*", (req, res) => res.status(404).json("NO content at this path"));
const usersRouter = require("./router/user");

app.use("/users", usersRouter);
//app.use("*", (req, res) => res.status(404).json("NO content at this path"));
  
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`); 
}); 