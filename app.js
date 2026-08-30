const KEY='gym_tycoon_v17';
const PREVKEY='gym_tycoon_v16';
const OLDKEY='gym_tycoon_v1';
const machines=[
 ['treadmill','跑步機','🏃',1200,3,'cardio'],['bench','臥推架','🏋️',1800,5,'strength'],['squat','深蹲架','🦵',2400,7,'strength'],['bike','飛輪車','🚴',3200,9,'cardio'],['cable','滑輪機','💪',4500,12,'strength'],['sauna','三溫暖','🧖',8000,20,'cardio']
];
const employeeRoles=[['coach','健身教練','🏋️',2200,'提升服務與收入'],['yoga','瑜珈教練','🧘',2000,'提升課程收入'],['front','櫃檯人員','🧑‍💼',1700,'提升會員招募效率'],['cleaner','清潔人員','🧹',1500,'維持環境與評價'],['repair','維修人員','🔧',1900,'提升器材效率'],['security','保全','🛡️',1800,'降低營運事件損失']];
const employeeNames=['阿泰','小瑜','大雄','阿美','老王','小林','Ken','Mina','Leo','Yuki','阿凱','小安','Rina','阿哲'];
const facilities=[
 ['shower','淋浴間','🚿',4500,'提升會員滿意度，評價更容易成長'],
 ['vending','健康販賣機','🥤',3000,'每位來客額外消費，提高營收'],
 ['lounge','休息區','🛋️',5500,'增加場館容量並改善尖峰體驗'],
 ['ptzone','私人教練區','🥊',8000,'私人課程收入與教練培養效率提升']
];
const rivals=[
 {name:'IRON HOUSE',icon:'🦾',base:125},
 {name:'POWER LAB',icon:'⚡',base:165},
 {name:'TITAN GYM',icon:'🗿',base:215}
];
const staffs=[['coach','健身教練','🧑‍🏫',3000,'收入 +15%，降低排隊不滿'],['desk','櫃檯人員','🙋',1800,'新會員成長 +20%'],['clean','清潔人員','🧹',1500,'評價更容易提升'],['manager','店長','🧑‍💼',7000,'所有收入再 +10%']];
const quests=[
 {id:'q1',name:'第一桶金',desc:'累積營收達 $10,000',reward:1500,ok:g=>g.totalRevenue>=10000},
 {id:'q2',name:'器材控',desc:'持有 6 台器材',reward:2000,ok:g=>totalMachines()>=6},
 {id:'q3',name:'人氣健身房',desc:'會員達 50 人',reward:3000,ok:g=>g.members>=50},
 {id:'q4',name:'五星之路',desc:'評價達 4.5',reward:4000,ok:g=>g.rating>=4.5},
 {id:'q5',name:'旗艦店',desc:'健身房升到 Lv.4',reward:6000,ok:g=>g.level>=4}
];
function fresh(){return{money:5000,members:8,rating:3.5,prestige:0,day:1,hour:8,todayIncome:0,totalRevenue:0,served:0,bestDay:0,level:1,fee:800,machines:{treadmill:1},staff:{},claimed:{},machineLv:{},classes:{},branches:1,layout:{},vipMembers:[],coachXP:0,facilities:{},leagueWeek:1,rivalWins:0,lastLeagueDay:0,lastRank:4,employees:[],staffCap:5,staffCapLv:0,events:['🎉 健身房正式開幕！會員已經在門口排隊了。']}}
function load(){try{let v=JSON.parse(localStorage.getItem(KEY));if(v)return {...fresh(),...v};let prev=JSON.parse(localStorage.getItem(PREVKEY));if(prev)return {...fresh(),...prev,machineLv:prev.machineLv||{},classes:prev.classes||{},branches:prev.branches||1,layout:prev.layout||{},vipMembers:prev.vipMembers||[],coachXP:prev.coachXP||0,facilities:prev.facilities||{},leagueWeek:prev.leagueWeek||1,rivalWins:prev.rivalWins||0,lastLeagueDay:prev.lastLeagueDay||0,lastRank:prev.lastRank||4,employees:prev.employees||[],staffCap:prev.staffCap||5,staffCapLv:prev.staffCapLv||0};let old=JSON.parse(localStorage.getItem(OLDKEY));if(old)return {...fresh(),...old,totalRevenue:old.totalRevenue||0,served:0,bestDay:0,fee:800,prestige:0,claimed:{}}}catch(e){}return fresh()}
let g=load(),animating=false,layoutEdit=false;
const $=id=>document.getElementById(id); const fmt=n=>'$'+Math.floor(n).toLocaleString();
function totalMachines(){return Object.values(g.machines).reduce((a,b)=>a+b,0)}
function capacity(){return 10+totalMachines()*4+(g.level-1)*20+(g.facilities?.lounge?10:0)}
function demand(){let base=Math.max(3,Math.round(g.members*(0.15+Math.random()*0.12)));let pricePenalty=Math.max(.55,1-(g.fee-800)/1800);return Math.max(1,Math.round(base*pricePenalty))}
function revenuePerVisitor(){let eq=machines.reduce((s,m)=>s+(g.machines[m[0]]||0)*m[4]*(1+((g.machineLv||{})[m[0]]||0)*.12),0);let mult=(g.staff.coach?1.15:1)*(g.staff.manager?1.10:1)*(1+Math.min(.30,roleCount('coach')*.035+roleCount('front')*.02+roleCount('repair')*.015))*(g.facilities?.vending?1.08:1);return Math.round((13+eq*0.7+g.fee/55)*mult)}
function hourly(){return Math.round(Math.min(g.members,capacity())*.22*revenuePerVisitor())}
function save(){localStorage.setItem(KEY,JSON.stringify(g));render()}
function push(s){g.events.unshift(s);g.events=g.events.slice(0,7)}
function pixelFlash(text){let d=document.createElement('div');d.className='pixelMoneyFlash';d.textContent=text;document.body.appendChild(d);setTimeout(()=>d.remove(),850)}
function toastMsg(s){let t=$('toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1400)}
function tab(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');render()}
function toggleLayoutMode(){
 layoutEdit=!layoutEdit;
 let scene=$('gymScene'),btn=$('layoutModeBtn');
 if(scene)scene.classList.toggle('layoutEditing',layoutEdit);let hud=$('placementHud');if(hud)hud.textContent=layoutEdit?'配置模式：開啟｜拖曳綠框器材':'配置模式：關閉';
 if(btn){btn.classList.toggle('active',layoutEdit);btn.textContent=layoutEdit?'✅ 器材配置：開啟':'🛠️ 器材配置：關閉'}
 let hint=$('layoutHint');if(hint)hint.textContent=layoutEdit?'拖曳器材到想要的位置，放開後會自動儲存。':'開啟「器材配置」後，可直接拖曳場內器材。';
 renderScene();
}
function resetLayout(){
 g.layout={};
 localStorage.setItem(KEY,JSON.stringify(g));
 renderScene();
 toastMsg('器材位置已重設');
}
function setFee(v){g.fee=+v;save()}
function machineSlots(){let out=[];let cardio=[[39,17],[52,17],[65,17],[78,17],[39,31],[52,31],[65,31],[78,31]];let strength=[[39,59],[52,59],[65,59],[78,59],[39,75],[52,75],[65,75],[78,75]];let ci=0,si=0;machines.forEach(m=>{for(let i=0;i<(g.machines[m[0]]||0);i++){let arr=m[5]==='cardio'?cardio:strength;let idx=m[5]==='cardio'?ci++:si++;let p=arr[idx%arr.length];out.push({id:m[0],name:m[1],icon:m[2],x:p[0]+Math.floor(idx/arr.length)*4,y:p[1]})}});return out}



let v17Members=[],v17StaffAgents=[],v17Feed=[],v17Tick=0;
let v17Stats={reviews:0,referrals:0,vipUps:0,walkouts:0};
const v17MemberNames=['阿哲','小宇','雅婷','家豪','怡君','柏翰','詩涵','俊傑','宥辰','佩珊','昱廷','佳穎'];
const v17Goals=['減脂','增肌','體態','健康','力量'];
function v17PushFeed(text,type=''){v17Feed.unshift({text,type,time:((Math.floor(v17Tick/6)+6)%24)});v17Feed=v17Feed.slice(0,16)}
function v17InitAgents(){
 if(v17Members.length)return;
 let count=Math.max(4,Math.min(10,Math.round((g.members||8)/8)));
 for(let i=0;i<count;i++)v17Members.push({id:'m'+i,name:v17MemberNames[i%v17MemberNames.length],goal:v17Goals[i%v17Goals.length],mood:75+Math.floor(Math.random()*20),state:'報到',wait:0,x:8+Math.random()*20,y:72+Math.random()*15,target:null,vip:Math.random()<.18});
 let roles=['櫃檯','教練','清潔','維修'];let staffCount=Math.max(2,Math.min(6,Array.isArray(g.employees)?g.employees.length:4));
 for(let i=0;i<staffCount;i++)v17StaffAgents.push({id:'s'+i,name:'員工'+(i+1),role:roles[i%roles.length],state:'巡場',x:50+Math.random()*35,y:72+Math.random()*18});
}
function v17Targets(){let equipment=[];Object.entries(g.layout||{}).forEach(([key,p])=>{if(p&&typeof p.x==='number'&&typeof p.y==='number')equipment.push({key,x:p.x,y:p.y,type:p.type||key})});let facilities=[];Object.entries(g.v16Build||{}).forEach(([key,o])=>{if(o&&['locker','showerRoom','toilet','loungeRoom','counter'].includes(o.type))facilities.push({key,x:o.x,y:o.y,type:o.type})});return{equipment,facilities}}
function v17PickTarget(member){let {equipment,facilities}=v17Targets();if(member.state==='淋浴'){let s=facilities.filter(x=>x.type==='showerRoom'||x.type==='locker');if(s.length)return s[Math.floor(Math.random()*s.length)]}if(member.state==='休息'){let s=facilities.filter(x=>x.type==='loungeRoom');if(s.length)return s[Math.floor(Math.random()*s.length)]}if(equipment.length)return equipment[Math.floor(Math.random()*equipment.length)];return{x:45+Math.random()*25,y:45+Math.random()*25,type:'floor'}}
function v17StepMember(m){
 if(typeof isOpen==='function'&&!isOpen()){m.state='準備離場';m.x=8;m.y=88;return}
 let r=Math.random();if(m.state==='報到'){m.state='熱身';m.x=18;m.y=78;return}if(m.state==='準備離場'){m.x=8;m.y=88;return}
 if(r<.12){m.state='排隊';m.wait++;m.mood-=3;m.target=v17PickTarget(m)}else if(r<.25){m.state='休息';m.target=v17PickTarget({...m,state:'休息'})}else if(r<.34){m.state='淋浴';m.target=v17PickTarget({...m,state:'淋浴'})}else{m.state='訓練';m.wait=Math.max(0,m.wait-1);m.target=v17PickTarget(m);m.mood=Math.min(100,m.mood+1)}
 if(m.target){m.x=m.target.x;m.y=m.target.y}
 if(m.wait>=4){m.mood-=7;if(m.mood<45&&Math.random()<.35){m.state='準備離場';m.x=8;m.y=88;v17Stats.walkouts++;v17PushFeed('😠 '+m.name+' 等候太久，決定提早離場','bad');m.wait=0}}
 if(m.mood>88&&Math.random()<.025){v17Stats.reviews++;v17PushFeed('⭐ '+m.name+' 對今天的訓練體驗留下好評','good')}
 if(m.mood>84&&Math.random()<.018){v17Stats.referrals++;g.members=(g.members||0)+1;v17PushFeed('🤝 '+m.name+' 推薦了一位朋友加入','good')}
 if(!m.vip&&m.mood>92&&Math.random()<.01){m.vip=true;v17Stats.vipUps++;g.money+=300;v17PushFeed('💎 '+m.name+' 升級成 VIP 會員','good')}
}
function v17StepStaff(s){let {equipment,facilities}=v17Targets();if(s.role==='櫃檯'){let c=facilities.find(x=>x.type==='counter');s.state='處理報到';if(c){s.x=c.x;s.y=c.y}else{s.x=15;s.y=82}}else if(s.role==='教練'){let m=v17Members.find(x=>x.state==='訓練');s.state=m?'指導會員':'巡場';if(m){s.x=m.x+3;s.y=m.y+3}}else if(s.role==='清潔'){s.state='清潔巡場';s.x=20+Math.random()*65;s.y=20+Math.random()*65;if(Math.random()<.08)v17PushFeed('🧹 清潔員完成一區清潔，會員滿意度提升','good')}else{s.state='檢查器材';let e=equipment[Math.floor(Math.random()*equipment.length)];if(e){s.x=e.x+2;s.y=e.y+2}if(Array.isArray(brokenKeys)&&brokenKeys.length&&Math.random()<.25){brokenKeys.shift();v17PushFeed('🔧 維修員修復了一台故障器材','good')}}}
function v17RenderNpcs(){let scene=$('gymScene')||document.querySelector('.gym');if(!scene)return;scene.querySelectorAll('.v17Npc').forEach(n=>n.remove());v17Members.forEach(m=>{let d=document.createElement('div');d.className='v17Npc member';d.style.left=m.x+'%';d.style.top=m.y+'%';let bubble=m.state==='排隊'?'⌛':m.state==='訓練'?'💪':m.state==='淋浴'?'🚿':m.state==='休息'?'💬':'';d.innerHTML=(m.vip?'💎':'🧍')+(bubble?'<span class="bubble">'+bubble+'</span>':'');scene.appendChild(d)});v17StaffAgents.forEach(s=>{let icon=s.role==='櫃檯'?'🧑‍💼':s.role==='教練'?'🏋️':s.role==='清潔'?'🧹':'🔧';let d=document.createElement('div');d.className='v17Npc staff';d.style.left=s.x+'%';d.style.top=s.y+'%';d.innerHTML=icon;scene.appendChild(d)})}
function renderV17Life(){v17InitAgents();if($('v17LiveMembers'))$('v17LiveMembers').textContent=v17Members.filter(x=>x.state!=='準備離場').length;if($('v17LiveStaff'))$('v17LiveStaff').textContent=v17StaffAgents.length;if($('v17LiveQueue'))$('v17LiveQueue').textContent=v17Members.filter(x=>x.state==='排隊').length;let avg=v17Members.length?Math.round(v17Members.reduce((a,b)=>a+b.mood,0)/v17Members.length):0;if($('v17Mood'))$('v17Mood').textContent=avg+'%';let feed=$('v17ActivityFeed');if(feed)feed.innerHTML=v17Feed.length?v17Feed.map(x=>'<div class="v17ActivityItem '+x.type+'"><b>'+String(x.time).padStart(2,'0')+':00</b> '+x.text+'</div>').join(''):'<div class="v17ActivityItem">場館目前運作正常。</div>';let ml=$('v17MemberList');if(ml)ml.innerHTML=v17Members.map(m=>'<div class="v17Person"><div class="v17Avatar">'+(m.vip?'💎':'🧍')+'</div><div><b>'+m.name+'｜'+m.goal+'</b><small>'+m.state+(m.wait?'｜等待 '+m.wait:'')+'</small><div class="v17MoodBar"><div class="v17MoodFill" style="width:'+Math.max(0,m.mood)+'%"></div></div></div><span class="v17State">'+m.mood+'%</span></div>').join('');let sl=$('v17StaffList');if(sl)sl.innerHTML=v17StaffAgents.map(s=>'<div class="v17Person"><div class="v17Avatar">'+(s.role==='櫃檯'?'🧑‍💼':s.role==='教練'?'🏋️':s.role==='清潔'?'🧹':'🔧')+'</div><div><b>'+s.name+'｜'+s.role+'</b><small>'+s.state+'</small></div><span class="v17State">工作中</span></div>').join('');if($('v17Reviews'))$('v17Reviews').textContent=v17Stats.reviews;if($('v17Referrals'))$('v17Referrals').textContent=v17Stats.referrals;if($('v17VipUps'))$('v17VipUps').textContent=v17Stats.vipUps;if($('v17Walkouts'))$('v17Walkouts').textContent=v17Stats.walkouts}
function v17LifeStep(){v17InitAgents();v17Tick++;v17Members.forEach(v17StepMember);v17StaffAgents.forEach(v17StepStaff);if(v17Tick%5===0){let q=v17Members.filter(x=>x.state==='排隊').length;if(q>=3)v17PushFeed('⌛ 尖峰排隊：目前有 '+q+' 位會員等待器材','warn')}v17RenderNpcs();renderV17Life()}
setInterval(v17LifeStep,2200);
let v16Selection=null,v16Rotation=0,v16Pos={x:50,y:50},v16Demolish=false;
if(!g.v16Build)g.v16Build={};

const v16StructureCatalog=[
 ['wall','牆壁','🧱',180,'structure','切分空間與動線',0,0,8],
 ['door','門','🚪',260,'structure','讓會員通過分區',0,1,5],
 ['counter','接待櫃檯','🛎️',850,'structure','提升報到效率',1,2,15]
];
const v16RoomCatalog=[
 ['locker','更衣室','👕',1800,'room','提高會員滿意度',0,7,55],
 ['showerRoom','淋浴間','🚿',2200,'room','運動後恢復更好',0,9,70],
 ['toilet','廁所','🚻',1200,'room','基礎服務設施',0,5,35],
 ['loungeRoom','休息室','🛋️',1600,'room','提升停留時間',1,6,45]
];
const v16DecorCatalog=[
 ['plant','植物','🪴',220,'decor','增加舒適感',1,1,2],
 ['mirror','鏡牆','🪞',420,'decor','提升訓練區質感',2,1,3],
 ['light','氛圍燈','💡',500,'decor','提升評價',2,2,4],
 ['poster','健身海報','🖼️',280,'decor','增加場館魅力',1,1,2]
];

function allV16Catalog(){return [...v16StructureCatalog,...v16RoomCatalog,...v16DecorCatalog]}
function showV16Tab(name){
 ['structure','room','decor','manage'].forEach(n=>{
  let p=$('v16'+n[0].toUpperCase()+n.slice(1));if(p)p.classList.toggle('active',n===name);
  let b=$('v16Tab'+n[0].toUpperCase()+n.slice(1)+'Btn');if(b)b.classList.toggle('active',n===name);
 });
 renderV16();
}
function renderV16(){
 const renderList=(id,arr)=>{
   let el=$(id);if(!el)return;
   el.innerHTML=arr.map(i=>`<div class="v16Item"><div class="icon">${i[2]}</div><b>${i[1]}</b><small>${i[5]}</small><div class="cost">$${i[3]}</div><button onclick="selectV16('${i[0]}')">選擇</button></div>`).join('');
 };
 renderList('v16StructureList',v16StructureCatalog);
 renderList('v16RoomList',v16RoomCatalog);
 renderList('v16DecorList',v16DecorCatalog);
 renderV16Canvas();
 let vals=Object.values(g.v16Build||{}),bonus=0,happy=0,maint=0;
 vals.forEach(o=>{let it=allV16Catalog().find(x=>x[0]===o.type);if(it){bonus+=it[6]||0;happy+=it[7]||0;maint+=it[8]||0}});
 if($('v16BuiltCount'))$('v16BuiltCount').textContent=vals.length;
 if($('v16DecorBonus'))$('v16DecorBonus').textContent='+'+bonus;
 if($('v16HappyBonus'))$('v16HappyBonus').textContent='+'+happy;
 if($('v16Maintenance'))$('v16Maintenance').textContent='$'+maint;
 updateV16Ghost();
}
function selectV16(id){
 let it=allV16Catalog().find(x=>x[0]===id);if(!it)return;
 v16Selection=id;v16Rotation=0;v16Pos={x:50,y:50};updateV16Ghost();toastMsg(`已選擇 ${it[1]}`);
}
function rotateV16(){v16Rotation=(v16Rotation+90)%360;updateV16Ghost()}
function cancelV16(){v16Selection=null;updateV16Ghost()}
function v16Collision(x,y){
 return Object.values(g.v16Build||{}).some(o=>Math.abs(o.x-x)<6&&Math.abs(o.y-y)<7)
 || Object.values(g.layout||{}).some(p=>p&&Math.abs((p.x||0)-x)<6&&Math.abs((p.y||0)-y)<7);
}
function updateV16Ghost(){
 let ghost=$('v16Ghost'),label=$('v16Selected');if(!ghost)return;
 if(!v16Selection){ghost.className='v16Ghost';if(label)label.textContent='尚未選擇建築物件';return;}
 let it=allV16Catalog().find(x=>x[0]===v16Selection);if(!it)return;
 let bad=v16Pos.x<4||v16Pos.x>96||v16Pos.y<5||v16Pos.y>95||v16Collision(v16Pos.x,v16Pos.y);
 ghost.className='v16Ghost active'+(bad?' invalid':'');
 ghost.style.left=v16Pos.x+'%';ghost.style.top=v16Pos.y+'%';ghost.style.transform=`translate(-50%,-50%) rotate(${v16Rotation}deg)`;
 ghost.textContent=it[2];
 if(label)label.textContent=`${it[2]} ${it[1]}｜${v16Rotation}°｜格子 ${Math.round(v16Pos.x/5)},${Math.round(v16Pos.y/5)}`;
}
function confirmV16Placement(){
 if(!v16Selection)return toastMsg('請先選擇建築物件');
 let ghost=$('v16Ghost');if(ghost?.classList.contains('invalid'))return toastMsg('❌ 此位置無法建造');
 let it=allV16Catalog().find(x=>x[0]===v16Selection);if(!it)return;
 if(g.money<it[3])return toastMsg('資金不足');
 g.money-=it[3];
 let key='v16_'+Date.now();
 g.v16Build[key]={type:v16Selection,x:v16Pos.x,y:v16Pos.y,rotation:v16Rotation};
 save();render();renderV16();renderScene();toastMsg(`🏗️ ${it[1]} 建造完成`);
}
function toggleDemolishMode(){
 v16Demolish=!v16Demolish;
 let b=$('demolishBtn');if(b)b.textContent=`拆除模式：${v16Demolish?'開啟':'關閉'}`;
 renderV16Canvas();
}
function demolishV16(key){
 if(!v16Demolish)return;
 let o=g.v16Build?.[key];if(!o)return;let it=allV16Catalog().find(x=>x[0]===o.type);if(!it)return;
 let refund=Math.round(it[3]*0.5);g.money+=refund;delete g.v16Build[key];save();render();renderV16();renderScene();toastMsg(`🗑️ 已拆除，返還 $${refund}`);
}
function renderV16Canvas(){
 let c=$('v16Canvas');if(!c)return;
 c.querySelectorAll('.v16Placed').forEach(n=>n.remove());
 Object.entries(g.v16Build||{}).forEach(([key,o])=>{
  let it=allV16Catalog().find(x=>x[0]===o.type);if(!it)return;
  let d=document.createElement('div');
  d.className=`v16Placed ${it[4]}${v16Demolish?' demolish':''}`;
  d.style.left=o.x+'%';d.style.top=o.y+'%';d.style.transform=`translate(-50%,-50%) rotate(${o.rotation||0}deg)`;
  d.innerHTML=`${it[2]}<small></small>`;d.onclick=()=>demolishV16(key);c.appendChild(d);
 });
}
setTimeout(()=>{
 let c=$('v16Canvas');if(!c)return;
 const move=e=>{
   if(!v16Selection)return;let r=c.getBoundingClientRect();
   let x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
   v16Pos={x:Math.max(5,Math.min(95,Math.round(x/5)*5)),y:Math.max(5,Math.min(95,Math.round(y/5)*5))};
   updateV16Ghost();
 };
 c.addEventListener('pointerdown',move);
 c.addEventListener('pointermove',e=>{if(e.buttons||e.pressure>0)move(e)});
},600);

let v15Warehouse = JSON.parse(localStorage.getItem('gym_v15_warehouse')||'{}');
let buildSelection=null, buildRotation=0, buildPos={x:50,y:50}, selectedExistingKey=null;

const v15Catalog = [
 ['treadmill','跑步機','🏃',1200,'有氧區','提高有氧會員滿意度'],
 ['bike','飛輪車','🚴',950,'有氧區','適合尖峰分流'],
 ['bench','臥推椅','🏋️',1500,'自由重量','力量會員熱門器材'],
 ['dumbbell','啞鈴架','💪',1100,'自由重量','高使用率器材'],
 ['cable','滑輪機','⚙️',1800,'機械區','多功能訓練'],
 ['legpress','腿推機','🦵',2100,'機械區','高階腿部設備'],
 ['rower','划船機','🚣',1350,'有氧區','提升有氧選擇'],
 ['stretch','伸展架','🧘',700,'團課區','提升恢復與滿意度']
];

function showBuilderTab(name){
 ['shop','warehouse','place'].forEach(n=>{
  let pane=$('builder'+n[0].toUpperCase()+n.slice(1));if(pane)pane.classList.toggle('active',n===name);
  let btn=$('builder'+n[0].toUpperCase()+n.slice(1)+'Btn');if(btn)btn.classList.toggle('active',n===name);
 });
 renderV15Builder();
}
function renderV15Builder(){
 let shop=$('v15ShopList'),wh=$('warehouseList');
 if(shop) shop.innerHTML=v15Catalog.map(i=>`<div class="shopItem"><div class="icon">${i[2]}</div><b>${i[1]}</b><small>${i[4]}｜${i[5]}</small><div class="shopPrice">$${i[3]}</div><button onclick="buyToWarehouse('${i[0]}')">購買</button></div>`).join('');
 if(wh){
   let items=v15Catalog.filter(i=>(v15Warehouse[i[0]]||0)>0);
   wh.innerHTML=items.length?items.map(i=>`<div class="warehouseItem"><div class="icon">${i[2]}</div><b>${i[1]}</b><small>${i[4]}</small><span class="stockBadge">庫存 × ${v15Warehouse[i[0]]}</span><button onclick="selectBuildItem('${i[0]}')">選擇放置</button></div>`).join(''):'<div class="builderHint">倉庫目前是空的，先到器材商店購買。</div>';
 }
 updateBuildGhost();
}
function buyToWarehouse(id){
 let it=v15Catalog.find(x=>x[0]===id);if(!it)return;
 if(g.money<it[3])return toastMsg('資金不足');
 g.money-=it[3];v15Warehouse[id]=(v15Warehouse[id]||0)+1;
 localStorage.setItem('gym_v15_warehouse',JSON.stringify(v15Warehouse));save();render();renderV15Builder();toastMsg(`📦 ${it[1]} 已送進倉庫`);
}
function selectBuildItem(id){
 let it=v15Catalog.find(x=>x[0]===id);if(!it||!(v15Warehouse[id]>0))return;
 buildSelection=id;buildRotation=0;buildPos={x:50,y:50};selectedExistingKey=null;
 showBuilderTab('place');updateBuildGhost();toastMsg('拖曳場地選擇位置');
}
function rotateBuildItem(){
 buildRotation=(buildRotation+90)%360;updateBuildGhost();
}
function cancelBuildItem(){buildSelection=null;selectedExistingKey=null;updateBuildGhost()}
function buildOccupied(x,y,ignoreKey=null){
 return Object.entries(g.layout||{}).some(([k,p])=>k!==ignoreKey&&Math.abs((p?.x||0)-x)<7&&Math.abs((p?.y||0)-y)<8);
}
function updateBuildGhost(){
 let ghost=$('buildGhost'),label=$('selectedBuildItem');if(!ghost)return;
 if(!buildSelection){ghost.className='buildGhost';if(label)label.textContent='尚未選擇器材';return;}
 let it=v15Catalog.find(x=>x[0]===buildSelection);if(!it)return;
 let bad=buildPos.x<5||buildPos.x>95||buildPos.y<8||buildPos.y>92||buildOccupied(buildPos.x,buildPos.y,selectedExistingKey);
 ghost.className='buildGhost active'+(bad?' invalid':'')+(buildRotation?` rotation${buildRotation}`:'');
 ghost.style.left=buildPos.x+'%';ghost.style.top=buildPos.y+'%';ghost.innerHTML=`${it[2]}<small>${it[1]}｜${Math.round(buildPos.x/5)},${Math.round(buildPos.y/5)}</small>`;
 if(label)label.textContent=`${it[2]} ${it[1]}｜${buildRotation}°｜格子 ${Math.round(buildPos.x/5)},${Math.round(buildPos.y/5)}`;
}
function confirmBuildPlacement(){
 if(!buildSelection)return toastMsg('請先從倉庫選擇器材');
 let ghost=$('buildGhost');if(ghost?.classList.contains('invalid'))return toastMsg('❌ 此位置不能放置');
 let it=v15Catalog.find(x=>x[0]===buildSelection);if(!it)return;
 if(selectedExistingKey){
   g.layout[selectedExistingKey]={x:buildPos.x,y:buildPos.y,rotation:buildRotation};
   toastMsg('✓ 器材已移動');
 }else{
   if(!(v15Warehouse[buildSelection]>0))return toastMsg('倉庫沒有這台器材');
   v15Warehouse[buildSelection]--;
   let key='v15_'+buildSelection+'_'+Date.now();
   g.layout[key]={x:buildPos.x,y:buildPos.y,rotation:buildRotation,type:buildSelection};
   if(!g.v15Placed)g.v15Placed={};g.v15Placed[key]=buildSelection;
   localStorage.setItem('gym_v15_warehouse',JSON.stringify(v15Warehouse));
   toastMsg(`✓ ${it[1]} 已放置`);
 }
 save();renderScene();renderV15Builder();buildSelection=null;selectedExistingKey=null;updateBuildGhost();
}
function moveExistingEquipment(){
 let entries=Object.entries(g.v15Placed||{});
 if(!entries.length)return toastMsg('目前沒有 V15 放置的器材');
 let [key,id]=entries[0];selectedExistingKey=key;buildSelection=id;
 let p=(g.layout||{})[key]||{x:50,y:50};buildPos={x:p.x,y:p.y};buildRotation=p.rotation||0;updateBuildGhost();toastMsg('已選取一台器材，可拖曳移動');
}
function sellSelectedEquipment(){
 if(!selectedExistingKey)return toastMsg('先按「移動既有器材」選取器材');
 let id=(g.v15Placed||{})[selectedExistingKey],it=v15Catalog.find(x=>x[0]===id);if(!it)return;
 let refund=Math.round(it[3]*0.6);g.money+=refund;delete g.v15Placed[selectedExistingKey];delete g.layout[selectedExistingKey];
 selectedExistingKey=null;buildSelection=null;save();render();renderScene();renderV15Builder();toastMsg(`💰 已出售，回收 $${refund}`);
}
setTimeout(()=>{
 let canvas=$('buildCanvas');if(!canvas)return;
 canvas.addEventListener('pointerdown',e=>{
   if(!buildSelection)return;
   let r=canvas.getBoundingClientRect();
   let x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
   buildPos={x:Math.max(5,Math.min(95,Math.round(x/5)*5)),y:Math.max(8,Math.min(92,Math.round(y/5)*5))};
   updateBuildGhost();
 });
 canvas.addEventListener('pointermove',e=>{
   if(!buildSelection||!(e.buttons||e.pressure>0))return;
   let r=canvas.getBoundingClientRect();
   let x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
   buildPos={x:Math.max(5,Math.min(95,Math.round(x/5)*5)),y:Math.max(8,Math.min(92,Math.round(y/5)*5))};
   updateBuildGhost();
 });
},500);

let gameSpeed=1,simTick=6,simTodayIncome=0,brokenKeys=new Set();
let opsVisitors=0,opsPeakQueue=0,opsRepairs=0;

function setGameSpeed(v){gameSpeed=v;toastMsg(v?`遊戲速度 ${v}×`:'遊戲暫停')}
function gymHour(){return simTick%24}
function isOpen(){let h=gymHour();return h>=6&&h<24}
function acceptsEntry(){let h=gymHour();return h>=6&&h<22.5}
function phaseNow(){let h=gymHour();return h<6?'🔒 打烊':h<9?'🌅 開店時段':h<17?'☀️ 日間':h<22.5?'🌆 晚間尖峰':'🚪 最後離場'}
function opsTaskNow(){let h=gymHour();return h<6?'🧹 清潔／維修':h<9?'🧾 開店檢查':h<17?'🏋️ 正常營業':h<22.5?'🔥 尖峰應對':h<24?'🚪 只出不進':'🌙 打烊結算'}
function popCash(scene,x,y,amt){let p=document.createElement('div');p.className='cashPop';p.style.left=x;p.style.top=y;p.textContent=`+$${amt}`;scene.appendChild(p);setTimeout(()=>p.remove(),1000)}
function simulatorStep(){
 if(!gameSpeed||layoutEdit)return;simTick+=gameSpeed;
 let scene=$('gymScene');if(!scene)return;
 let status=$('openStatus');if(status){status.textContent=isOpen()?(acceptsEntry()?'🟢 營業中 06:00–24:00':'🟠 最後離場中｜停止入場'):'🔴 已打烊 00:00–06:00';status.classList.toggle('closed',!isOpen())}
 let gym=$('gymScene');if(gym)gym.classList.toggle('closedGym',!isOpen());
 let task=$('opsTask');if(task)task.textContent=opsTaskNow();
 document.querySelectorAll('.opsTimeline div').forEach(el=>{let h=Number(el.dataset.hour);let now=gymHour();el.classList.toggle('active',(h===24&&now>=22.5)||(h!==24&&now>=h&&now<h+3))});
 if(!isOpen()){scene.querySelectorAll('.pixelNpc').forEach(n=>n.remove());if($('simPeople'))$('simPeople').textContent='0';if($('simQueue'))$('simQueue').textContent='0';if($('dayPhase'))$('dayPhase').textContent='🔒 打烊清潔／維修';return;}
 let npcs=[...scene.querySelectorAll('.pixelNpc')],equips=[...scene.querySelectorAll('.equip')];
 if(!acceptsEntry()&&npcs.length){npcs.slice(Math.ceil(npcs.length/2)).forEach(n=>n.remove());npcs=[...scene.querySelectorAll('.pixelNpc')];}
 opsVisitors+=acceptsEntry()?Math.max(0,Math.round(npcs.length*.08*gameSpeed)):0;
 let peak=(simTick%24>=17&&simTick%24<22)?2:1;
 npcs.forEach((n,i)=>{
  let e=equips.length?equips[(i+simTick)%equips.length]:null;
  if(e&&!brokenKeys.has(e.dataset.key)){
   let x=parseFloat(e.style.left),y=parseFloat(e.style.top);
   n.style.left=Math.max(8,Math.min(88,x+(i%2?5:-4)))+'%';n.style.top=Math.max(12,Math.min(82,y+5))+'%';
   n.innerHTML=`${i%2?'🧑':'👩'}<small>會員</small><i class="npcBubble">${i%4===0?'💪':i%4===1?'❤️':i%4===2?'⌛':'💬'}</i>`;
   if(Math.random()<.08*peak){let amt=80+Math.floor(Math.random()*121);simTodayIncome+=amt;g.money+=amt;popCash(scene,n.style.left,n.style.top,amt)}
  }
 });
 if(equips.length&&Math.random()<.018*gameSpeed){let e=equips[Math.floor(Math.random()*equips.length)];brokenKeys.add(e.dataset.key);e.classList.add('brokenEquip')}
 if(roleCount('repair')&&brokenKeys.size&&Math.random()<.12*gameSpeed){let k=[...brokenKeys][0];brokenKeys.delete(k);let e=scene.querySelector(`[data-key="${k}"]`);if(e)e.classList.remove('brokenEquip');opsRepairs++}
 let q=Math.max(0,npcs.length-equips.filter(e=>!brokenKeys.has(e.dataset.key)).length);opsPeakQueue=Math.max(opsPeakQueue,q);
 if($('opsVisitors'))$('opsVisitors').textContent=opsVisitors;if($('opsPeakQueue'))$('opsPeakQueue').textContent=opsPeakQueue;if($('opsRepairs'))$('opsRepairs').textContent=opsRepairs;if($('opsRevenue'))$('opsRevenue').textContent=fmt(simTodayIncome);if($('simPeople'))$('simPeople').textContent=npcs.length;if($('simQueue'))$('simQueue').textContent=q;if($('simBroken'))$('simBroken').textContent=brokenKeys.size;if($('simIncome'))$('simIncome').textContent=fmt(simTodayIncome);if($('dayPhase'))$('dayPhase').textContent=phaseNow();
 if(simTick%24===0){
 let maintenance=0,decorBonus=0,happyBonus=0;
 Object.values(g.v16Build||{}).forEach(o=>{let it=allV16Catalog().find(x=>x[0]===o.type);if(it){maintenance+=it[8]||0;decorBonus+=it[6]||0;happyBonus+=it[7]||0}});
 g.money=Math.max(0,g.money-maintenance);
 g.rating=Math.min(5,(g.rating||3)+(decorBonus*0.002));
 simTodayIncome=0;opsVisitors=0;opsPeakQueue=0;opsRepairs=0;
}
 save();
}
setInterval(simulatorStep,1300);
function renderScene(){
 let scene=$('gymScene');if(!scene)return;
 scene.classList.toggle('layoutEditing',layoutEdit);
 scene.querySelectorAll('.equip,.memberDot,.facilitySpot,.pixelNpc').forEach(n=>n.remove());
 const snap=5;
 machineSlots().forEach((m,i)=>{
  let key=m.id+'_'+i,pos=(g.layout||{})[key],d=document.createElement('div');
  d.className='equip';d.style.left=(pos?.x??m.x)+'%';d.style.top=(pos?.y??m.y)+'%';
  d.innerHTML=`${m.icon}<small>${m.name}</small>`;d.dataset.key=key;
  d.addEventListener('pointerdown',e=>{if(!layoutEdit)return;e.preventDefault();d.setPointerCapture?.(e.pointerId);d.dataset.dragging='1';d.classList.add('dragActive')});
  d.addEventListener('pointermove',e=>{
   if(!layoutEdit||d.dataset.dragging!=='1')return;e.preventDefault();
   let r=scene.getBoundingClientRect(),rawX=(e.clientX-r.left)/r.width*100,rawY=(e.clientY-r.top)/r.height*100;
   let x=Math.max(5,Math.min(90,Math.round(rawX/snap)*snap)),y=Math.max(10,Math.min(85,Math.round(rawY/snap)*snap));
   let conflict=[...scene.querySelectorAll('.equip')].some(o=>o!==d&&Math.abs(parseFloat(o.style.left)-x)<6&&Math.abs(parseFloat(o.style.top)-y)<8);
d.classList.toggle('placeBAD',conflict);d.classList.toggle('placeOK',!conflict);
if(!conflict){d.style.left=x+'%';d.style.top=y+'%';g.layout[key]={x,y};}
   let c=$('gridCoord');if(c)c.textContent=`格子 X:${Math.round(x/snap)} Y:${Math.round(y/snap)}`;
  });
  const finish=e=>{if(d.dataset.dragging!=='1')return;if(d.classList.contains('placeBAD')){toastMsg('❌ 此位置已有器材');d.classList.remove('placeBAD');return;}d.dataset.dragging='0';d.classList.remove('dragActive','placeOK');try{d.releasePointerCapture?.(e.pointerId)}catch(_){}localStorage.setItem(KEY,JSON.stringify(g));toastMsg('✓ 已吸附格線並儲存')};
  d.addEventListener('pointerup',finish);d.addEventListener('pointercancel',finish);scene.appendChild(d);
 });
 let spots={shower:[6,18],vending:[7,36],lounge:[7,54],ptzone:[7,70]};
 
 
 Object.entries(g.v16Build||{}).forEach(([key,o])=>{
   let it=allV16Catalog().find(x=>x[0]===o.type);if(!it)return;
   let d=document.createElement('div');d.className=`v16Placed ${it[4]}`;
   d.style.left=o.x+'%';d.style.top=o.y+'%';d.style.transform=`translate(-50%,-50%) rotate(${o.rotation||0}deg)`;
   d.innerHTML=it[2];scene.appendChild(d);
 });
Object.entries(g.v15Placed||{}).forEach(([key,id])=>{
   let it=v15Catalog.find(x=>x[0]===id),p=(g.layout||{})[key];if(!it||!p)return;
   let d=document.createElement('div');d.className='equip';d.dataset.key=key;
   d.style.left=p.x+'%';d.style.top=p.y+'%';d.style.transform=`rotate(${p.rotation||0}deg)`;
   d.innerHTML=`${it[2]}<small>${it[1]}</small>`;
   scene.appendChild(d);
 });
facilities.forEach(f=>{if(!g.facilities?.[f[0]])return;let s=document.createElement('div');s.className='facilitySpot';s.style.left=spots[f[0]][0]+'%';s.style.top=spots[f[0]][1]+'%';s.innerHTML=`${f[2]}<small>${f[1]}</small>`;scene.appendChild(s)});
 if(!layoutEdit){
  let people=Math.min(6,Math.max(2,Math.round(g.members/12)));
  for(let i=0;i<people;i++){let n=document.createElement('div');n.className='pixelNpc memberNpc';n.style.left=(20+(i*13)%65)+'%';n.style.top=(20+(i*17)%55)+'%';n.innerHTML=`${i%2?'🧑':'👩'}<small>會員</small>`;scene.appendChild(n)}
  let staff=Math.min(3,(g.employees||[]).filter(e=>e.status!=='休假').length);
  for(let i=0;i<staff;i++){let n=document.createElement('div');n.className='pixelNpc staffNpc';n.style.left=(12+i*24)+'%';n.style.top=(68-i*13)+'%';n.innerHTML=`🧑‍💼<small>員工</small>`;scene.appendChild(n)}
 }
}
setInterval(()=>{if(layoutEdit)return;let scene=$('gymScene');if(!scene)return;scene.querySelectorAll('.pixelNpc').forEach((n,i)=>{n.style.left=(15+Math.floor(Math.random()*70))+'%';n.style.top=(18+Math.floor(Math.random()*62))+'%'});},2600);
function animateHour(visitors,servedCount,queueCount,earned){animating=true;$('operateBtn').disabled=true;renderScene();let scene=$('gymScene'),slots=machineSlots();let people=Math.min(visitors,8);$('visitors').textContent=people;$('queue').textContent=queueCount;for(let i=0;i<people;i++){let p=document.createElement('div');p.className='memberDot';p.textContent=['🙂','😎','🤓','😁','🧢','👩','🧔','👱'][i%8];p.style.left='6%';p.style.top=(70+i%4*6)+'%';scene.appendChild(p);setTimeout(()=>{let slot=slots[i%Math.max(1,slots.length)]||{x:48,y:48};p.style.left=(slot.x+2)+'%';p.style.top=(slot.y+4)+'%';p.classList.add('busy');if(i>=servedCount){let b=document.createElement('span');b.className='bubble';b.textContent='排隊中…';p.appendChild(b)}},150+i*80);setTimeout(()=>{p.style.left='9%';p.style.top='82%';p.classList.remove('busy')},1050+i*55);setTimeout(()=>p.remove(),1750+i*55)}setTimeout(()=>{animating=false;$('operateBtn').disabled=false;$('visitors').textContent='0';$('queue').textContent='0';toastMsg(`本小時營收 +${fmt(earned)}`)},1950)}
function nextHour(){if(animating)return;let visitors=Math.min(demand(),capacity()),machineCap=Math.max(1,totalMachines()*2),servedCount=Math.min(visitors,machineCap),queueCount=Math.max(0,visitors-machineCap);let earn=Math.round(servedCount*revenuePerVisitor()*(queueCount>0?.94:1));g.money+=earn;g.todayIncome+=earn;g.totalRevenue+=earn;g.served+=servedCount;g.hour++;g.employees.forEach(e=>{if(e.shift==='休假'){e.fatigue=Math.max(0,e.fatigue-18);e.mood=Math.min(100,e.mood+6);return}e.xp+=Math.max(1,Math.round(servedCount/8));e.fatigue=Math.min(100,e.fatigue+4);if(e.fatigue>75)e.mood=Math.max(0,e.mood-3);else e.mood=Math.min(100,e.mood+1);if(e.xp>=100){e.xp-=100;e.lv++;e.skill=Math.min(100,e.skill+3);e.service=Math.min(100,e.service+2);e.salary=Math.round(e.salary*1.08);push(`⭐ ${e.name} 升到 Lv.${e.lv}`)}});if(g.staff.coach)g.coachXP+=Math.round(servedCount*(g.facilities?.ptzone?1.35:1));if(Math.random()<.10&&g.vipMembers.length<12){let names=['阿哲','小美','Ken','Yuki','阿凱','Mina','Leo','小安','Rina','大雄'],goals=['增肌','減脂','體能','塑形'],n=names[Math.floor(Math.random()*names.length)];if(!g.vipMembers.some(v=>v.name===n)){let jobs=['上班族','學生','護理師','工程師','設計師','業務','老師','自由工作者'];g.vipMembers.push({name:n,goal:goals[Math.floor(Math.random()*goals.length)],job:jobs[Math.floor(Math.random()*jobs.length)],lv:1,progress:0});push(`🌟 ${n} 成為常客會員！`)}}g.vipMembers.forEach(v=>{v.progress+=Math.max(2,Math.round(servedCount/2));if(v.progress>=100){v.progress-=100;v.lv++;g.prestige+=2;push(`💪 ${v.name} 升到 Lv.${v.lv}`)}});
 if(g.facilities?.shower&&Math.random()<.22)g.rating=Math.min(5,g.rating+.015);if(queueCount>=4){g.rating=Math.max(1,g.rating-(g.staff.coach?.015:.035));push(`😓 尖峰時段有 ${queueCount} 人排隊，評價受到影響。`)}else if(Math.random()<.28){g.rating=Math.min(5,g.rating+(g.staff.clean?.05:.02));push('⭐ 會員對今天的訓練體驗很滿意！')}
 let growthChance=.25*(g.staff.desk?1.2:1)*Math.max(.35,1-(g.fee-800)/1400);if(Math.random()<growthChance){let grow=Math.max(1,Math.round((g.rating-2)*2));g.members+=grow;push(`👥 口碑帶來 ${grow} 位新會員！`)}
 if(Math.random()<.10){let d=Math.floor(120+Math.random()*260);g.money=Math.max(0,g.money-d);push(`🔧 器材臨時維護支出 ${fmt(d)}`)}
 if(g.hour>=22){g.bestDay=Math.max(g.bestDay,g.todayIncome);let bonus=Math.round(g.todayIncome*.05);g.money+=bonus;g.prestige+=Math.max(1,Math.round(g.rating));push(`🌙 第 ${g.day} 天結束：營收 ${fmt(g.todayIncome)}，營運獎勵 ${fmt(bonus)}`);g.day++;if(g.day>1&&g.day%7===1)runLeague();g.hour=8;g.todayIncome=0}
 save();animateHour(visitors,servedCount,queueCount,earn)}
function buyMachine(id){let m=machines.find(x=>x[0]===id),count=g.machines[id]||0,cost=Math.round(m[3]*(1+count*.35));if(g.money<cost)return toastMsg('資金不足');g.money-=cost;g.machines[id]=count+1;g.rating=Math.min(5,g.rating+.04);push(`🏋️ 新增 ${m[1]}，場館容量提升。`);save();renderScene();toastMsg(`${m[1]} 已進場，可到場館配置位置`);pixelFlash('EQUIPMENT +1') }
function hire(id){let s=staffs.find(x=>x[0]===id);if(g.staff[id])return;if(g.money<s[3])return toastMsg('資金不足');g.money-=s[3];g.staff[id]=1;push(`🤝 ${s[1]} 加入團隊`);save()}
function upgradeMachine(id){let m=machines.find(x=>x[0]===id),lv=(g.machineLv[id]||0),cost=Math.round(m[3]*(lv+1)*1.25);if(!(g.machines[id]>0))return toastMsg('請先購買器材');if(g.money<cost)return toastMsg('資金不足');g.money-=cost;g.machineLv[id]=lv+1;g.prestige+=2;push(`✨ ${m[1]} 升級到 Lv.${lv+2}`);save()}
function startClass(type){let data={yoga:['瑜珈課','🧘',1200,6],spin:['飛輪課','🚴',1800,9],pt:['私人教練課','💪',2500,12]}[type];if(!g.staff.coach)return toastMsg('需要先聘請健身教練');if(g.money<data[2])return toastMsg('資金不足');g.money-=data[2];let gain=Math.round(data[3]*(1+g.rating/5));g.members+=Math.ceil(gain/3);g.rating=Math.min(5,g.rating+.06);g.prestige+=2;let earn=Math.round(gain*Math.round(g.fee/20)*(g.facilities?.ptzone?1.2:1));g.money+=earn;g.totalRevenue+=earn;push(`${data[1]} ${data[0]}爆滿！帶來 ${fmt(earn)} 收入`);save();toastMsg(`${data[0]} 開課成功`)}
function setShift(id,shift){let e=g.employees.find(x=>x.id===id);if(!e)return;e.shift=shift;e.status=shift==='休假'?'休假中':'工作中';save()}
function promoteEmployee(id){let e=g.employees.find(x=>x.id===id);if(!e)return;let ranks=['一般','資深','組長','主管'],i=ranks.indexOf(e.rank||'一般');if(i>=ranks.length-1)return toastMsg('已是最高職級');let cost=(i+1)*3000;if(g.money<cost)return toastMsg('升遷資金不足');g.money-=cost;e.rank=ranks[i+1];e.salary=Math.round(e.salary*1.18);e.mood=Math.min(100,e.mood+18);g.prestige+=4;push(`🎖️ ${e.name} 升遷為${e.rank}`);save()}
function restAllTired(){g.employees.forEach(e=>{if(e.fatigue>=75){e.shift='休假';e.status='休假中';e.mood=Math.min(100,e.mood+8)}});save();toastMsg('已安排疲勞員工休假')}
function activeEmployees(){return g.employees.filter(e=>e.shift!=='休假')}
const gymTiers=[
 ['小型工作室',0,35,500],['社區健身房',12000,55,1200],['大型健身中心',35000,85,2600],['豪華旗艦店',80000,130,5200]
];
const zoneDefs=[
 ['cardio','有氧區','🏃',6000],['weights','自由重量區','🏋️',7000],['machine','機械訓練區','⚙️',8000],
 ['classroom','團課教室','🧘',10000],['vip','VIP 區','💎',18000],['boxing','拳擊區','🥊',16000],
 ['recovery','恢復中心','🧊',22000],['spa','三溫暖','♨️',30000]
];
function expandGym(){let n=Math.min(4,(g.building.tier||1)+1);if(n===g.building.tier)return toastMsg('已是最高等級');let t=gymTiers[n-1];if(g.money<t[1])return toastMsg('擴建資金不足');g.money-=t[1];g.building.tier=n;g.building.rent=t[3];g.prestige+=12;push(`🏗️ 健身房擴建為「${t[0]}」`);save()}
function buyZone(id){let z=zoneDefs.find(x=>x[0]===id);if(!z)return;if(g.building.zones[id])return toastMsg('區域已解鎖');if(g.money<z[3])return toastMsg('資金不足');g.money-=z[3];g.building.zones[id]=1;g.prestige+=5;push(`${z[2]} 解鎖 ${z[1]}`);save()}
function setGymStyle(s){let cost=3500;if(g.building.style===s)return;if(g.money<cost)return toastMsg('裝潢資金不足');g.money-=cost;g.building.style=s;g.rating=Math.min(5,g.rating+.05);push(`🎨 健身房改裝為 ${s}`);save()}
function buyDecor(k){let prices={plants:900,mirrors:1500,lights:1800},names={plants:'綠植',mirrors:'全身鏡',lights:'氣氛燈'};let c=prices[k]*(1+g.decor[k]);if(g.money<c)return toastMsg('資金不足');g.money-=c;g.decor[k]++;g.rating=Math.min(5,g.rating+.02);push(`🛋️ 新增${names[k]}`);save()}
function maintainGym(){let cost=Math.max(500,Math.round((100-g.building.condition)*80));if(g.money<cost)return toastMsg('維護資金不足');g.money-=cost;g.building.condition=100;g.building.cleanliness=Math.min(100,g.building.cleanliness+15);push('🔧 完成全館維護');save()}
function buildingDaily(){let b=g.building;b.cleanliness=Math.max(15,b.cleanliness-(2+Math.floor(g.members/20)));b.condition=Math.max(20,b.condition-(1+Math.floor(g.machines?Object.keys(g.machines).length/4:0)));if(roleCount('cleaner'))b.cleanliness=Math.min(100,b.cleanliness+roleCount('cleaner')*5);if(roleCount('repair'))b.condition=Math.min(100,b.condition+roleCount('repair')*4);let rent=Math.round(b.rent/30);g.money-=rent;if(b.cleanliness<50)g.rating=Math.max(1,g.rating-.04);if(b.condition<45)g.rating=Math.max(1,g.rating-.03);}
const memberNames=['小宇','阿豪','小晴','Kevin','美玲','阿杰','Yuna','志豪','Mika','小恩','阿倫','Nina'];const memberJobs=['工程師','老師','設計師','學生','業務','護理師','廚師','自由工作者'];const memberGoals=['減脂','增肌','體態雕塑','提升體能','健康維持'];
function ensureLifeMembers(){let t=Math.min(12,Math.max(4,Math.round(g.members/3)));while(g.lifeMembers.length<t)g.lifeMembers.push({id:Date.now()+Math.random(),name:memberNames[Math.floor(Math.random()*memberNames.length)],age:18+Math.floor(Math.random()*35),job:memberJobs[Math.floor(Math.random()*memberJobs.length)],goal:memberGoals[Math.floor(Math.random()*memberGoals.length)],days:1,progress:Math.floor(Math.random()*25),satisfaction:70+Math.floor(Math.random()*21),loyalty:45+Math.floor(Math.random()*31),vip:Math.random()<.18,spent:800+Math.floor(Math.random()*5000),review:0})}
function bodyStage(m){return m.progress>=90?'🏆':m.progress>=65?'💪':m.progress>=35?'🏃':'🙂'}function memberScore(m){return m.loyalty+m.satisfaction+Math.round(m.spent/1000)}
function trainLifeMembers(){if($('buildPanel')){
 let t=gymTiers[g.building.tier-1];
 $('buildTier').textContent=t[0];$('buildCap').textContent=t[2];$('buildRent').textContent=fmt(g.building.rent);
 $('cleanMeter').style.width=g.building.cleanliness+'%';$('cleanText').textContent=Math.round(g.building.cleanliness);
 $('conditionMeter').style.width=g.building.condition+'%';$('conditionText').textContent=Math.round(g.building.condition);
 $('zoneList').innerHTML=zoneDefs.map(z=>`<div class="card zoneCard"><div class="zoneIcon">${z[2]}</div><div><b>${z[1]}</b><div class="muted">${g.building.zones[z[0]]?'已解鎖，可供會員使用':'尚未解鎖'}</div></div><button ${g.building.zones[z[0]]?'disabled':''} onclick="buyZone('${z[0]}')">${g.building.zones[z[0]]?'已開放':fmt(z[3])}</button></div>`).join('');
 $('styleText').textContent=g.building.style;
 $('decorStats').textContent=`🌿 ${g.decor.plants}　🪞 ${g.decor.mirrors}　💡 ${g.decor.lights}`;
 let next=gymTiers[g.building.tier];$('expandBtn').textContent=next?`擴建：${next[0]} ${fmt(next[1])}`:'🏆 已達豪華旗艦店';
 $('expandBtn').disabled=!next;
}ensureLifeMembers();g.lifeMembers.forEach(m=>{m.days++;m.progress=Math.min(100,m.progress+2+Math.floor(Math.random()*4)+(roleCount('coach')?1:0));m.satisfaction=Math.max(0,Math.min(100,m.satisfaction+(g.rating>=4?2:-1)));m.loyalty=Math.max(0,Math.min(100,m.loyalty+(m.satisfaction>=80?2:m.satisfaction<50?-3:0)));m.spent+=Math.round(g.fee/30)+(m.vip?120:40);if(!m.review&&m.days>=5&&Math.random()<.18){m.review=Math.max(1,Math.min(5,Math.round(m.satisfaction/20)));g.memberReviews++;push(`📱 ${m.name} 留下 ${m.review}★ 評價`)}if(m.progress>=100){m.progress=15;g.memberChallenges++;g.prestige+=3;push(`🏆 ${m.name} 完成「${m.goal}」挑戰`)}});if(Math.random()<.18&&g.lifeMembers.some(m=>m.loyalty>=75)){g.members++;g.referrals++;push('🤝 忠誠會員推薦朋友加入')}}
function memberEvent(){ensureLifeMembers();let m=g.lifeMembers[Math.floor(Math.random()*g.lifeMembers.length)];if(!m)return;let n=Math.floor(Math.random()*4);if(n===0){m.satisfaction=Math.min(100,m.satisfaction+8);push(`❤️ ${m.name} 很滿意今天的訓練`)}if(n===1){m.satisfaction=Math.max(0,m.satisfaction-7);push(`😠 ${m.name} 抱怨器材等待太久`)}if(n===2){m.vip=true;m.loyalty=Math.min(100,m.loyalty+8);push(`💎 ${m.name} 升級 VIP`)}if(n===3){m.progress=Math.min(100,m.progress+8);push(`🔥 ${m.name} 訓練進度大增`)}save()}
function roleDef(id){return employeeRoles.find(r=>r[0]===id)}function roleCount(id){return(g.employees||[]).filter(e=>e.role===id&&e.shift!=='休假').length}
function hireEmployee(role){if(g.employees.length>=g.staffCap)return toastMsg('員工已達上限');let r=roleDef(role),cost=r[3]*2;if(g.money<cost)return toastMsg('資金不足');g.money-=cost;let name=employeeNames[Math.floor(Math.random()*employeeNames.length)];let traits=['熱情','效率王','細心','親和','耐操','學習快'];
let trait=traits[Math.floor(Math.random()*traits.length)];
g.employees.push({id:Date.now()+Math.random(),name,role,lv:1,xp:0,salary:r[3],status:'工作中',shift:'早班',mood:90,fatigue:10,rank:'一般',trait,skill:50+Math.floor(Math.random()*21),service:50+Math.floor(Math.random()*21)});push(`${r[2]} ${name} 加入團隊`);save()}
function trainEmployee(id){let e=g.employees.find(x=>x.id===id);if(!e)return;let cost=900*e.lv;if(g.money<cost)return toastMsg('培訓資金不足');g.money-=cost;e.xp+=60;if(e.xp>=100){e.xp-=100;e.lv++;e.salary=Math.round(e.salary*1.08);g.prestige+=2;push(`🎓 ${e.name} 升到 Lv.${e.lv}`)}save()}
function fireEmployee(id){let e=g.employees.find(x=>x.id===id);if(!e)return;g.employees=g.employees.filter(x=>x.id!==id);push(`👋 ${e.name} 已離職`);save()}
function upgradeStaffCap(){let cost=5000*(g.staffCapLv+1);if(g.money<cost)return toastMsg('資金不足');g.money-=cost;g.staffCapLv++;g.staffCap+=5;push(`👥 員工上限提升至 ${g.staffCap} 人`);save()}
function buyFacility(id){
 let f=facilities.find(x=>x[0]===id);if(!f||g.facilities[id])return;
 if(g.money<f[3])return toastMsg('資金不足');
 g.money-=f[3];g.facilities[id]=1;g.prestige+=4;
 if(id==='shower')g.rating=Math.min(5,g.rating+.12);
 if(id==='lounge')g.rating=Math.min(5,g.rating+.06);
 push(`${f[2]} ${f[1]} 建設完成！`);
 save();toastMsg(`${f[1]} 已啟用`);
}
function playerLeagueScore(){
 return Math.round(g.prestige*3+g.members+g.rating*20+g.level*15+g.branches*20+totalMachines()*3);
}
function leagueTable(){
 let growth=Math.max(0,g.leagueWeek-1)*12;
 let rows=rivals.map((r,i)=>({name:r.name,icon:r.icon,score:r.base+growth+i*5}));
 rows.push({name:'我的 GYM',icon:'🏆',score:playerLeagueScore(),me:true});
 return rows.sort((a,b)=>b.score-a.score);
}
function weeklyStaffAward(){let a=activeEmployees();if(!a.length)return;let best=[...a].sort((x,y)=>(y.lv*10+y.skill+y.service+y.mood)-(x.lv*10+x.skill+x.service+x.mood))[0];best.mood=Math.min(100,best.mood+12);best.xp+=20;g.prestige+=2;push(`🏅 本週最佳員工：${best.name}（${best.rank} ${roleDef(best.role)[1]}）`)}
function runLeague(){weeklyStaffAward();
 let table=leagueTable(),rank=table.findIndex(x=>x.me)+1;
 g.lastRank=rank;g.lastLeagueDay=g.day;g.leagueWeek++;
 let reward=[7000,4000,2200,800][rank-1]||800;
 let fame=[18,10,6,2][rank-1]||2;
 g.money+=reward;g.prestige+=fame;
 if(rank===1)g.rivalWins++;
 push(`🏁 聯盟週賽結算：第 ${rank} 名，獲得 ${fmt(reward)}＋${fame} 聲望！`);
}
function openBranch(){let cost=50000*g.branches;if(g.level<4)return toastMsg('主館需達 Lv.4');if(g.money<cost)return toastMsg('資金不足');g.money-=cost;g.branches++;g.prestige+=25;g.members+=25;push(`🏙️ 第 ${g.branches} 間分店正式開幕！`);save();toastMsg('新分店開幕！')}
function upgrade(){let cost=g.level*10000;if(g.money<cost)return toastMsg('資金不足');g.money-=cost;g.level++;g.rating=Math.min(5,g.rating+.18);g.prestige+=10;push(`🚀 擴建完成！健身房升級到 Lv.${g.level}`);save();toastMsg('擴建完成！')}
function claim(id){let q=quests.find(x=>x.id===id);if(!q||g.claimed[id]||!q.ok(g))return;g.claimed[id]=1;g.money+=q.reward;g.prestige+=5;push(`🎁 完成任務「${q.name}」，獲得 ${fmt(q.reward)}`);save();toastMsg('任務獎勵已領取')}
function resetGame(){if(confirm('確定重新開始？目前進度會清除。')){g=fresh();localStorage.removeItem(OLDKEY);save()}}
function render(){ $('money').textContent=fmt(g.money);$('members').textContent=g.members;$('rating').textContent=g.rating.toFixed(1);$('prestige').textContent=g.prestige;$('day').textContent=g.day;$('clock').textContent=String(g.hour).padStart(2,'0')+':00';$('daybar').style.width=((g.hour-8)/14*100)+'%';$('incomeText').textContent=`今日收入 ${fmt(g.todayIncome)}`;$('hourlyText').textContent=fmt(hourly());$('levelText').textContent=`${g.level<3?'街角小型健身房':g.level<5?'人氣健身中心':'城市旗艦健身房'} · Lv.${g.level}`;$('sceneStatus').textContent=`容量 ${capacity()} 人 · ${totalMachines()} 台設備 · ${Object.keys(g.facilities||{}).filter(k=>g.facilities[k]).length} 項設施 · 月費 ${fmt(g.fee)}`;
 $('events').innerHTML=g.events.map(x=>`<div class="card event">${x}</div>`).join('');
 $('machineList').innerHTML=machines.map(m=>{let c=g.machines[m[0]]||0,cost=Math.round(m[3]*(1+c*.35));return `<div class="card machine"><span class="badge">持有 ${c}</span><div class="ico">${m[2]}</div><h3>${m[1]}</h3><p>減少排隊並提升每位會員的消費能力。</p><button class="buy" onclick="buyMachine('${m[0]}')">購買 ${fmt(cost)}</button><button class="secondary" style="width:100%;margin-top:6px" onclick="upgradeMachine('${m[0]}')">升級 Lv.${(g.machineLv[m[0]]||0)+1} → ${(g.machineLv[m[0]]||0)+2}</button></div>`}).join('');
 $('staffList').innerHTML=staffs.map(s=>`<div class="card machine"><span class="badge">${g.staff[s[0]]?'已聘用':'未聘用'}</span><div class="ico">${s[2]}</div><h3>${s[1]}</h3><p>${s[4]}</p><button class="buy" ${g.staff[s[0]]?'disabled':''} onclick="hire('${s[0]}')">${g.staff[s[0]]?'已聘用':'聘用 '+fmt(s[3])}</button></div>`).join('');
 let cost=g.level*10000;$('upgradeList').innerHTML=`<div class="card"><h3>🏢 擴建 Lv.${g.level} → Lv.${g.level+1}</h3><p class="muted">增加 20 人容量、提高評價並獲得 10 聲望。</p><button class="buy" onclick="upgrade()">擴建 ${fmt(cost)}</button></div><div class="card" style="margin-top:10px"><h3>🏙️ 連鎖分店</h3><p class="muted">目前 ${g.branches} 間店。主館 Lv.4 後可開新分店，每間分店增加會員與聲望。</p><button class="buy" onclick="openBranch()">開設第 ${g.branches+1} 間店 ${fmt(50000*g.branches)}</button></div>`;
 if($('facilityList'))$('facilityList').innerHTML=facilities.map(f=>`<div class="card facilityCard"><div class="row"><div><div class="ico smallIco">${f[2]}</div><b>${f[1]}</b></div><span class="badge">${g.facilities?.[f[0]]?'已建設':'未建設'}</span></div><p class="muted">${f[4]}</p><button class="buy" ${g.facilities?.[f[0]]?'disabled':''} onclick="buyFacility('${f[0]}')">${g.facilities?.[f[0]]?'已啟用':'建設 '+fmt(f[3])}</button></div>`).join('');
 if($('leaguePanel')){let table=leagueTable(),rank=table.findIndex(x=>x.me)+1;$('leaguePanel').innerHTML=`<div class="card leagueHero"><div class="row"><div><small class="muted">健身房聯盟 · 第 ${g.leagueWeek} 週</small><h3 style="margin:4px 0">目前預測第 ${rank} 名</h3></div><div class="rankBadge">#${rank}</div></div><div class="muted">每 7 個營業日自動結算。排名越高，獎金與聲望越多。</div></div>`+table.map((r,i)=>`<div class="card rivalRow ${r.me?'me':''}"><b>${i+1}. ${r.icon} ${r.name}</b><span>${r.score} 分</span></div>`).join('')+`<div class="card" style="margin-top:8px"><div class="row"><span class="muted">聯盟冠軍次數</span><b>${g.rivalWins}</b></div></div>`;}
 ensureLifeMembers();if($('lifeMemberList')){$('memberLifeStats').innerHTML=`<div><b>${g.lifeMembers.length}</b><small>人物</small></div><div><b>${g.memberReviews}</b><small>評論</small></div><div><b>${g.referrals}</b><small>推薦</small></div><div><b>${g.memberChallenges}</b><small>挑戰</small></div>`;$('lifeMemberList').innerHTML=[...g.lifeMembers].sort((a,b)=>memberScore(b)-memberScore(a)).map((m,i)=>`<div class="card memberLife"><div class="memberAvatar">${bodyStage(m)}${m.vip?'<i>VIP</i>':''}</div><div><div class="row"><b>${i<3?['🥇','🥈','🥉'][i]+' ':''}${m.name}</b><span class="badge">${m.goal}</span></div><div class="muted">${m.age}歲 · ${m.job} · 入會 ${m.days} 天 · 消費 ${fmt(m.spent)}</div><div class="memberMeters"><span>成長 ${m.progress}%</span><span>❤️ ${m.satisfaction}</span><span>⭐ ${m.loyalty}</span></div><div class="progress"><i style="width:${m.progress}%"></i></div>${m.review?`<div class="review">📱 ${'★'.repeat(m.review)}${'☆'.repeat(5-m.review)}</div>`:''}</div></div>`).join('');}if($('employeePanel')){$('employeeCount').textContent=`${g.employees.length} / ${g.staffCap}`;if($('tiredCount'))$('tiredCount').textContent=g.employees.filter(e=>e.fatigue>=75).length;$('employeeList').innerHTML=g.employees.length?g.employees.map(e=>{let r=roleDef(e.role);return `<div class="card emp"><div class="empAvatar">${r[2]}</div><div><div class="row"><b>${e.name} · Lv.${e.lv}</b><span class="${e.shift==='休假'?'badge':'working'}">${e.rank} · ${e.status}</span></div><div class="muted">${r[1]} · ${e.trait} · 月薪 ${fmt(e.salary)}</div><div class="abilityRow"><span>專業 ${e.skill}</span><span>服務 ${e.service}</span><span>心情 ${e.mood}</span><span>疲勞 ${e.fatigue}</span></div><div class="progress empProg"><i style="width:${e.xp}%"></i></div><div class="shiftBtns"><button onclick="setShift(${e.id},'早班')" class="${e.shift==='早班'?'selected':''}">早班</button><button onclick="setShift(${e.id},'晚班')" class="${e.shift==='晚班'?'selected':''}">晚班</button><button onclick="setShift(${e.id},'休假')" class="${e.shift==='休假'?'selected':''}">休假</button></div><div class="empBtns"><button onclick="trainEmployee(${e.id})">培訓</button><button onclick="promoteEmployee(${e.id})">升遷</button><button class="fire" onclick="fireEmployee(${e.id})">解雇</button></div></div></div>`}).join(''):'<div class="card muted">目前尚未聘請新員工。</div>';$('hireList').innerHTML=employeeRoles.map(r=>`<div class="card hireCard"><div class="row"><b>${r[2]} ${r[1]}</b><span class="badge">現有 ${roleCount(r[0])}</span></div><div class="muted">${r[4]}</div><button class="buy" onclick="hireEmployee('${r[0]}')">聘請 ${fmt(r[3]*2)}</button></div>`).join('');$('staffCapBtn').textContent=`提升上限 ${fmt(5000*(g.staffCapLv+1))}`;} $('feeSlider').value=g.fee;$('feeText').textContent=fmt(g.fee);
 $('questList').innerHTML=quests.map(q=>{let done=q.ok(g),claimed=g.claimed[q.id];return `<div class="card quest ${done?'done':''}"><div><h4>${done?'✅':'🎯'} ${q.name}</h4><div class="muted">${q.desc}</div><div class="reward">獎勵 ${fmt(q.reward)}</div></div><button class="secondary" ${!done||claimed?'disabled':''} onclick="claim('${q.id}')">${claimed?'已領取':done?'領取':'進行中'}</button></div>`}).join('');
 $('totalRevenue').textContent=fmt(g.totalRevenue);$('served').textContent=g.served.toLocaleString();$('bestDay').textContent=fmt(g.bestDay);if($('memberRoster')){$('coachLv').textContent='Lv.'+(1+Math.floor(g.coachXP/120));$('coachXp').style.width=(g.coachXP%120)/120*100+'%';$('memberRoster').innerHTML=g.vipMembers.length?g.vipMembers.map(v=>{let body=v.lv>=5?'💪':v.lv>=3?'🏃':'🙂';return `<div class="card vip"><div class="avatar">${body}</div><div><div class="row"><b>${v.name} · Lv.${v.lv}</b><span class="badge">${v.job||'會員'}</span></div><div class="muted">目標：${v.goal} · 體態階段 ${v.lv>=5?'進階':v.lv>=3?'成長':'起步'}</div><div class="progress memberProg"><i style="width:${v.progress}%"></i></div></div></div>`}).join(''):'<div class="card muted">繼續營業，常客會員會逐漸出現。</div>'}renderScene()}
render();
if('serviceWorker' in navigator){
 window.addEventListener('load',async()=>{
  try{
   const reg=await navigator.serviceWorker.register('./sw.js?v=170',{updateViaCache:'none'});
   await reg.update();
   let refreshing=false;
   navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing)return;
    refreshing=true;
    location.reload();
   });
  }catch(e){}
 });
}
