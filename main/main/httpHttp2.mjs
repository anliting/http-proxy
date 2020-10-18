import http2 from   'http2'
import h1specificHeader from    './h1specificHeader.mjs'
function httpHttp2Proxy(req,res,authority,connectOption){
    let header={
        ':method':req.method,
        ':path':req.url,
    }
    for(let i in req.headers)if(!h1specificHeader.has(i))
        header[i]=req.headers[i]
    let client=http2.connect(authority,connectOption).on('error',e=>{
        res.writeHead(503,{})
        res.end()
        console.error(e)
    })
    let stream=client.request(header).on('error',e=>{
        res.writeHead(503,{})
        res.end()
        if(e.code=='ERR_HTTP2_STREAM_CANCEL')
            return
        console.error(e)
    }).on('response',header=>{
        let h={}
        for(let i in header)if(i[0]!=':')
            h[i]=header[i]
        res.writeHead(header[':status'],h)
        stream.pipe(res)
        client.close()
    })
}
export default httpHttp2Proxy
