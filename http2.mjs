import http2 from   'http2'
function proxy(s,h,authority,connectOption){
    let header={
        ':method':h[':method'],
        ':path':h[':path'],
    }
    for(let i in h)if(i[0]!=':')
        header[i]=h[i]
    let responded
    let client=http2.connect(authority,connectOption).on('error',e=>{
        if(!s.closed&&!responded){
            responded=1
            s.respond({':status':503})
            s.end()
        }
        if(['ECONNREFUSED'].includes(e.code))
            return
        console.error(e)
    })
    let stream=client.request(header).on('error',e=>{
        if(!s.closed&&!responded){
            responded=1
            s.respond({':status':503})
            s.end()
        }
        if(e.code=='ERR_HTTP2_STREAM_CANCEL')
            return
        console.error(e)
    }).on('response',header=>{
        if(!s.closed&&!responded){
            responded=1
            let h={
                ':status':header[':status'],
            }
            for(let i in header)if(i[0]!=':')
                h[i]=header[i]
            s.respond(h)
            stream.pipe(s)
        }
        client.close()
    })
}
function Pool(authority,connectOption){
    this._authority=authority
    this._connectOption=connectOption
}
Pool.prototype.end=function(){
    return new Promise(rs=>{
        if(!this._client||this._client.closed)
            return rs()
        this._client.close(rs)
    })
}
Pool.prototype.proxy=function(s,h,connectOption){
    let header={
        ':method':h[':method'],
        ':path':h[':path'],
    }
    for(let i in h)if(i[0]!=':')
        header[i]=h[i]
    let responded
    if(!this._client||this._client.closed)
        this._client=http2.connect(this._authority,connectOption)
    let errorListener=e=>{
        if(!s.closed&&!responded){
            responded=1
            s.respond({':status':503})
            s.end()
        }
        if(['ECONNREFUSED'].includes(e.code))
            return
        console.error(e)
    }
    this._client.on('error',errorListener)
    let stream=this._client.request(header).on('error',e=>{
        if(!s.closed&&!responded){
            responded=1
            s.respond({':status':503})
            s.end()
        }
        if(e.code=='ERR_HTTP2_STREAM_CANCEL')
            return
        console.error(e)
    }).on('response',header=>{
        if(!s.closed&&!responded){
            responded=1
            let h={
                ':status':header[':status'],
            }
            for(let i in header)if(i[0]!=':')
                h[i]=header[i]
            s.respond(h)
            stream.pipe(s)
        }
    }).on('end',()=>{
        this._client.off('error',errorListener)
    })
}
proxy.Pool=Pool
export default proxy
