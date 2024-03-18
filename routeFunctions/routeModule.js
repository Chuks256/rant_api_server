// rant server will be using websocket for real time posting and updating
//  rant should be a permission network , not everyone can access it 
require("dotenv")
let jwt=require("jsonwebtoken")
let dbModule=require("../config/dbconfig")
let inviteUtil=require("../utils/InviteUtil")
let socketFunctionModule=require("../socketFunctions/socketServer")
let cryptoModule=require("crypto")
let fs=require('fs')

class routeModuleFunctions{
constructor(){
    this.inviteGlobalStorage=[];
    this.sanitizeLogs();
}

sanitizeLogs(){
    let getLogs=fs.readFileSync("./rant_code_log.log",{encoding:"utf-8"});
    if(getLogs==""){
        fs.writeFileSync("./rant_code_log.log",JSON.stringify([]),{encoding:'utf-8'});
    }
}

signupFunction(req,res){
    let encryptedPass=cryptoModule.createHash("shake256").update(req.body.pass).digest().toString("hex")
    let accountExistQuery=`select * from user where mail="${req.body.mail}" and password="${encryptedPass}"`;
    let generateAccountId=cryptoModule.randomBytes(4).toString("hex");
    let createAccountQuery=`insert into user value(${generateAccountId},'${req.body.username}','${req.body.mail}','','${req.body.bio}','${encryptedPass}') `

    dbModule.query(accountExistQuery,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result.length>0){
            res.json({msg:"account already exist"})
        }
        else{
            dbModule.query(createAccountQuery,(err,finalresult)=>{
                if(err){
                    throw new Error(err)
                }
                if(finalresult){
                    let tokenPayload={userid:generateAccountId}
                    let createToken=jwt.sign(tokenPayload,process.env.TOKENSECRETKEY);
                    res.json({authorization:createToken});
                }
            })
        }
    })
}

signinFunction(req,res){
    let encryptedPass=cryptoModule.createHash("shake256").update(req.body.pass).digest().toString("hex")
    let accountExistQuery=`select * from user where mail="${req.body.mail}" and password="${encryptedPass}"`;
    let generateAccountId=cryptoModule.randomBytes(4).toString("hex");
    dbModule.query(accountExistQuery,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result.length>0){
            let tokenPayload={userid:generateAccountId}
            let createToken=jwt.sign(tokenPayload,process.env.TOKENSECRETKEY);
            res.json({authorization:createToken});
        }
        if(result.length==0){
            res.json({msg:'account does not exist'})
        }
    })
}

createInvitationCodeFunction(req,res){
let inviteObj=new inviteUtil(req.body.trial);
let getLogs=fs.readFileSync("./rant_code_log.log",{encoding:"utf-8"});
let sanitizedLog=JSON.parse(getLogs)
let saveLog=sanitizedLog.push(inviteObj)
if(saveLog){
fs.writeFileSync("./rant_code_log.log",JSON.stringify(sanitizedLog,"",3),{encoding:"utf-8"})
res.json({invitationCode:inviteObj.inviteCode})
}
}

verifyInvitationCodeFunction(req,res,next){
    let getLogs=fs.readFileSync("./rant_code_log.log",{encoding:"utf-8"});
    let sanitizedLog=JSON.parse(getLogs)
    for(const inviteObject of sanitizedLog){
        if(req.body.invitationCode==inviteObject.inviteCode){
            res.json({msg:"inviteCode_correct"})
            next()
        }
        else{
            res.json({msg:"inviteCode_incorrect"})            
        }
    }
}

//  function to post content 
postContentFunction(req,res){
    let getUserId=jwt.verify(req.body.authorization,process.env.TOKENSECRETKEY);
    let postid=cryptoModule.randomBytes(4).toString('hex')
    let query=`insert into post values('${postid}','${getUserId.userid}','${req.body.content}','','${0}','${new Date().getMinutes()}')`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            new socketFunctionModule().broadCastNewRant("new_rant_posted");
        }
    })
}


getAllRantFunction(req,res){
    let query=`select * from post`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json(result.reverse())
        }
    })
}


uploadRantMediaFunction(){

}

uploadProfilePicsFunction(){

}

reactToRantFunction(req,res){
    let query=`select * from post where postid='${req.params.postid}'`;
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            let newReaction=result[0].reaction
            newReaction+=1;
            let updateQuery=`update post set reaction='${newReaction}'`;
            dbModule.query(updateQuery,(err,result)=>{
                if(err){
                    throw new Error(err)
                }
                if(result){
                    res.json({msg:"successful"})
                }
            })
        }
    })
}

commentOnRantFunction(req,res){
    let getUserId=jwt.verify(req.body.authorization,process.env.TOKENSECRETKEY);
    let generateCommentId=cryptoModule.randomBytes(4).toString('hex') 
    let query=`insert into comment value('${generateCommentId}','${req.params.postid}','${getUserId.userid}','${req.body.content}','${new Date().getMinutes()}')`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json({msg:'successful'})
        }
    })
}

getAllRantCommentFunction(req,res){
let query=`select * from comment where postid='${req.params.postid}' `
dbModule.query(query,(err,result)=>{
    if(err){
        throw new Error(err)
    }
    if(result){
        res.json(result)
    }
})
}

getAllSpecificUserRantsFunction(req,res){
    let getUserId=jwt.verify(req.body.authorization,process.env.TOKENSECRETKEY);
    let query=`select * from post where userid='${getUserId.userid}'`;
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json(result)
        }
    })
}

supportRanterAccountFunction(req,res){
    let getUserId=jwt.verify(req.body.authorization,process.env.TOKENSECRETKEY);
    let query=`insert into supporters values('${getUserId.userid}','${req.body.accountid}') `;
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json({msg:'successful'})
        }
    })
}

getAccountSupporters(req,res){
    let query=`select * from supporters where accountid='${getUserId.userid}'`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json(result.length)
        }
    })
}

getSupportingAccount(req,res){
    let query=`select * from supporters where supporterid='${getUserId.userid}'`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json(result.length)
        }
    })
}


getUserProfileFunction(req,res){
    let getUserId=jwt.verify(req.body.authorization,process.env.TOKENSECRETKEY);
    let query=`select * from user where id='${getUserId.userid}'`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            result[0].mail=null
            result[0].password=null
            res.json(result)
        }
    })
}

getUserByIdFunction(req,res){
    let query=`select * from user where id='${req.body.userid}'`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json(result)
        }
    })
}

getAllUsersFunction(req,res){
    let query=`select * from user '`
    dbModule.query(query,(err,result)=>{
        if(err){
            throw new Error(err)
        }
        if(result){
            res.json(result)
        }
    })
}

}


module.exports=routeModuleFunctions;

