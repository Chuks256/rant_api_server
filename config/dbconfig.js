require("dotenv").config();
let sqlModule=require("mysql");

let dbConfigParams={
    host:process.env.HOST,
    password:process.env.PASSWORD,
    user:process.env.USER,
    database:process.env.DATABASE
}

let dbPoolConnection=sqlModule.createPool(dbConfigParams)

dbPoolConnection.getConnection((err,success)=>{
    if(err){
        throw new Error(err)
    }
    if(success){
        console.log("successfully connected to database")
    }
})

module.exports=dbPoolConnection;