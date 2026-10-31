const $=id=>document.getElementById(id), weekdays=['日','月','火','水','木','金','土'];
const today=new Date();let year=today.getFullYear(),month=today.getMonth()+1;
const key=(y,m)=>`myshift:v1:${y}-${String(m).padStart(2,'0')}`;
const safeParse=(v,fallback)=>{try{return JSON.parse(v)??fallback}catch{return fallback}};
let shifts=safeParse(localStorage.getItem(key(year,month)),{});
let presets=safeParse(localStorage.getItem('myshift:presets'),[['09:00','18:00'],['10:00','17:00'],['13:00','18:00']]);
let selected=new Set();
function persist(){localStorage.setItem(key(year,month),JSON.stringify(shifts))}
function dateLabel(d){return `${d}(${weekdays[new Date(year,month-1,d).getDay()]})`}
function time(t){return t.replace(/^0/,'')}
function valid(s,e){return /^\d{2}:\d{2}$/.test(s)&&/^\d{2}:\d{2}$/.test(e)&&s<e}
function render(){const days=new Date(year,month,0).getDate(),offset=new Date(year,month-1,1).getDay();$('monthLabel').textContent=`${year}年${month}月`;
const cal=$('calendar');cal.replaceChildren();weekdays.forEach((w,i)=>{const el=document.createElement('div');el.className='weekday';el.textContent=w;cal.append(el)});
for(let i=0;i<offset;i++)cal.append(document.createElement('div'));
for(let d=1;d<=days;d++){const b=document.createElement('button');b.className=`day ${selected.has(d)?'selected':''} ${new Date(year,month-1,d).getDay()===0?'sun':''} ${new Date(year,month-1,d).getDay()===6?'sat':''}`;const n=document.createElement('span');n.textContent=d;b.append(n);if(shifts[d]){const t=document.createElement('em');t.textContent=`${time(shifts[d][0])}~${time(shifts[d][1])}`;b.append(t)}b.onclick=()=>{if(selected.has(d))selected.delete(d);else selected.add(d);render()};cal.append(b)}
$('selectedCount').textContent=`${selected.size}日選択中`;const entries=Object.entries(shifts).filter(([d])=>Number(d)<=days).sort((a,b)=>Number(a[0])-Number(b[0]));$('shiftCount').textContent=`(${entries.length}日)`;const list=$('shiftList');list.replaceChildren();if(!entries.length){const p=document.createElement('p');p.className='empty';p.textContent='勤務日がまだ登録されていません。';list.append(p)}
entries.forEach(([d,t])=>{const row=document.createElement('div');row.className='shiftrow';const info=document.createElement('span');info.textContent=`${dateLabel(Number(d))}　${time(t[0])}~${time(t[1])}`;const del=document.createElement('button');del.textContent='削除';del.onclick=()=>{delete shifts[d];selected.delete(Number(d));persist();render()};row.append(info,del);list.append(row)});
$('preview').value=`お疲れ様です。\n${month}月のシフトです。\n\n${entries.map(([d,t])=>`${dateLabel(Number(d))}${time(t[0])}~${time(t[1])}`).join('\n')}\n\n以上、よろしくお願いします。`;
const ps=$('presets');ps.replaceChildren();presets.forEach(([s,e])=>{const b=document.createElement('button');b.className='preset';b.textContent=`${time(s)}~${time(e)}`;b.onclick=()=>{$('start').value=s;$('end').value=e};ps.append(b)})}
function changeMonth(delta){const d=new Date(year,month-1+delta,1);year=d.getFullYear();month=d.getMonth()+1;shifts=safeParse(localStorage.getItem(key(year,month)),{});selected.clear();render()}
$('prev').onclick=()=>changeMonth(-1);$('next').onclick=()=>changeMonth(1);$('clear').onclick=()=>{selected.clear();render()};
$('apply').onclick=()=>{if(!selected.size){alert('まずカレンダーで日付を選択してください。');return}const s=$('start').value,e=$('end').value;if(!valid(s,e)){alert('退勤時間は出勤時間より後に設定してください。');return}selected.forEach(d=>shifts[d]=[s,e]);selected.clear();persist();render()};
$('savePreset').onclick=()=>{const s=$('start').value,e=$('end').value;if(!valid(s,e)){alert('勤務時間を確認してください。');return}if(!presets.some(p=>p[0]===s&&p[1]===e))presets.push([s,e]);localStorage.setItem('myshift:presets',JSON.stringify(presets));render()};
async function copyText(){try{await navigator.clipboard.writeText($('preview').value);alert('文章をコピーしました！')}catch{const t=$('preview');t.focus();t.select();alert('文章を選択しました。コピーしてLINEに貼り付けてください。')}}
$('copy').onclick=copyText;
$('share').onclick=async()=>{const text=$('preview').value;if(navigator.share){try{await navigator.share({text})}catch(e){if(e.name!=='AbortError')await copyText()}}else{await copyText();alert('LINEに貼り付けてください。')}};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();
