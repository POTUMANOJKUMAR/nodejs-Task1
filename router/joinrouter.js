const express=require("express");
const router=express.Router();
const functi=require("../Controller/joinfunction")





router.post('/join', functi.joinUserEvent) ;









module.exports=router;

