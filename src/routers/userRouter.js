const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const router = new express.Router();
const User = require("../models/usersSchema");
const Professor = require("../models/professorSchema");
const Course = require("../models/courseSchema");

router.post("/signup", async (req, res) => {
    try {

        const newUser = await new User({ ...req.body });
        if (!newUser) {
            return res.status(404).send("Failed to create a new user");
        }
        await newUser.save();
        res.send("Created new user")
    } catch (err) {
        res.status(404).send(err.message);
    }
})
router.post("/signup-professor", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;
        const newUser = await new Professor({ email, password, name });
        if (!newUser) {
            return res.status(404).send("Failed to create a new user");
        }
        await newUser.save();
        res.send("Created new professor")
    } catch (err) {
        res.status(404).send(err.message);
    }
})

router.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        let newUser;
        if (req.body.isProfessor) {

            newUser = await Professor.findOne({ email });
        } else {

            newUser = await User.findOne({ email });
        }

        if (!newUser) {
            return res.send("Failed to log in")
        }
        const isPassMatch = await bcrypt.compare(password, newUser.password);

        if (!isPassMatch) {
            return res.send("Failed to log in")
        }
        const token = await newUser.generateAuthToken();
        if (!token) {
            return res.send("Failed to log in")
        }

        res.send({ token })

    } catch (err) {
        res.send("Failed to log in")
    }
})


router.post("/userdata", async (req, res) => {
    try {
        let newUser;
        let userData;
        if (req.body.isProfessor) {
            newUser = await Professor.findOne({ email: req.body.email })
        } else {
            newUser = await User.findOne({ email: req.body.email });
        }
        if (!newUser) {
            return res.send("Failed to get user profile")
        }
        console.log(newUser)
        if (req.body.isProfessor) {
            userData = { email: newUser.email, name: newUser.name }
        } else {
            userData = { name: newUser.name, email: newUser.email, phonenumber: newUser.phonenumber, adress: newUser.adress, courses: newUser.courses }
        }

        res.send({ userData })

    } catch (err) {
        res.send("Failed to get userdata")
    }
})

router.post("/updateuser", async (req, res) => {
    try {
        let currentUser;
        if (req.body.isProfessor) {
            currentUser = await Professor.findOne({ email: req.body.email })
        } else {
            currentUser = await User.findOne({ email: req.body.email })
        }
        currentUser.password = req.body.password

        await currentUser.save();
        res.send("Updated");
    } catch (err) {
        res.send("Failed to update user")
    }
})

router.post("/attend-course", async (req, res) => {
    try {
        const courseID = req.body.id;
        const currentStudent = req.body.studentEmail;
        const courseTime = req.body.time

        const student = await User.findOne({ email: currentStudent });
        if (!student) {
            res.send("Failed to find student");
        };


        let hasCourseInList = false;
        if (student) {
            for (let i = 0; i < student.courses.length; i++) {
                if (student.courses[i].courseID === courseID) {
                    hasCourseInList = true;
                }
            }
        }
        if (hasCourseInList) {
            console.log("Im here")
            return res.send("Already in list");
        } else {

            const currentCourse = await Course.findOne({ _id: courseID });


            student.courses = student.courses.concat({ courseID, coursename: currentCourse.name, coursetime: courseTime, courseday: currentCourse.day, coursestartdate: currentCourse.startdate, courseenddate: currentCourse.enddate, coursereason: "" });
            await student.save();



            currentCourse.participants = currentCourse.participants.concat({ participant: { name: student.name, time:courseTime, id: student._id } })
            await currentCourse.save();

            res.send("Success")
        }

    } catch (err) {

    }
})


router.post("/student-leave-course", async (req, res) => {
    try {
        const findUser = await User.findOne({ email: req.body.studentEmail });
        findUser.courses = findUser.courses.filter((course) => course.courseID !== req.body.courseID);
        await findUser.save();

        const findCourse = await Course.findOne({ _id: req.body.courseID });
        let userID = findUser._id;
        findCourse.participants = findCourse.participants.filter((participant) => participant.participant.id !== findUser._id.toString());
        await findCourse.save();
        res.send("Success")
    } catch (err) {
        console.log(err)
    }
})

router.post("/student-attendance", async(req, res) => {
    try{
        console.log(req.body, "blallaala")
        const findUser = await User.findOne({email: req.body.studentEmail});
        if(!findUser){
           res.send("Failed to find user");
        }
        console.log(findUser.courses)
        for(let i = 0; i < findUser.courses.length; i++){
            // console.log(findUser.courses[i]._id.toString(), req.body.courseID)
            if(findUser.courses[i].courseID.toString() === req.body.courseID){
                findUser.courses[i].coursereason = req.body.reason;
            }
        }

        await findUser.save();
        res.send("Success")
    }catch(err){
        console.log(err);
    }
})



router.get("/get-all-students", async (req, res) => {
    try {
        const students = await User.find({});
        if (!students) {
            return res.send("Failed to get students")
        };
        res.send({ students });
    } catch (err) {
        res.status("Failed to get all students")
    }
})


router.post("/verify-token-professor", async (req, res) => {
    try {
        console.log(req.body)
        console.log("going to verify")
        const verifyToken = jwt.verify(req.body.token, process.env.TOKEN_SECRET);
        if (!verifyToken) {
            return res.send("Failed to verify")
        }
        const currentUser = await Professor.findOne({ email: req.body.email });

        if (!currentUser) {
            return res.send("Failed to verify")
        }

        res.send({ currentUser })
    } catch (err) {
        res.send("Failed to verify")
    }
})


router.post("/verify-token-student", async (req, res) => {
    try {
        console.log(req.body)
        console.log("going to verify")
        const verifyToken = jwt.verify(req.body.token, process.env.TOKEN_SECRET);
        if (!verifyToken) {
            return res.send("Failed to verify")
        }
        const currentUser = await User.findOne({ email: req.body.email });

        if (!currentUser) {
            return res.send("Failed to verify")
        }

        res.send({ currentUser })
    } catch (err) {
        res.send("Failed to verify")
    }
})


module.exports = router;