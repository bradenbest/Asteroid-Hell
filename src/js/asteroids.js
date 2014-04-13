function api_connect(){
  var API_ID  = 'Your API ID';
  var ENC_KEY = 'Your Encryption Key';
  if(window.NG){
    NG.connect(API_ID, ENC_KEY);
    console.log("Successfully connected to Newgrounds API");
  }else{
    alert("Failed to load Newgrounds API. Medals won\'t work");
  }
}

function asteroids_game(){
  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      W,H,
      mem = {},
      t = 0,
      key = [],
      paused = 1,
      pausedGFX = new Image(),
      youwin = 0,
      youwinGFX = new Image(),
      ticks = 0,
      // debug vars
      collisions = true,
      drawHitBoxes = false,
      fps = 24,
      win_lock = 0;
  pausedGFX.src = 'resources/paused.png';
  youwinGFX.src = 'resources/youwin.png';
  canvas.width = W = 1000;
  canvas.height = H = 600;
  canvas.tabIndex = 0;
  canvas.style.background = '#000';
  document.body.appendChild(canvas);
  function add(o){
      o.id = ++t;
      mem[o.id] = o;
  };
  function remove(o){
      delete mem[o.id];
  };
  function collision(x1,y1,w1,h1,x2,y2,w2,h2){
      return !( ((y1 + h1) < (y2)) || (y1 > (y2 + h2)) || ((x1 + w1) < x2) || (x1 > (x2 + w2)) );
  };
  function draw(x,y,w,h,c){
    ctx.save();
    ctx.fillStyle = c;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  };
  function Ship(){
      var x = Math.floor(Math.random()*W),
          y = Math.floor(Math.random()*H),
          w = 10,
          h = 10,
          v = 0,
          dir = 0,
          delay = 2,
          sdelay = 0,
          ship = new Image();
          ship.src = 'resources/ship.png';
      this.run = function(){
          var collided = false;
          if(key[37] || key[0x41]){ // Left / A
              delay --;
              if(delay <= 0){
                  dir --;
                  if(dir == -1){
                      dir = 7;
                  }
                  delay = 2;
              }
          }else if(key[39] || key[0x44]){ // Right / D
              delay --;
              if(delay <= 0){
                  dir ++;
                  dir = dir % 8;
                  delay = 2;
              }
          }else{
              delay = 2;
          }
          if(key[32] | key[0x4C]){ // Space / L
              sdelay --;
              if(sdelay <= 0){
                  new Bullet(x+2,y+2,dir);
                  sdelay = 3;
              }
          }else{
              sdelay = 3;
          }
          if(key[38] || key[0x57]){ // Up / W
              v += 0.1;
              if(v > 5){
                  v -= 0.1;
              }
          }else{
              v -= 0.1;
              if(v <= 0){
                  v = 0;
              }
          }
          if(dir == 0){ // N
              y -= v;
          }else if(dir == 1){ // NE
              y -= v/1.5;
              x += v/1.5;
          }else if(dir == 2){ // E
              x += v;
          }else if(dir == 3){ // SE
              x += v/1.5;
              y += v/1.5;
          }else if(dir == 4){ // S
              y += v;
          }else if(dir == 5){ // SW
              y += v/1.5;
              x -= v/1.5;
          }else if(dir == 6){ // W
              x -= v;
          }else if(dir == 7){ // NW
              x -= v/1.5;
              y -= v/1.5;
          }
          if(x < -w){
              x = W;
          }else if(x > W){
              x = -w;
          }
          if(y < -h){
              y = H;
          }else if(y > H){
              y = -h;
          }
          if(collisions){
            for(var i in mem){
                if(mem[i].constructor.name == 'Asteroid'){
                    var p = mem[i].getPosition(),
                        s = mem[i].getSize();
                    if(collision(x+2,y+2,w-4,h-4,p[0]+2,p[1]+2,(s*5)-4,(s*5)-4)){ // I shrunk the hitboxes to make it a little more fair
                        collided = true;
                    }
                }
            }
            if(collided){
               init();
            }
          }
          // draw on separate canvas, and then draw the canvas on the main canvas
          var canvas2 = document.createElement('canvas');
          canvas2.width = 20;
          canvas2.height = 20;
          ctx2 = canvas2.getContext('2d');
          ctx2.translate(10,10);
          ctx2.rotate((45*dir)*Math.PI/180);
          ctx2.translate(-10,-10);
          ctx2.drawImage(ship,5,5);
          if(drawHitBoxes){
            draw(x+2,y+2,w-4,h-4,'#0f0');
          }else{
            ctx.drawImage(canvas2,x-5,y-5);
          }
      };
      add(this);
  };
  function Bullet(x,y,dir){
      var x = x,
          y = y,
          w = 5,
          h = 5,
          v = 15,
          dir = dir,
          life = 60;
      this.run = function(){
          life --;
          if(life <= 0){
              remove(this);
          }
          if(dir == 0){ // N
              y -= v;
          }else if(dir == 1){ // NE
              y -= v;
              x += v;
          }else if(dir == 2){ // E
              x += v;
          }else if(dir == 3){ // SE
              x += v;
              y += v;
          }else if(dir == 4){ // S
              y += v;
          }else if(dir == 5){ // SW
              y += v;
              x -= v;
          }else if(dir == 6){ // W
              x -= v;
          }else if(dir == 7){ // NW
              x -= v;
              y -= v;
          }
          if(x < -w){
              x = W;
          }else if(x > W){
              x = -w;
          }
          if(y < -h){
              y = H;
          }else if(y > H){
              y = -h;
          }
          for(var i in mem){
              if(mem[i].constructor.name == 'Asteroid'){
                  var p = mem[i].getPosition(),
                      s = mem[i].getSize(),
                      multiplyFlag = 1;
                  if(s == 1){
                    s = 2;
                    multiplyFlag = 0;
                  }
                  if(collision(x,y,w,h,p[0],p[1],s*5,s*5)){
                      if(s > 1 && multiplyFlag){
                          for(var j = 0; j < 4; j++){
                              new Asteroid(s-1,p[0],p[1]);
                          }
                      }
                      remove(mem[i]);
                      remove(this);
                  }
              }
          }
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.fillRect(x,y,w,h);
          ctx.restore();
          if(drawHitBoxes){
            draw(x,y,w,h,'#00f');
          }
      };
      add(this);
  };
  function Asteroid(size,x,y){
      var x = x||(Math.random() * W),
          y = y||(Math.random() * H),
          size = size,
          w = size*5,
          h = size*5,
          v = [
              Math.random()*3,
              Math.random()*3
          ],
          asteroid = new Image(),
          sprite = Math.floor(Math.random()*2);
      v[0] *= (Math.random()<0.5) ? 1 : -1;
      v[1] *= (Math.random()<0.5) ? 1 : -1;
      asteroid.src = 'resources/asteroid' + sprite + '.png';
      this.getPosition = function(){
          return [x,y];
      };
      this.getSize = function(){
          return size;
      }
      this.run = function(){
          x += v[0];
          y += v[1];
          if(x < -w){
              x = W;
          }else if(x > W){
              x = -w;
          }
          if(y < -h){
              y = H;
          }else if(y > H){
              y = -h;
          }
          if(drawHitBoxes){
            draw(x,y,w,h,'#f00');
          }else{
            ctx.drawImage(asteroid,x,y,w,h);
          }
      };
      add(this);
  };
  function init(){
      mem = {};
      var i;
      new Ship();
      // TODO: Might have to nerf this if it's actually impossible
      for(i = 0; i < 4; i ++){
          new Asteroid(4);
      }
      for(i = 0; i < 2; i ++){
          new Asteroid(6);
      }
      new Asteroid(8);
      api_connect();
  };
  (function(){
      init();
  })();
  (function loop(){
      var objcount = 0, a;
      for(a in mem){
        objcount++;
      }
      ctx.clearRect(0,0,W,H);
      if(paused){
        var pw = 270, // sprite is exactly 270x90
            ph = 90;
        ctx.drawImage(pausedGFX,W/2-pw/2,H/2-ph/2,pw,ph);
      }else{
        ticks++;
        for(a in mem){
          if(mem[a]){
            mem[a].run();
          }
        }
      }
      if( ((objcount == 1 || objcount == 0) && ticks > 1) || youwin){
        var pw = 290,
            ph = 90;
        ctx.drawImage(youwinGFX,W/2-pw/2,H/2-ph/2,pw,ph);
        youwin = 1;
        if(!win_lock){
          mdl_delay = 7000; // Medal Delay = 7 seconds
          setTimeout(function(){ NG.unlockMedal('Victory 1/5'); },mdl_delay*0);
          setTimeout(function(){ NG.unlockMedal('Victory 2/5'); },mdl_delay*1);
          setTimeout(function(){ NG.unlockMedal('Victory 3/5'); },mdl_delay*2);
          setTimeout(function(){ NG.unlockMedal('Victory 4/5'); },mdl_delay*3);
          setTimeout(function(){ NG.unlockMedal('Victory 5/5'); },mdl_delay*4);
          win_lock = 1;
        }
      }
      setTimeout(loop,1000/fps);
  })();
  canvas.onfocus = function(){
    paused = 0;
  }
  canvas.onblur = function(){
    paused = 1;
  }
  canvas.onkeyup = canvas.onkeydown = function(e){
    key[e.keyCode] = e.type == 'keydown';
    return false;
  }
};

(function load_game(){
  if(window && document && document.body && asteroids_game){
    console.log("Load successful. Starting game...");
    asteroids_game();
  }else{
    console.log("Load failed, trying again in 1 second...");
    setTimeout(load_game, 1000);
  }
})();
