
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
app.get('/api/verifyCode',route_function.verifyInvitationCodeFunction);
app.get('/api/getAllRants',route_function.getAllRantFunction);
app.get('/api/getAllComment',route_function.getAllRantCommentFunction);
app.get('/api/getSpecificUserRant',route_function.getAllSpecificUserRantsFunction);
app.get('/api/getMyAccountSuuporters',route_function.getAccountSupporters);
app.get('/api/getSupportingAccount',route_function.getSupportingAccount);
app.get('/api/getUserProfile',route_function.getUserProfileFunction);
app.get('/api/getUserById',route_function.getUserByIdFunction);
app.get('/api/getAllUser',route_function.getAllUsersFunction);

app.post('/api/signup',route_function.signupFunction);
app.post('/api/reactToRant',route_function.reactToRantFunction);
app.post('/api/postContent',route_function.postContentFunction);
app.post('/api/commentOnRant',route_function.commentOnRantFunction);
app.post('/api/supportRanterAccount',route_function.supportRanterAccountFunction);

app.listen(process.env.PORT||6000, async()=>{
console.log("api server currently running [+]")
})