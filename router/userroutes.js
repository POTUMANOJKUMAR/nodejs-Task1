const express = require("express");
const router = express.Router();
const functi = require("../Controller/userfunction.js");


router.post("/userLogin", functi.postVal);
router.get("/fetchsingle", functi.fetchingSingleEventsDetailes);
router.delete("/del", functi.deleteEvent);







module.exports = router;
