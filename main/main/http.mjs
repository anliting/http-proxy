import http from    'http'
import url from     'url'
function httpProxy(req,res,host,port,agent){
    return new Promise((rs,rj)=>{
        let headers={
            'x-forwarded-for':req.socket.remoteAddress,
        }
        for(let i in req.headers)if(i!='host')
            headers[i]=req.headers[i]
        let u
        try{
            u=new url.URL(req.url,'http://a')
        }catch(e){
            return res.end()
        }
        req.pipe(http.request({
            host,
            port,
            method:req.method,
            path:req.url,
            headers,
            agent,
        },internalRes=>{
            res.writeHead(internalRes.statusCode,internalRes.headers)
            internalRes.pipe(res)
        }).on('error',e=>{
            if(e.code='ECONNREFUSED'){
                res.writeHead(500)
                return res.end()
            }
            rj(e)
        })).on('end',()=>{
            rs()
        })
    })
}
export default httpProxy
