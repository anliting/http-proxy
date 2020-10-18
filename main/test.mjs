import http2 from'http2'
import proxy from'./main.mjs'
let serverA=http2.createServer().on('stream',(s,h)=>{
    s.respond({':status':'200'})
    s.end('hello-world')
}).listen('server-a')
let pool=new proxy.http2.Pool('http://a',{path:'server-a'})
let serverB=http2.createServer().on('stream',async(s,h)=>{
    await pool.proxy(s,h)
}).listen('server-b')
;(async()=>{
    process.stdout.end(`${(await Promise.all([
        a(),
        a(),
    ])).every(a=>a)?1:0}\n`)
    serverA.close()
    serverB.close()
    pool.end()
})()
function a(){
    return new Promise((rs,rj)=>{
        let session=http2.connect('http://a',{path:'server-b'})
        let a=[]
        session.request({
            ':path':'/'
        }).on('data',[].push.bind(a)).on('end',()=>{
            session.close()
            rs(''+Buffer.concat(a)=='hello-world')
        })
    })
}
