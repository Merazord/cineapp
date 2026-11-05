import {writeFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
const directory=new URL('../mobile/assets/',import.meta.url);
function crc32(buffer){let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function chunk(type,data){const tag=Buffer.from(type);const length=Buffer.alloc(4);length.writeUInt32BE(data.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));return Buffer.concat([length,tag,data,crc]);}
function icon(size,{transparent=false,monochrome=false,backgroundOnly=false}={}){
 const pixels=Buffer.alloc((size*4+1)*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const nx=x/size,ny=y/size;const distance=Math.hypot(nx-.5,ny-.5);
  const mark=!backgroundOnly&&((distance>.18&&distance<.32&&!(nx>.53&&Math.abs(ny-.5)<.15))||(nx>.72&&nx<.8&&ny>.42&&ny<.58));
  const color=mark?(monochrome?[255,255,255,255]:[215,250,112,255]):(transparent?[0,0,0,0]:[16,18,22,255]);
  const offset=y*(size*4+1)+1+x*4;for(let c=0;c<4;c++)pixels[offset+c]=color[c];
 }
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
for(const [file,size,options] of [['icon.png',512,{}],['favicon.png',192,{}],['splash-icon.png',512,{}],['android-icon-foreground.png',512,{transparent:true}],['android-icon-background.png',512,{backgroundOnly:true}],['android-icon-monochrome.png',512,{transparent:true,monochrome:true}]])writeFileSync(new URL(file,directory),icon(size,options));
writeFileSync(new URL('icon.svg',directory),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#101216"/><path d="M73 29a25 25 0 1 0 0 42" fill="none" stroke="#d7fa70" stroke-width="14"/><path d="M76 42v16" stroke="#d7fa70" stroke-width="8"/></svg>\n');
