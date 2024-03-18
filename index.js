
require("dotenv").config()
let express=require("express");
let app=express();
let body_parser=require("body-parser");
let socketServerFunction=require("./socketFunctions/socketServer")
let routeModule=require("./routeFunctions/routeModule")

app.disable("x-powered-by")
app.use(express.json())
app.use(body_parser.urlencoded({extended:true}))
app.use(body_parser.json())

//  define functions 
let socketFunction=new socketServerFunction();
socketFunction.startServer(4456);
let route_function=new routeModule();

// define routes functions 
app.get('/api/signin',route_function.signinFunction);
app.post('/api/signup',route_function.signupFunction);
app.get('/api/verifyCode',route_function.verifyInvitationCodeFunction);
app.post('/api/reactToPost',route_function.reactToRantFunction);
app.post('/api/postContent',route_function.postContentFunction);
app.get('/api/etAllRants',route_function.getAllRantFunction);
app.get('/api/verifyCode',route_function.verifyInvitationCodeFunction);
app.get('/api/verifyCode',route_function.verifyInvitationCodeFunction);
app.get('/api/verifyCode',route_function.verifyInvitationCodeFunction);


app.listen(process.env.PORT||6000, async()=>{
console.log("api server currently running [+]")
})