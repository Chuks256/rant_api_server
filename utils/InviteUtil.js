let cryptoModule=require("crypto")

class rantInviteUtil{
    constructor(trials=0){
        this.inviteId=cryptoModule.randomBytes(3).toString("hex");
        this.inviteCode=cryptoModule.randomBytes(9).toString("hex");
        this.trials=trials;
        this.trialCount=0;
    }
}

module.exports=rantInviteUtil;