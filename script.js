(function(){
  var doc=document.documentElement,rail=document.getElementById('rail');
  var secs=[].slice.call(document.querySelectorAll('main section'));
  var btns=secs.map(function(s,i){
    var b=document.createElement('button');
    b.type='button';b.setAttribute('aria-label','Go to '+s.dataset.label);
    b.style.top=(i/(secs.length-1)*100)+'%';
    b.innerHTML='<span>'+s.dataset.label+'</span>';
    b.onclick=function(){s.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
    rail.appendChild(b);return b;
  });
  var wrap=document.getElementById('net-wrap'),ticking=false;
  function onScroll(){
    var max=doc.scrollHeight-innerHeight,p=max>0?Math.min(1,Math.max(0,scrollY/max)):0;
    rail.style.setProperty('--p',p);
    var act=0;secs.forEach(function(s,i){if(s.getBoundingClientRect().top<innerHeight*.5)act=i});
    btns.forEach(function(b,i){b.classList.toggle('on',i<=act)});
    var h=innerHeight;
    wrap.style.transform='translateY('+(scrollY*.3)+'px)';
    wrap.style.opacity=Math.max(0,1-scrollY/(h*.9));
    ticking=false;
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  addEventListener('resize',onScroll);onScroll();

  /* Network topology hero */
  var c=document.getElementById('net'),x=c.getContext('2d'),W,H,N=[],K=[],mouse=null;
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches,D=170;
  function v(n){return getComputedStyle(doc).getPropertyValue(n).trim()}
  var sig,pkt,line;
  function colors(){sig=v('--sig');pkt=v('--pkt');line=v('--sig')}
  function size(){
    var r=c.parentElement.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
    W=r.width;H=r.height;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);
    var n=Math.round(Math.min(46,W*H/20000));N=[];K=[];
    for(var i=0;i<n;i++)N.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:2+Math.random()*2.5});
    colors();draw();
  }
  function near(a){var o=[];N.forEach(function(b){if(b!==a){var dx=a.x-b.x,dy=a.y-b.y;if(dx*dx+dy*dy<D*D)o.push(b)}});return o}
  function draw(){
    x.clearRect(0,0,W,H);x.lineWidth=1;
    for(var i=0;i<N.length;i++)for(var j=i+1;j<N.length;j++){
      var a=N[i],b=N[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<D){x.globalAlpha=(1-d/D)*.35;x.strokeStyle=line;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}
    }
    if(mouse){N.forEach(function(n){var dx=n.x-mouse.x,dy=n.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<D*1.2){x.globalAlpha=(1-d/(D*1.2))*.7;x.strokeStyle=pkt;x.beginPath();x.moveTo(n.x,n.y);x.lineTo(mouse.x,mouse.y);x.stroke()}});
      x.globalAlpha=1;x.fillStyle=pkt;x.beginPath();x.arc(mouse.x,mouse.y,5,0,6.283);x.fill()}
    x.globalAlpha=.9;x.fillStyle=sig;
    N.forEach(function(n){x.beginPath();x.arc(n.x,n.y,n.r,0,6.283);x.fill()});
    K.forEach(function(k){var px=k.a.x+(k.b.x-k.a.x)*k.t,py=k.a.y+(k.b.y-k.a.y)*k.t;
      x.globalAlpha=1;x.fillStyle=pkt;x.beginPath();x.arc(px,py,3.5,0,6.283);x.fill()});
    x.globalAlpha=1;
  }
  function step(){
    if(scrollY<innerHeight*1.1){
      N.forEach(function(n){n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1});
      if(K.length<8&&Math.random()<.05){var a=N[Math.floor(Math.random()*N.length)];if(a){var o=near(a);if(o.length)K.push({a:a,b:o[Math.floor(Math.random()*o.length)],t:0})}}
      K.forEach(function(k){k.t+=.018});K=K.filter(function(k){return k.t<1});
      draw();
    }
    requestAnimationFrame(step);
  }
  var hero=document.getElementById('top');
  hero.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();mouse={x:e.clientX-r.left,y:e.clientY-r.top}});
  hero.addEventListener('pointerleave',function(){mouse=null});
  addEventListener('resize',size);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',colors);
  size();if(!rm)requestAnimationFrame(step);
})();
