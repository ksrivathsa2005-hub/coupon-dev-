const createSchemaController =require("../controllers/schema.create.controller");

const router=require("express").Router();
router.post("/create-schema",createSchemaController);

module.exports=router;