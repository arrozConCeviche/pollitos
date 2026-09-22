const canvas = document.getElementById("galaxy") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
let W = window.innerWidth, H = window.innerHeight;
canvas.width = W; canvas.height = H;
let angleX = 0, angleY = 0, time = 0;
let dragging = false, lastDrag: {x:number;y:number} = {x:0,y:0};

const loveMsgs=["Te amo 🤍","Eres mi todo ✨","Mi corazón es tuyo 💖",
    "Contigo y en cualquier lugar ✨","Eres mi estrella ⭐",
    "Mi universo eres tú 💕","Amor infinito ♾️","Por siempre ✨",
    "Mi luna y estrellas🌙","Te adoro 🌻","Mi amor eterno ♥️",
    "Eres magia 💫","Mi sueño realidad 🌠","Siempre tú 💞"];

const fEmojis=['🌻','🌼','✿','❀','🏵️'];
const fColors=['#FFD700','#FFA500','#FFEC4B','#FFE4B5','#FFF8DC','#F0E68C'];

interface Star{ x:number;y:number;z:number;sz:number;b:number;p:number;hue:number; }
interface ArmP{ a:number;sp:number;r:number;h:number;pk:number;sz:number; }
interface Neb{ cx:number;cy:number;rn:number;h:number;a:number;pk:number; }
interface Flo{ a:number;sp:number;r:number;h:number;t:string;c:string;sc:number;pk:number;emId:number; }

const stars:Star[] = [];
for(let i=0;i<700;i++){
  let th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
  let rd=Math.pow(Math.random(),0.3)*900+80;
  stars.push({x:rd*Math.sin(ph)*Math.cos(th),y:rd*Math.sin(ph)*Math.sin(th),z:rd*Math.cos(ph)-450,
    sz:Math.random()*2.5+.3,b:Math.random()*.7+.3,p:Math.random()*Math.PI*2,hue:260+Math.random()*60});
}

const armP:ArmP[] = [];
for(let i=0;i<400;i++){
  let ai=Math.floor(Math.random()*5), ag=(ai/5)*Math.PI*2;
  let d=Math.pow(Math.random(),0.3)*750+80;
  armP.push({a:ag+(d-80)/200,sp:.00015+Math.random()*.0007/(d/750),r:d,h:Math.random()<0.6?270:290,pk:Math.random()*Math.PI*2,sz:Math.random()*1.8+.4});
}

const nebs:Neb[]=[];
for(let i=0;i<6;i++){
  nebs.push({cx:Math.random()*W-W/2,cy:Math.random()*H-H/2,rn:Math.random()*180+90,h:260+Math.random()*50,a:Math.random()*.07+.02,pk:Math.random()*Math.PI*2});
}

const flowers:Flo[]=[];
loveMsgs.forEach((t,i)=>{
  flowers.push({a:Math.random()*Math.PI*2,sp:.0008+Math.random()*.002,r:200+Math.random()*400,h:Math.random()<0.5?270:330,t:t,c:fColors[i%fColors.length],sc:.55+Math.random()*.8,pk:Math.random()*Math.PI*2,emId:Math.floor(Math.random()*fEmojis.length)});
});

function rot(px:number,py:number,pz:number):{sx:number;sy:number;sz:number}{
  let rx=px*Math.cos(angleY)-pz*Math.sin(angleY);
  let rz=px*Math.sin(angleY)+pz*Math.cos(angleY);
  let ry=py*Math.cos(angleX)-rz*Math.sin(angleX);
  rz=ry*Math.sin(angleX)+rz*Math.cos(angleX);
  let p2=800/(800+rz);
  return{sx:rx*p2+W/2,sy:ry*p2+H/2,sz:rz};
}

function drawBG(){
  time += .016;
  let g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"hsl("+(275+Math.sin(time*.1)*5)+",40%,"+(8+Math.sin(time*.3)*3)+"%)"); // deep purple top
  g.addColorStop(.5,"#1a0033"); // mid dark purple
  g.addColorStop(1,"hsl("+(285+Math.sin(time*.15)*5)+",60%,8%)"); // bottom dark
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}

function drawStars(){
  stars.forEach(s=>{
    let p=rot(s.x,s.y,s.z);
    if(p.sz<-700||p.sz>300)return;
    let tw=Math.sin(time*2+s.p)*.35+.65;
    let al=s.b*tw/(1+p.sz*.001);
    let size=s.sz/(1+p.sz*.001);
    if(size<=0||al<=0)return;
    ctx.fillStyle="rgba(255,245,255,"+al+")";
    ctx.beginPath();ctx.arc(p.sx,p.sy,size*.8,0,Math.PI*2);ctx.fill();
    if(size>1){
      let g=ctx.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,size*3);
      g.addColorStop(0,"hsla("+(s.hue)+",70%,85%,"+al*.4+")");g.addColorStop(1,"transparent");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.sx,p.sy,size*3,0,Math.PI*2);ctx.fill();
    }
  });
}

function drawArms(){
  let cx=W/2,cy=H/2,cp=Math.sin(time*.4)*15+80;
  for(let li=3;li>=0;li--){
    let rd=cp*(li+1)+Math.sin(time*.7-li)*8;
    let h2=Math.round(260+Math.sin(time*.3-li*.5)*25);
    let g=ctx.createRadialGradient(cx,cy,0,cx,cy,rd+li*20);
    g.addColorStop(0,"hsla("+(h2)+",70%,60%,"+(.15-li*.03)+")");g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,rd+li*20,0,Math.PI*2);ctx.fill();
  }
  armP.forEach(p=>{p.a+=p.sp;
    let x=cx+Math.cos(p.a+time*.1)*p.r;
    let y=cy+Math.sin(p.a+time*.15)*p.r*.35;
    let tw=Math.sin(time*3+p.pk)*.4+.6,tsz=p.sz*tw/200;
    ctx.globalAlpha=tsz;ctx.fillStyle="hsl("+(Math.round(p.h))+",80%,65%,"+tw*.7+")";
    ctx.beginPath();ctx.arc(x,y,p.sz,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    let g=ctx.createRadialGradient(x,y,0,x,y,p.sz*4);
    g.addColorStop(0,"hsla("+(Math.round(p.h))+",80%,65%,"+tw*.1+")");g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,p.sz*4,0,Math.PI*2);ctx.fill();
  });
}

function drawNebulae(){
  nebs.forEach(n=>{
    let p3=Math.sin(time*.5+n.pk)*30;
    let x=n.cx+Math.sin(time*.2+n.pk)*.05;
    let g=ctx.createRadialGradient(x,n.cy,0,x,n.cy,n.rn+p3);
    g.addColorStop(0,"hsla("+(Math.round(n.h))+",80%,60%,"+n.a*2+")");g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,n.cy,n.rn+p3,0,Math.PI*2);ctx.fill();
  });
}

function drawHeart(){
  let cx=W/2,cy=H/2-40,ps=Math.sin(time*.1)*5+55;
  for(let i=3;i>=0;i--){
    let rd=(ps*(i+1)+Math.sin(time*.7-i)*8);
    let h2=Math.round(290+Math.sin(time*.3-i*.5)*25);
    let g=ctx.createRadialGradient(cx,cy,0,cx,cy,rd+i*20);
    g.addColorStop(0,"hsla("+(h2)+",70%,60%,"+(.15-i*.03)+")");g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,rd+i*20,0,Math.PI*2);ctx.fill();
  }
  let hd=ctx.createRadialGradient(cx-ps*.15,cy-ps*.35,0,cx,cy,ps*1.5);
  hd.addColorStop(0,"#FF8ECB");hd.addColorStop(.4,"#FF4B8E");hd.addColorStop(1,"#CC2266");
  ctx.fillStyle=hd;ctx.shadowColor="rgba(255,105,180,.8)";ctx.shadowBlur=30+Math.sin(time*.2)*10;
  let sc = ps/90;ctx.beginPath();
  ctx.moveTo(cx,cy+ps*.4*sc);
  ctx.bezierCurveTo(cx-ps*.4*sc,cy-ps*.4*sc,cx-ps*.6*sc,cy-ps*.07*sc,cx-ps*.3*sc,cy+ps*.2*sc);
  ctx.bezierCurveTo(cx-ps*.15*sc,cy+ps*.45*sc,cx,cy+ps*.54*sc,cx,cy+ps*.54*sc);
  ctx.bezierCurveTo(cx,cy+ps*.54*sc,cx+ps*.15*sc,cy+ps*.45*sc,cx+ps*.3*sc,cy+ps*.2*sc);
  ctx.bezierCurveTo(cx+ps*.6*sc,cy-ps*.07*sc,cx+ps*.4*sc,cy-ps*.4*sc,cx,cy+ps*.4*sc);
  ctx.fill();ctx.shadowBlur=0;
  let sg=ctx.createRadialGradient(cx-ps*.12,cy-ps*.28,0,cx-ps*.1*sc,cy-ps*.25*sc,ps*.35);
  sg.addColorStop(0,"rgba(255,255,255,.35)");sg.addColorStop(1,"transparent");ctx.fillStyle=sg;
  ctx.beginPath();ctx.arc(cx-ps*.12,cy-ps*.28,ps*.35,0,Math.PI*2);ctx.fill();
}

function drawFlowers(){
  let cx=W/2,cy=H/2-40;
  flowers.forEach(f=>{f.a+=f.sp;
    let x=cx+Math.cos(f.a)*f.r;
    let y=cy+Math.sin(f.a)*f.r*.35+Math.sin(time+f.pk)*10;
    let df=(f.r-Math.cos(f.a)*f.r)/f.r*.5+.5, sc=f.sc*df, tw=Math.sin(time*2+f.pk)*.3+.7;
    let eGlow=ctx.createRadialGradient(x,y,0,x,y,28*sc);
    eGlow.addColorStop(0,"hsla("+(Math.round(f.h))+",50%,80%,"+tw*.1+")");eGlow.addColorStop(1,"transparent");
    ctx.fillStyle=eGlow;ctx.beginPath();ctx.arc(x,y,28*sc,0,Math.PI*2);ctx.fill();ctx.globalAlpha=tw;
    ctx.font=Math.floor(36*sc)+"px serif";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(fEmojis[f.emId%fEmojis.length],x,y-6);ctx.globalAlpha=1;
    let tG=ctx.createLinearGradient(x-50,y+20,x+50,y+30);tG.addColorStop(0,f.c+"cc");tG.addColorStop(1,f.c);
    ctx.fillStyle=tG;ctx.font="bold "+Math.floor(12*sc)+"px 'Segoe UI',system-ui,sans-serif";
    ctx.globalAlpha=tw*.85;ctx.shadowColor=f.c;ctx.shadowBlur=6;ctx.fillText(f.t,x,y+18);
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    ctx.strokeStyle="rgba(170,150,210,.025)";ctx.lineWidth=.5;ctx.beginPath();
    ctx.ellipse(cx,cy,f.r,f.r*.30+Math.sin(time*f.pk)*10,Math.sin(time*.4)*.1,0,Math.PI*2);ctx.stroke();
  });
}

function drawOrbHearts(){
  let cx=W/2,cy=H/2-40;
  for(let i=0;i<8;i++){let ha=i*Math.PI/4+time*.35,dist=150+Math.sin(time+i)*12,
    ox=cx+Math.cos(ha)*dist,oy=cy+Math.sin(ha)*dist*.4*.6;
    let tw=Math.sin(time*2+i)*.3+.7,sz=Math.floor(18*tw);
    ctx.font=sz+"px serif";ctx.fillStyle="hsla("+(260+i*12)+",70%,65%,"+tw+")";
    ctx.textAlign="center";ctx.textBaseline="middle";
    let he;let v=Math.floor(time*.2)%3;
    if(v===0)he="💜";
    else if(v===1)he="💖";
    else he="💗";
    ctx.fillText(he,ox,oy);
  }
}

function animate(){drawBG();drawStars();drawArms();drawNebulae();drawFlowers();drawHeart();drawOrbHearts();requestAnimationFrame(animate)}

canvas.addEventListener('mousedown',ev=>{dragging=true;lastDrag={x:ev.clientX,y:ev.clientY};canvas.style.cursor='grabbing'});
document.addEventListener('mousemove',ev=>{if(!dragging)return;angleY+=(ev.clientX-lastDrag.x)*.008;angleX+=(ev.clientY-lastDrag.y)*.008;lastDrag={x:ev.clientX,y:ev.clientY}});
document.addEventListener('mouseup',()=>{dragging=false;canvas.style.cursor='grab'});
canvas.addEventListener('touchstart',ev=>{dragging=true;lastDrag={x:ev.touches[0].clientX,y:ev.touches[0].clientY}},{passive:true});
document.addEventListener('touchmove',ev=>{if(!dragging)return;let t=ev.touches[0];angleY+=(t.clientX-lastDrag.x)*.008;angleX+=(t.clientY-lastDrag.y)*.008;lastDrag={x:t.clientX,y:t.clientY}},{passive:true});
document.addEventListener('touchend',()=>{dragging=false});
window.addEventListener('resize',()=>{W=window.innerWidth;H=window.innerHeight;canvas.width=W;canvas.height=H});
requestAnimationFrame(animate);
