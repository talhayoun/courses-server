const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    times: [
        {
            time:{
                type: String,
            }
        }
    ],
    day: {
        type: String
    },
    startdate: {
        type: String
    },
    enddate: {
        type: String
    },
    participants: [
        {
            participant: {
                name: {
                    type: String
                },
                time:{
                    type:String
                },
                id: {
                    type: String
                }
            }
        }
    ]
})

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;