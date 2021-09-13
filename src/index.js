const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

const userRouter = require("./routers/userRouter");
const courseRouter = require("./routers/courseRouter");
require("./db/mongoose");

app.use(cors());
app.use(express.json())
app.use(userRouter);
app.use(courseRouter);

app.listen(port, () => {
    console.log("Server connected", port);
})