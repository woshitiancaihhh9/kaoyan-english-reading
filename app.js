(function(){
  var KEY='kyeng.v1',NAVKEY='kyeng.navHidden',store={m:{},w:{},d:{},c:{},e:{}};
  try{var s=JSON.parse(localStorage.getItem(KEY)||'{}');for(var k in store)store[k]=s[k]||{};}catch(e){}
  var VKEY='kyeng.view',view={f:'all',hm:0};try{var vv=JSON.parse(localStorage.getItem(VKEY)||'{}');if(vv.f)view.f=vv.f;view.hm=vv.hm?1:0;}catch(e){}
  function saveView(){try{localStorage.setItem(VKEY,JSON.stringify(view));}catch(e){}}
  function done(id){return !!(store.d[id]||store.m[id]||store.w[id]);}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
  var root=document.documentElement,body=document.body;
  var btn=document.getElementById('navtoggle');
  function mobile(){return window.matchMedia('(max-width:900px)').matches;}
  if(btn)btn.addEventListener('click',function(){
    if(mobile())body.classList.toggle('nav-open');
    else{var h=root.classList.toggle('nav-hidden');try{localStorage.setItem(NAVKEY,h?'1':'0');}catch(e){}}
  });
  var bd=document.querySelector('.backdrop');if(bd)bd.addEventListener('click',function(){body.classList.remove('nav-open');});
  var cur=document.querySelector('.toc-ch.current');if(cur)cur.scrollIntoView({block:'center'});
  function today(){var t=new Date();return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);}
  function days(d){if(!d)return 1e9;return Math.round((new Date(today())-new Date(d))/864e5);}
  var GAP=[1,3,7];
  function due(id){if(store.m[id])return false;if(!store.d[id])return true;return days(store.d[id])>=GAP[Math.min(store.c[id]||0,2)];}
  function streakTxt(id){if(!store.d[id])return '还没重做过';var c=store.c[id]||0,dd=days(store.d[id]);
    var g=GAP[Math.min(c,2)],left=g-dd;return '连对 '+c+' 次 · '+(store.m[id]?'已掌握':(left>0?left+' 天后复习':'今天该复习'))+(c>=3&&!store.m[id]?' · 可以勾「已掌握」了':'');}
  function cnt(map,ch){var p=ch+':',n=0;for(var k in map)if(k.indexOf(p)===0&&map[k])n++;return n;}
  function all(map){var n=0;for(var k in map)if(map[k])n++;return n;}
  function cntDone(ch){var p=ch==null?'':ch+':',s={},n=0;[store.d,store.m,store.w].forEach(function(mp){for(var k in mp)if(mp[k]&&k.indexOf(p)===0&&!s[k]){s[k]=1;n++;}});return n;}
  function dbar(b,pct){if(!b)return;var d=b.previousElementSibling;if(!d||!d.classList.contains('bar-done')){d=document.createElement('span');d.className='bar-done';b.parentNode.insertBefore(d,b);}d.style.width=pct+'%';}
  function refresh(){
    document.querySelectorAll('[data-ch]').forEach(function(el){
      var ch=el.getAttribute('data-ch'),t=+el.getAttribute('data-total')||0,d=cnt(store.m,ch),w=cnt(store.w,ch),dn=Math.min(cntDone(ch),t);
      var p=el.querySelector('[data-prog]');if(p){p.textContent='已做 '+dn+'/'+t+(w&&el.hasAttribute('data-showw')?' · 再错 '+w:'');p.title='已做 '+dn+' · 待做 '+(t-dn)+' · 已掌握 '+d+' · 再错 '+w;}
      var b=el.querySelector('[data-bar]');if(b)b.style.width=(t?Math.round(d*100/t):0)+'%';dbar(b,t?Math.round(dn*100/t):0);
      el.classList.toggle('ch-done',t>0&&dn>=t);
    });
    document.querySelectorAll('[data-all-total]').forEach(function(el){
      var t=+el.getAttribute('data-all-total'),d=all(store.m),dn=Math.min(cntDone(null),t);
      var p=el.querySelector('[data-all-prog]');if(p)p.textContent='已做 '+dn+' / '+t+' · 待做 '+(t-dn)+' · 已掌握 '+d+' · 再错 '+all(store.w);
      var b=el.querySelector('[data-all-bar]');if(b)b.style.width=(t?(d*100/t).toFixed(1):0)+'%';dbar(b,t?(dn*100/t).toFixed(1):0);
    });
    var st=document.getElementById('stat');
    if(st){var qs=document.querySelectorAll('article.q'),m=0,w=0,dn=0;qs.forEach(function(a){var id=a.dataset.qid;if(store.m[id])m++;if(store.w[id])w++;if(done(id))dn++;});
      st.innerHTML='已做 <b>'+dn+'</b>/'+qs.length+' · 待做 <b>'+(qs.length-dn)+'</b> · 已掌握 '+m+' · 再错 '+w;var ps=document.getElementById('pstat');if(ps)ps.innerHTML='本页 '+st.innerHTML;}
    document.querySelectorAll('article.q[data-qid]').forEach(function(a){var s=a.querySelector('.streak');if(s)s.textContent=streakTxt(a.dataset.qid);});
    renderHome();
  }
  function record(id,ok,wcb){
    store.d[id]=today();
    if(ok){store.c[id]=(store.c[id]||0)+1;}else{store.c[id]=0;store.w[id]=1;if(wcb)wcb.checked=true;}
    save();refresh();
  }
  function markLoc(n,on){document.querySelectorAll('.passage mark.loc').forEach(function(m){if((' '+m.dataset.q+' ').indexOf(' '+n+' ')>=0)m.classList.toggle('on',on);});}
  document.querySelectorAll('article.q[data-qid]').forEach(function(a){
    var id=a.dataset.qid,ans=a.dataset.ans||'',num=(a.id||'').replace(/^q/,'');
    var mcb=a.querySelector('.master-cb'),wcb=a.querySelector('.wrong-cb'),cs=a.querySelector('select.cause');
    if(mcb){mcb.checked=!!store.m[id];a.classList.toggle('mastered',mcb.checked);
      mcb.addEventListener('change',function(){if(mcb.checked)store.m[id]=1;else delete store.m[id];a.classList.toggle('mastered',mcb.checked);save();refresh();});}
    if(wcb){wcb.checked=!!store.w[id];
      wcb.addEventListener('change',function(){if(wcb.checked)store.w[id]=1;else delete store.w[id];save();refresh();});}
    if(cs){if(store.e[id])cs.value=store.e[id];cs.classList.toggle('set',!!cs.value);
      cs.addEventListener('change',function(){if(cs.value)store.e[id]=cs.value;else delete store.e[id];cs.classList.toggle('set',!!cs.value);save();});}
    var vd=a.querySelector('.verdict'),det=a.querySelector('details.ans');
    if(a.dataset.pb){
      var sels=a.querySelectorAll('select.pbsel'),go=a.querySelector('.go');
      a._reset=function(){a.classList.remove('done');sels.forEach(function(s){s.value='';s.disabled=false;s.classList.remove('right','wrong');});if(vd)vd.textContent='';go.textContent='提交';if(det)det.open=false;};
      go.addEventListener('click',function(){
        if(a.classList.contains('done')){a._reset();return;}
        var r=0;sels.forEach(function(s){var ok=s.value===s.dataset.a;if(ok)r++;s.classList.toggle('right',ok);s.classList.toggle('wrong',!ok);s.disabled=true;});
        a.classList.add('done');var ok=r===sels.length;
        if(vd){vd.className='verdict '+(ok?'ok':'bad');vd.textContent=ok?'全对！':'答对 '+r+'/'+sels.length+'（已标记“再错”）';}
        record(id,ok,wcb);if(det)det.open=true;go.textContent='重做';
      });
      return;
    }
    var opts=a.querySelectorAll('.opt');if(!opts.length||!ans)return;
    function judge(o){
      a.classList.add('done');var sel=o.dataset.l;
      opts.forEach(function(x){var l=x.dataset.l;x.classList.toggle('right',l===ans&&l===sel);x.classList.toggle('wrong',l!==ans&&l===sel);x.classList.toggle('miss',l===ans&&l!==sel);});
      var ok=sel===ans;
      if(vd){vd.className='verdict '+(ok?'ok':'bad');vd.textContent=ok?'回答正确 ✓':'又错了：你选 '+sel+'，正确答案 '+ans+'（已标记“再错”，看看它的陷阱标签）';}
      record(id,ok,wcb);if(det)det.open=true;markLoc(num,true);
    }
    a._reset=function(){a.classList.remove('done');opts.forEach(function(o){o.classList.remove('sel','right','wrong','miss');});if(vd)vd.textContent='';if(det)det.open=false;markLoc(num,false);};
    opts.forEach(function(o){o.addEventListener('click',function(){if(a.classList.contains('done'))return;opts.forEach(function(x){x.classList.remove('sel');});o.classList.add('sel');judge(o);});});
    if(det)det.addEventListener('toggle',function(){if(det.open)markLoc(num,true);else if(!a.classList.contains('done'))markLoc(num,false);});
  });
  var seg=document.querySelector('.toolbar .seg');
  if(seg){
    seg.innerHTML='<label><input type="radio" name="flt" value="all"><span>全部</span></label><label><input type="radio" name="flt" value="undone"><span>未做</span></label><label><input type="radio" name="flt" value="wrong"><span>再错</span></label>';
    if(['all','undone','wrong'].indexOf(view.f)<0)view.f='all';
    seg.querySelector('input[value="'+view.f+'"]').checked=true;
    var hl=document.createElement('label');hl.className='hm-toggle';hl.innerHTML='<input type="checkbox" id="hidem"><span>屏蔽已掌握</span>';
    seg.parentNode.insertBefore(hl,seg.nextSibling);
    var hcb=hl.querySelector('input');hcb.checked=!!view.hm;
    hcb.addEventListener('change',function(){view.hm=hcb.checked?1:0;saveView();applyFilter();});
  }
  function applyFilter(){
    var f=(document.querySelector('input[name=flt]:checked')||{}).value||'all',shown=0,hm=view.hm;
    document.querySelectorAll('article.q[data-qid]').forEach(function(a){var id=a.dataset.qid,h=false;
      if(f==='undone')h=done(id);else if(f==='wrong')h=!store.w[id];
      if(hm&&store.m[id])h=true;
      a.classList.toggle('hide',h);if(!h)shown++;});
    // 某篇文章下的题全被隐藏时，连同原文一起收起
    document.querySelectorAll('section.text-h').forEach(function(sec){var els=[],n=sec.nextElementSibling;
      while(n&&!(n.matches('section.text-h')||n.matches('p.empty')||n.matches('nav.pager'))){els.push(n);n=n.nextElementSibling;}
      var qs=els.filter(function(x){return x.matches('article.q');}),vis=qs.some(function(x){return !x.classList.contains('hide');});
      var hide=qs.length>0&&!vis;sec.classList.toggle('hide',hide);els.forEach(function(x){if(x.matches('details.passage'))x.classList.toggle('hide',hide);});});
    var e=document.getElementById('empty');if(e){e.style.display=shown?'none':'block';e.textContent=f==='undone'?'本页题目都做过了 🎉':f==='wrong'?'这个筛选下没有再错的题 🎉':'这个筛选下没有题目 🎉';}
  }
  document.querySelectorAll('input[name=flt]').forEach(function(r){r.addEventListener('change',function(){view.f=r.value;saveView();applyFilter();});});
  var ex=document.getElementById('expand');
  if(ex)ex.addEventListener('click',function(){var ds=document.querySelectorAll('details.ans'),open=ex.dataset.open!=='1';ds.forEach(function(d){d.open=open;});ex.dataset.open=open?'1':'0';ex.textContent=open?'收起全部答案':'展开全部答案';});
  var redo=document.getElementById('redo');
  if(redo)redo.addEventListener('click',function(){document.querySelectorAll('article.q').forEach(function(a){if(a._reset)a._reset();});window.scrollTo(0,0);});
  var rs=document.getElementById('reset-progress');
  if(rs)rs.addEventListener('click',function(){if(confirm('确定清空全部做题记录、错因和“已掌握”？')){store={m:{},w:{},d:{},c:{},e:{}};save();location.reload();}});
  var exp=document.getElementById('export');
  if(exp)exp.addEventListener('click',function(){prompt('复制以下内容即可在其他设备导入：',JSON.stringify(store));});
  var imp=document.getElementById('import');
  if(imp)imp.addEventListener('click',function(){var t=prompt('粘贴之前导出的进度：');if(!t)return;try{var s=JSON.parse(t);for(var k in store)store[k]=s[k]||{};save();location.reload();}catch(e){alert('格式不正确');}});
  function renderHome(){
    var dl=document.getElementById('duelist');if(!dl||!window.QIDX)return;
    var h=[],n=0,fresh=0;
    QIDX.forEach(function(q){if(!due(q[0]))return;n++;var nw=!store.d[q[0]];if(nw)fresh++;
      h.push('<a class="'+(nw?'new':'')+'" href="'+q[1]+'">'+q[2]+' <small>'+q[3]+(nw?'':' · 连对'+(store.c[q[0]]||0))+'</small></a>');});
    var more=dl.dataset.all==='1';dl.innerHTML=n?(h.slice(0,more?n:15).join('')+(n>15&&!more?'<a href="#" id="duemore">显示全部 '+n+' 题 ▾</a>':'')):'<span style="color:var(--mute);font-size:14px">今天没有需要复习的题 🎉</span>';
    var dc=document.getElementById('duecount');if(dc)dc.textContent='共 '+n+' 题'+(fresh?'（虚线框 = 还没重做过的 '+fresh+' 题）':'');
    var dm=document.getElementById('duemore');if(dm)dm.addEventListener('click',function(e){e.preventDefault();dl.dataset.all='1';renderHome();});
    var ce=document.getElementById('causes');
    if(ce){var c={},t=0;for(var k in store.e){c[store.e[k]]=(c[store.e[k]]||0)+1;t++;}
      if(!t)ce.innerHTML='<span style="color:var(--mute);font-size:14px">还没有标注错因。做错题时在题目右上角选一下，这里就会统计出你的主要问题。</span>';
      else{var mx=0;for(k in c)mx=Math.max(mx,c[k]);ce.innerHTML=(window.CAUSES||[]).filter(function(x){return c[x];}).sort(function(x,y){return c[y]-c[x];}).map(function(x){return '<div class="srow"><span class="sn">'+x+'</span><span class="sb"><span style="width:'+Math.round(c[x]*100/mx)+'%;background:var(--warn)"></span></span><span class="sc">'+c[x]+'</span></div>';}).join('');}}
  }
  (function(){var t=document.querySelector('.toolbar');if(t&&!document.getElementById('pstat')){var d=document.createElement('div');d.className='pstat';d.id='pstat';t.parentNode.insertBefore(d,t.nextSibling);}})();
  refresh();applyFilter();
})();
