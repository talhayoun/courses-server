const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const professorSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})


professorSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    };
    next();
})


professorSchema.methods.generateAuthToken = async function () {
    const user = this;
    console.log("beforetoken")
    console.log(process.env.TOKEN_SECRET)
    const token = jwt.sign(
        {
            _id: user._id
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: "1h"
        }
    )
    console.log(token, "token")
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

const Professor = mongoose.model("Professor", professorSchema);

module.exports = Professor;
