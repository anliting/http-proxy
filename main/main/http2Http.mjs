import http from                'http'
import h1specificHeader from    './h1specificHeader.mjs'
function http2HttpProxy(s,h,host,port,agent,option={}){
    let header={
        'x-forwarded-for':s.session.socket.remoteAddress,
    }
    for(let i in h)if(i[0]!=':')
        header[i]=h[i]
    s.pipe(http.request({
        host,
        port,
        method:h[':method'],
        path:h[':path'],
        headers:header,
        agent,
    },res=>{
        if(s.destroyed)
            return
        let h={
            ':status':res.statusCode,
        }
        for(let i in res.headers)if(!h1specificHeader.has(i))
            h[i]=res.headers[i]
        if(option.reverse&&h.location){
            let u=new URL(h.location,'http://a')
            h.location=u.pathname
        }
        s.respond(h)
        res.pipe(s)
    }).on('error',e=>{
        if(![
            'ECONNREFUSED',
            'ETIMEDOUT',
        ].includes(e.code)){
            console.error(e)
        }
        if(s.destroyed)
            return
        s.respond({':status':500})
        s.end()
    }))
}
export default http2HttpProxy
