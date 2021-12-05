import fs from'fs'
import{minify}from'terser'
import{rollup}from'rollup'
let
    skip=[
        'http',
        'http2',
        'url',
    ]
async function link(input,file){
    let bundle=await rollup({
        input,
        external:s=>skip.includes(s),
    })
    return(await bundle.generate({
        file,
        format:'es',
        paths:s=>skip.includes(s)&&s,
    })).output[0].code
}
;(async()=>{
    fs.promises.writeFile('package.json',JSON.stringify({
        main:'main.mjs',
        name:'@anliting/http-proxy',
        version:'0.0.0',
    }))
    fs.promises.writeFile(
        'export/main.mjs',
        (await minify(await link(`main/main.mjs`))).code
    )
})()
