const couponModel=require("../models/coupon.model");

const createSchemaController=async(req,res)=>{
    try{
        await couponModel();
        res.status(201).json({message:"Schema created successfully"});
    } catch (error) {
        console.error("Error creating schema", error);
        res.status(500).json({message:"Internal server error"});
    }
}
module.exports=createSchemaController;