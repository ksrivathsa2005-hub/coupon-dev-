const express=require("express");
const dotenv=require("dotenv");
const cors=require("cors");
const schemaCreateRoute=require("./routes/schema.create.route");
dotenv.config();

const app=express();
const port=process.env.PORT || 3000;
//curl http://localhost:3000/api/schema/create-schema -X POST

app.use(cors());
app.use(express.json());
app.use("/api/schema",schemaCreateRoute);
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});
