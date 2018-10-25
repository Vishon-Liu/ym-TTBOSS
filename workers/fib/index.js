var cnt=0;
setInterval(function () {
  ++cnt;
  if(cnt==30){
    worker.postMessage({ 'handle': 'ping' })
  }
  worker.postMessage(cnt)
},1000)
//清0
function clear(){
  cnt=0;
}
worker.onMessage(function (msg) {
  if (msg.handle == 'clear') clear();
})
