const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    courses: [
        {
            courseID: {
                type: String
            },
            coursename: {
                type: String
            },
            coursetime: {
                type: String,
            },
            courseday: {
                type: String
            },
            coursestartdate: {
                type: String
            },
            courseenddate: {
                type: String
            },
            coursereason: {
                type:String
            }
        }
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    name: {
        type: String,
    },
    adress: {
        type: String
    },
    phonenumber: {
        type: String
    }
})


userSchema.pre("save", async function (next) {
    const user = this;
    console.log("IM IN PRE")
    if (user.isModified("password")) {
        console.log("encrypt")
        user.password = await bcrypt.hash(user.password, 8);
    };
    next();
})


userSchema.methods.generateAuthToken = async function () {
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

const User = mongoose.model("User", userSchema);

module.exports = User;