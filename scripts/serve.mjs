import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(project,'site');
const arg=process.argv.indexOf('--port');
const port=Number(arg>=0?process.argv[arg+1]:process.env.PORT||3000);
const config=JSON.parse(await readFile(path.join(project,'vercel.json'),'utf8'));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{
 try {
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end('Method not allowed');}
  const redirect=config.redirects.find(item=>item.source===pathname);
  if(redirect){res.writeHead(308,{'Location':redirect.destination});return res.end();}
  if(pathname.length>1&&pathname.endsWith('/')){res.writeHead(308,{'Location':pathname.slice(0,-1)});return res.end();}
  if(pathname.endsWith('/index.html')){res.writeHead(308,{'Location':pathname.replace(/index\.html$/,'').replace(/\/$/,'')||'/'});return res.end();}
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
  let code=200;
  try {const info=await stat(file);if(info.isDirectory())file=path.join(file,'index.html');await stat(file);}catch{file=path.join(root,'404.html');code=404;}
  for(const header of config.headers[0].headers)if(!['Strict-Transport-Security'].includes(header.key))res.setHeader(header.key,header.key==='Content-Security-Policy'?header.value.replace('; upgrade-insecure-requests',''):header.value);
  if(pathname==='/partners'||pathname.startsWith('/partners/'))res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');
  const data=await readFile(file);res.writeHead(code);res.end(req.method==='HEAD'?undefined:data);
 } catch {res.writeHead(400);res.end('Bad request');}
}).listen(port,'0.0.0.0',()=>console.log(`Local: http://localhost:${port}`));
