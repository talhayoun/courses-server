const express = require("express");
const router = new express.Router();
const Course = require("../models/courseSchema");


router.post("/new-course", async (req, res) => {
    try {
        console.log(req.body)
        const courseName = req.body.courseName;
        const courseDay = req.body.courseDay;
        const time = req.body.courseTime;
        const courseStartDate = req.body.courseStartDate;
        const courseEndDate = req.body.courseEndDate;
        const newCourse = await new Course({ name: courseName, day: courseDay, startdate: courseStartDate, enddate: courseEndDate })
        console.log(newCourse)
        if (!newCourse) {
            throw new Error("Failed to create new course")
        }
        await newCourse.save()
        for(let i = 0; i<time.length; i++){
            newCourse.times = newCourse.times.concat({time: time[i]});
        }
        // newCourse.times = [...time];
        await newCourse.save()
        console.log(newCourse.times, "times")
        res.send({ newCourse });
    } catch (err) {
        res.send("Failed to create new course")
    }
})


router.get("/get-courses", async (req, res) => {
    try {
        const courses = await Course.find({});
        res.send({ courses })

    } catch (err) {
        res.send("Failed to get courses")
    }
})


router.post("/delete-course", async (req, res) => {
    try {
        console.log(req.body)
        const deleteCourse = await Course.findByIdAndDelete({ _id: req.body.id })
        console.log(deleteCourse)
        res.send({ deleteCourse })
    } catch (err) {
        res.send("Failed to delete course");
    }
})
module.exports = router;