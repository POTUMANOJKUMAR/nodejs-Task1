const express=require("express");
const router=express.Router();
const functi=require("../Controller/eventfunction.js")




router.post("/eventCreate",functi.eventCreate)
router.get('/getOngoing',functi.Ongoing)







module.exports=router;