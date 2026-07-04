(function(){
'use strict';
const SERVICES=['상담','돌봄','교육','위기','활동'];
const COLORS={상담:'#4E79A7',돌봄:'#59A14F',교육:'#F28E2B',위기:'#E15759',활동:'#B07AA1'};
const DONGS=['중곡1동','중곡2동','중곡3동','중곡4동','능동','구의1동','구의2동','구의3동','광장동','자양1동','자양2동','자양3동','자양4동','화양동','군자동'];
const CFG=window.GWANGJIN_MAP_CONFIG||{};
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function n(v){const x=Number(String(v??'').replace(/,/g,''));return Number.isFinite(x)?x:null;}
function truth(v){return v===1||v==='1'||v===true||String(v).toLowerCase()==='true'||String(v).trim()==='예';}
function normDong(v){
 let s=String(v??'').trim().replace(/제/g,'').replace(/\s+/g,'');
 const gwangjinMatch=s.match(/광진구(중곡[1-4]동|능동|구의[1-3]동|광장동|자양[1-4]동|화양동|군자동)/);
 if(gwangjinMatch)return gwangjinMatch[1];
 const dongMatch=s.match(/(중곡[1-4]동|능동|구의[1-3]동|광장동|자양[1-4]동|화양동|군자동)$/);
 if(dongMatch)return dongMatch[1];
 return s;
}
function normalizeInstitution(x){const r={
 연번:x.연번??x.id??'',기관명:String(x.기관명??x.name??'').trim(),영역:String(x['영역(분류)']??x.영역??x.categories??'').trim(),이용구분:String(x.이용구분??x.usage??'').trim(),자치구:String(x.자치구??x.district??'').trim(),행정동:normDong(x.행정동??x.dong??''),주소:String(x.주소??x.address??'').trim(),위도:n(x.위도??x.lat),경도:n(x.경도??x.lng??x.lon),좌표등급:String(x.좌표등급??x.좌표상태??'').trim(),연락처:String(x.연락처??x.phone??'').trim(),기관소개:String(x.기관소개??x.introduction??'').trim(),사업소개:String(x.사업소개??x.businessIntroduction??x.programs??'').trim(),홈페이지:String(x['홈페이지 주소']??x.홈페이지??x.website??'').trim(),이용대상:String(x.이용대상??x.target??'').trim(),신청방법:String(x.신청방법??x.apply??'').trim(),권역:String(x.권역??x.zone??'').trim(),마커유형:String(x.마커유형??'').trim()
 };
 SERVICES.forEach(s=>r[s]=truth(x[s])||r.영역.split(/[,/·]/).map(t=>t.trim()).includes(s));
 if(!r.권역)r.권역=r.자치구==='광진구'?'광진구내':'외부연계';
 r.학교여부=/(초등학교|중학교|고등학교|대학교|학교\)|학교$|학교\s)/.test(r.기관명);
 return r;
}
function dataset(){return (window.GWANGJIN_INSTITUTIONS||[]).map(normalizeInstitution).filter(r=>r.기관명&&r.위도!==null&&r.경도!==null);}
function baseAddress(address){let s=String(address||'').replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ').trim();s=s.replace(/\s+(지하|지상)?\d+\s*층.*$/,'').replace(/\s+\d+\s*호.*$/,'').replace(/\s+(내|후관동|본관|별관).*$/,'');const m=s.match(/^(.*?(?:로|길)\s*\d+(?:-\d+)?)/);return (m?m[1]:s).trim();}
function buildingKey(r){const b=baseAddress(r.주소);return b?`A:${b}`:`C:${r.위도.toFixed(5)},${r.경도.toFixed(5)}`;}
function groupBuildings(rows){const m=new Map();rows.forEach(r=>{const k=buildingKey(r);if(!m.has(k))m.set(k,{key:k,address:baseAddress(r.주소)||r.주소,lat:r.위도,lng:r.경도,items:[]});m.get(k).items.push(r)});return [...m.values()].map(g=>{g.services=SERVICES.filter(s=>g.items.some(r=>r[s]));g.crisis=g.items.some(r=>r.위기);return g});}
function serviceColor(group){const order=['위기','상담','돌봄','교육','활동'];const s=order.find(x=>group.items.some(r=>r[x]))||'교육';return COLORS[s];}
function markerSvg(group){const color=serviceColor(group),multi=group.items.length>1,linked=group.items.every(r=>r.이용구분==='연계이용'),crisis=group.crisis;
 let shape;if(multi){shape=`<rect x="5" y="5" width="34" height="34" rx="10" fill="${color}" stroke="${crisis?'#b91c1c':'#fff'}" stroke-width="${crisis?4:3}"/><text x="22" y="28" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#fff">${group.items.length}</text>`}
 else if(linked){shape=`<rect x="9" y="9" width="26" height="26" rx="4" transform="rotate(45 22 22)" fill="#fff" stroke="${crisis?'#b91c1c':color}" stroke-width="${crisis?4:3}"/><circle cx="22" cy="22" r="5" fill="${color}"/>`}
 else{shape=`<circle cx="22" cy="22" r="15" fill="${color}" stroke="${crisis?'#b91c1c':'#fff'}" stroke-width="${crisis?4:3}"/><circle cx="22" cy="22" r="5" fill="#fff"/>`}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">${shape}</svg>`;return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function badge(s){return `<span class="badge" style="background:${COLORS[s]}">${esc(s)}</span>`;}
function detailPageUrl(r){return `institution_detail.html?id=${encodeURIComponent(String(r.연번??''))}`;}
function overlayHtml(group,id){const cards=group.items.map((r,i)=>`<details class="inst-card" ${group.items.length===1?'open':''}><summary>${i+1}. ${esc(r.기관명)} <em>${esc(r.이용구분)}</em></summary><div class="badges">${SERVICES.filter(s=>r[s]).map(badge).join('')}</div><div class="detail"><b>주소</b> ${esc(r.주소)}<br>${r.연락처?`<b>연락처</b> ${esc(r.연락처)}<br>`:''}${r.이용대상?`<b>이용대상</b> ${esc(r.이용대상)}<br>`:''}${r.신청방법?`<b>신청방법</b> ${esc(r.신청방법)}<br>`:''}<div class="detail-actions"><a class="action-link" href="https://map.kakao.com/link/to/${encodeURIComponent(r.기관명)},${r.위도},${r.경도}" target="_blank" rel="noopener noreferrer">카카오맵 길찾기</a><button type="button" class="action-link detail-open" data-detail-id="${esc(r.연번)}">세부정보</button></div></div></details>`).join('');return `<div class="overlay"><div class="overlay-head"><h3>${esc(group.address)}<br><small>${group.items.length}개 기관 · ${group.services.map(esc).join(' · ')}</small></h3><button class="overlay-close" data-overlay-close="${id}" aria-label="닫기">×</button></div><div class="overlay-body">${cards}</div></div>`;}
function openInstitutionDetail(id){const url=`institution_detail.html?id=${encodeURIComponent(String(id??''))}`;const w=window.open(url,'institutionDetail','width=760,height=840,scrollbars=yes,resizable=yes');if(!w)window.location.href=url;}
function loadKakao(){return new Promise((resolve,reject)=>{if(window.kakao?.maps){window.kakao.maps.load(resolve);return;}const key=String(CFG.kakaoJavaScriptKey||'').trim();if(!key||/YOUR_|입력|발급/.test(key)){reject(new Error('config.js에 카카오 JavaScript 키를 입력해야 합니다.'));return;}const s=document.createElement('script');s.src=`https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${encodeURIComponent(key)}&libraries=clusterer`;s.onload=()=>window.kakao.maps.load(resolve);s.onerror=()=>reject(new Error('카카오 지도 SDK를 불러오지 못했습니다. 도메인 등록과 인터넷 연결을 확인하세요.'));document.head.appendChild(s);});}
function mapBounds(groups){if(!groups.length)return null;const b=new kakao.maps.LatLngBounds();groups.forEach(g=>b.extend(new kakao.maps.LatLng(g.lat,g.lng)));return b;}
function addMapControls(map){map.addControl(new kakao.maps.MapTypeControl(),kakao.maps.ControlPosition.TOPRIGHT);map.addControl(new kakao.maps.ZoomControl(),kakao.maps.ControlPosition.RIGHT);}
function createMarkerManager(map){let markers=[],clusterer=null,overlay=null,overlayId=0;function clear(){if(clusterer)clusterer.clear();markers.forEach(m=>m.setMap(null));markers=[];if(overlay){overlay.setMap(null);overlay=null;}}
 function closeOverlay(){if(overlay){overlay.setMap(null);overlay=null;}}
 function render(groups,{fit=true,onOpen=null}={}){clear();clusterer=new kakao.maps.MarkerClusterer({map,averageCenter:true,minLevel:7,disableClickZoom:false,styles:[{width:'44px',height:'44px',background:'rgba(23,54,93,.92)',borderRadius:'22px',color:'#fff',textAlign:'center',fontWeight:'700',lineHeight:'44px',border:'3px solid rgba(255,255,255,.9)'}]});markers=groups.map(g=>{const marker=new kakao.maps.Marker({position:new kakao.maps.LatLng(g.lat,g.lng),image:new kakao.maps.MarkerImage(markerSvg(g),new kakao.maps.Size(44,44),{offset:new kakao.maps.Point(22,22)}),title:g.items.map(r=>r.기관명).join(', ')});kakao.maps.event.addListener(marker,'click',()=>{closeOverlay();const id=`ov-${++overlayId}`,node=document.createElement('div');node.innerHTML=overlayHtml(g,id);const content=node.firstElementChild;content.querySelector('[data-overlay-close]').addEventListener('click',closeOverlay);content.querySelectorAll('[data-detail-id]').forEach(btn=>btn.addEventListener('click',()=>openInstitutionDetail(btn.dataset.detailId)));overlay=new kakao.maps.CustomOverlay({position:marker.getPosition(),content,yAnchor:1.08,zIndex:20});overlay.setMap(map);if(onOpen)onOpen(g);});marker.__group=g;return marker});clusterer.addMarkers(markers);if(fit&&groups.length){const b=mapBounds(groups);if(groups.length===1){map.setCenter(new kakao.maps.LatLng(groups[0].lat,groups[0].lng));map.setLevel(4)}else map.setBounds(b,60,60,60,60)}return markers;}
 function openGroup(key){const m=markers.find(x=>x.__group?.key===key);if(m)kakao.maps.event.trigger(m,'click');}
 return{render,clear,closeOverlay,openGroup,getMarkers:()=>markers};}
function haversine(a,b,c,d){const R=6371000,p=Math.PI/180,x=(c-a)*p,y=(d-b)*p,q=Math.sin(x/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));}
function csvCell(v){const s=String(v??'');return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function rowsCsv(rows,headers){return '\ufeff'+[headers.join(','),...rows.map(r=>headers.map(h=>csvCell(r[h])).join(','))].join('\n');}
function download(name,text,type='text/csv;charset=utf-8'){const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function normalizeBoundary(fc){if(!fc?.features)return{type:'FeatureCollection',features:[]};const names=new Set(DONGS);const features=fc.features.filter(f=>{const p=f.properties||{};const n=normDong(p.adm_nm||p.adm_name||p.name||p.EMD_KOR_NM||p.adm_cd2||'');const full=String(p.adm_nm||p.adm_name||p.name||'');return names.has(n)&&(full.includes('광진구')||!full.includes('구 '));}).map(f=>({...f,properties:{...f.properties,__dong:normDong(f.properties?.adm_nm||f.properties?.adm_name||f.properties?.name||f.properties?.EMD_KOR_NM||'')}}));return{type:'FeatureCollection',features};}
async function loadBoundary(){if(window.GWANGJIN_BOUNDARY?.features)return normalizeBoundary(window.GWANGJIN_BOUNDARY);const url=CFG.boundaryUrl||'https://raw.githubusercontent.com/raqoon886/Local_HangJeongDong/master/hangjeongdong_%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C.geojson';const r=await fetch(url);if(!r.ok)throw new Error(`행정동 경계 HTTP ${r.status}`);return normalizeBoundary(await r.json());}
function geomPaths(geom){const cv=ring=>ring.map(([lng,lat])=>new kakao.maps.LatLng(lat,lng));if(geom.type==='Polygon')return[geom.coordinates.map(cv)];if(geom.type==='MultiPolygon')return geom.coordinates.map(poly=>poly.map(cv));return[];}
function pointInRing(lng,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1],inter=((yi>lat)!=(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi+1e-15)+xi);if(inter)inside=!inside;}return inside;}
function pointInGeom(lng,lat,geom){const inPoly=poly=>pointInRing(lng,lat,poly[0])&&!poly.slice(1).some(h=>pointInRing(lng,lat,h));return geom.type==='Polygon'?inPoly(geom.coordinates):geom.type==='MultiPolygon'?geom.coordinates.some(inPoly):false;}
function renderBoundary(map,fc,{fillByDong=()=> '#eef2f6',fillOpacity=.28,strokeColor='#687f90',strokeWeight=1.5,onClick=null,onHover=null}={}){const polys=[];(fc?.features||[]).forEach(f=>{geomPaths(f.geometry).forEach(paths=>{const p=new kakao.maps.Polygon({map,path:paths,strokeWeight,strokeColor,strokeOpacity:.9,fillColor:fillByDong(f.properties.__dong,f),fillOpacity});p.__feature=f;if(onClick)kakao.maps.event.addListener(p,'click',()=>onClick(f,p));if(onHover){kakao.maps.event.addListener(p,'mouseover',()=>onHover(true,f,p));kakao.maps.event.addListener(p,'mouseout',()=>onHover(false,f,p));}polys.push(p);});});return polys;}
function clearOverlays(arr){(arr||[]).forEach(x=>x.setMap&&x.setMap(null));}
function dataMeta(){return window.GWANGJIN_DATA_META||{count:dataset().length,version:CFG.dataVersion||''};}
window.GJ={SERVICES,COLORS,DONGS,CFG,esc,n,truth,normDong,normalizeInstitution,dataset,baseAddress,buildingKey,groupBuildings,serviceColor,badge,detailPageUrl,openInstitutionDetail,loadKakao,addMapControls,createMarkerManager,haversine,rowsCsv,download,loadBoundary,renderBoundary,clearOverlays,pointInGeom,dataMeta};
})();
