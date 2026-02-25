import express from "express";
import "dotenv/config"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.send("Drive Clone Running");
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})