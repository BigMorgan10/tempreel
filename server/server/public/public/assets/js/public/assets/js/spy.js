const WS_URL = 'wss://VOTRE_DOMAINE.com:8080?role=visitor';
const socket = new WebSocket(WS_URL);
const send = obj => socket.readyState===1 && socket.send(JSON.stringify(obj));

socket.addEventListener('open', () => send({ type: 'identify', ua: navigator.userAgent }));

['click','scroll','mousemove','touchstart'].forEach(ev=>{
  let throttle = 0;
  window.addEventListener(ev, e=>{
    const now = performance.now();
    if(now-throttle<150) return; throttle=now;
    send({type:'interaction',event:ev,x:e.clientX||0,y:e.clientY||0,element:e.target.tagName,ts:Date.now()});
  },{passive:true});
});

socket.addEventListener('message', msg=>{
  const {action,payload} = JSON.parse(msg.data);
  switch(action){
    case 'toggleTheme': document.body.classList.toggle('light'); break;
    case 'css': document.head.insertAdjacentHTML('beforeend',`<style>${payload}</style>`); break;
    case 'redirect': location.href=payload; break;
    case 'alert': alert(payload); break;
  }
});
