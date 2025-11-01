const Pool=require("pg").Pool;
require("dotenv").config();
const pool=new Pool({
    user:"postgres",
    password:process.env.DB_PASSWORD,
    host:"localhost",
    port:5432,
    database:"mess-coupon"
})

pool.connect()
.then(()=>{
    console.log("database connected successfully")
})
.catch((err)=>{
    console.error("database connection error:",err);
})

module.exports=pool;