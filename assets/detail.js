(function(){
'use strict';
const root=document.getElementById('detailRoot');
const params=new URLSearchParams(location.search);const id=params.get('id')||'';
const rows=GJ.dataset();const r=rows.find(x=>String(x.연번)===String(id));
if(!r){root.innerHTML='<div class="detail-error"><h1>기관 정보를 찾지 못했습니다.</h1><p>지도에서 세부정보 버튼을 다시 눌러 주세요.</p><div class="detail-buttons"><button class="detail-button close" type="button" onclick="window.close()">창 닫기</button></div></div>';return;}
document.title=`${r.기관명} · 세부정보`;
const services=GJ.SERVICES.filter(s=>r[s]).map(GJ.badge).join('');
const intro=r.기관소개?GJ.esc(r.기관소개):'<span class="detail-empty">등록된 기관소개가 없습니다.</span>';
const business=r.사업소개?GJ.esc(r.사업소개):'<span class="detail-empty">등록된 사업소개가 없습니다.</span>';
const homepage=r.홈페이지?`<span class="homepage-url">${GJ.esc(r.홈페이지)}</span><a class="detail-button primary" href="${GJ.esc(r.홈페이지)}" target="_blank" rel="noopener noreferrer">기관 홈페이지 바로가기</a>`:'<span class="detail-empty">등록된 홈페이지가 없습니다.</span>';
const directions=`https://map.kakao.com/link/to/${encodeURIComponent(r.기관명)},${r.위도},${r.경도}`;
root.innerHTML=`<header class="detail-header"><h1>${GJ.esc(r.기관명)}</h1><div class="detail-sub"><span>${GJ.esc(r.이용구분||'이용구분 미등록')}</span><span>${GJ.esc(r.행정동||r.자치구||'지역정보 미등록')}</span></div><div class="detail-services">${services}</div></header><div class="detail-body"><section class="detail-section"><h2>기관소개</h2><p class="detail-text">${intro}</p></section><section class="detail-section"><h2>사업소개</h2><p class="detail-text">${business}</p></section><section class="detail-section"><h2>이용정보</h2><dl class="info-grid"><dt>주소</dt><dd>${GJ.esc(r.주소||'-')}</dd><dt>연락처</dt><dd>${GJ.esc(r.연락처||'-')}</dd><dt>이용대상</dt><dd>${GJ.esc(r.이용대상||'-')}</dd><dt>신청방법</dt><dd>${GJ.esc(r.신청방법||'-')}</dd></dl></section><section class="detail-section"><h2>홈페이지</h2>${homepage}<div class="detail-buttons"><a class="detail-button" href="${directions}" target="_blank" rel="noopener noreferrer">카카오맵 길찾기</a><button class="detail-button close" type="button" id="closeDetail">창 닫기</button></div></section></div>`;
document.getElementById('closeDetail').addEventListener('click',()=>window.close());
})();
