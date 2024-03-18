
let ws=require("ws");


class socketServer{
    constructor(){
        this.sessionStorage=[]
    }

    sanitizeData(type="",data={}){
        if(type=="outgoing_data"){
            JSON.stringify(data)
        }
        if(type=="incoming_data"){
            JSON.parse(data)
        }
    }


    startServer(port=0){
        this.ws_server=new ws.Server({port:port});
        this.ws_server.on("connection",async(session)=>{
            this.sessionStorage.push(session)
        })
        console.log("Also Socket server actively running waiting [+]")
    }

    broadCastNewRant(broadcast_data=""){
        if(this.sessionStorage.length != 0){
            this.sessionStorage.forEach(node=>{
                node.send(this.sanitizeData("outgoing_data",{msg:broadcast_data}))
            })
        }
    }

    

    

}

module.exports=socketServer;