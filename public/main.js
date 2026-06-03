
// ── 사주 계산 ──
var ST=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var BR=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var STk=['갑','을','병','정','무','기','경','신','임','계'];
var BRk=['자','축','인','묘','진','사','오','미','신','유','술','해'];

function ySB(y){var s=((y-4)%10+10)%10,b=((y-4)%12+12)%12;return{s:ST[s],b:BR[b],sk:STk[s],bk:BRk[b]};}
function mSB(y,m){var base=(y-1900)*12+(m-1);var s=(base+2)%10,b=(m+1)%12;return{s:ST[(s+10)%10],b:BR[b],sk:STk[(s+10)%10],bk:BRk[b]};}
function dSB(date){var base=Math.floor((date-new Date(1900,0,1))/86400000)+10;var s=((base%10)+10)%10,b=((base%12)+12)%12;return{s:ST[s],b:BR[b],sk:STk[s],bk:BRk[b]};}
var HIDX={'자시(23~01시)':0,'축시(01~03시)':1,'인시(03~05시)':2,'묘시(05~07시)':3,'진시(07~09시)':4,'사시(09~11시)':5,'오시(11~13시)':6,'미시(13~15시)':7,'신시(15~17시)':8,'유시(17~19시)':9,'술시(19~21시)':10,'해시(21~23시)':11};
function hSB(ds,tv){if(tv==='모름')return null;var bi=HIDX[tv]||0,di=ST.indexOf(ds),si=((di%5)*2+10)%10;return{s:ST[(si+bi)%10],b:BR[bi],sk:STk[(si+bi)%10],bk:BRk[bi]};}

function calcOheng(ysb,msb,dsb,hsb){
  var map={'甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수','子':'수','丑':'토','寅':'목','卯':'목','辰':'토','巳':'화','午':'화','未':'토','申':'금','酉':'금','戌':'토','亥':'수'};
  var cnt={목:0,화:0,토:0,금:0,수:0};
  [ysb,msb,dsb,hsb].forEach(function(sb){if(!sb)return;cnt[map[sb.s]||'토']=(cnt[map[sb.s]||'토']||0)+1;cnt[map[sb.b]||'토']=(cnt[map[sb.b]||'토']||0)+1;});
  var total=Object.values(cnt).reduce(function(a,b){return a+b;},0)||1;
  var r={};Object.keys(cnt).forEach(function(k){r[k]=Math.round(cnt[k]/total*100);});
  return r;
}

// ── 상태 ──
var lastData=null;
var historyList=[];

// ── 태그 토글 ──
document.querySelectorAll('.tag').forEach(function(t){
  t.addEventListener('click',function(){t.classList.toggle('on');});
});

// ── 히스토리 버튼 ──
document.getElementById('navHistory').addEventListener('click', showHistory);
document.getElementById('navNew').addEventListener('click', function(){location.reload();});

// ── setStep ──
function setStep(n){
  for(var i=1;i<=4;i++){
    var el=document.getElementById('step'+i);
    el.className='step'+(i<n?' done':i===n?' active':'');
  }
}

// ── 메인 생성 ──
async function generate(){
  var name=document.getElementById('name').value.trim()||'의뢰인';
  var gender=document.getElementById('gender').value;
  var birth=document.getElementById('birth').value;
  var btime=document.getElementById('btime').value;
  var memo=document.getElementById('memo').value.trim();
  if(!birth){alert('생년월일을 입력해 주세요.');return;}
  var concerns=Array.from(document.querySelectorAll('.tag.on')).map(function(t){return t.dataset.v;});
  if(!concerns.length){alert('관심 분야를 선택해 주세요.');return;}

  var bd=new Date(birth);
  var y=bd.getFullYear(),m=bd.getMonth()+1,d=bd.getDate();
  var ysb=ySB(y),msb=mSB(y,m),dsb=dSB(bd),hsb=hSB(dsb.s,btime);
  var sajuStr=hsb
    ?'연주 '+ysb.s+ysb.b+'('+ysb.sk+ysb.bk+'), 월주 '+msb.s+msb.b+'('+msb.sk+msb.bk+'), 일주 '+dsb.s+dsb.b+'('+dsb.sk+dsb.bk+'), 시주 '+hsb.s+hsb.b+'('+hsb.sk+hsb.bk+')'
    :'연주 '+ysb.s+ysb.b+'('+ysb.sk+ysb.bk+'), 월주 '+msb.s+msb.b+'('+msb.sk+msb.bk+'), 일주 '+dsb.s+dsb.b+'('+dsb.sk+dsb.bk+') (시주 불명)';

  setStep(2);
  document.getElementById('formSection').style.display='none';
  document.getElementById('progBox').classList.add('show');
  document.getElementById('resultArea').classList.remove('show');

  var msgs=['사주팔자 계산 중…','오행·십성 분석 중…','대운·세운 파악 중…','리포트 작성 중…','최종 검토 중…'];
  var mi=0;
  var interval=setInterval(function(){if(mi<msgs.length)document.getElementById('progSub').textContent=msgs[mi++];},2000);

  var memoLine=memo?'- 의뢰인이 전한 고민: '+memo:'';
  var prompt=`당신은 30년 경력의 명리학 전문가이자 상담사입니다. 아래 사주 정보를 바탕으로 전문 상담 보고서 수준의 리포트를 작성해 주세요.

【중요한 말투 지침】
- 상담사가 의뢰인에게 직접 이야기하는 따뜻하고 자연스러운 말투로 작성하세요.
- "~이에요", "~네요", "~거든요" 같은 부드러운 표현을 사용하세요.
- 명리학 용어는 최소화하고, 쓸 경우 바로 옆에 쉽게 풀어 설명해 주세요.
- 부정적인 내용은 반드시 해결책과 함께 제공하세요.
- 고객이 돈을 내고 받을 만큼 가치 있는 맞춤형 리포트로 작성하세요.

【의뢰인 정보】
- 이름: {name} / 성별: {gender}
- 생년월일: {y}년 {m}월 {d}일 / 출생시: {btime}
- 사주: {saju}
- 관심 분야: {concerns}
{memo_line}

【출력 형식 — 반드시 아래 순서대로 ▶ 기호로 각 섹션 시작】

▶ 한줄 요약
{name}님의 사주를 한 문장으로 핵심 정리.

▶ 핵심 성격 분석
타고난 기질, 성격의 강점과 특징을 상세하게. 최소 5~6문장.

▶ 강점 TOP5
번호를 붙여 5가지 강점을 구체적으로 설명.

▶ 약점 TOP5
번호를 붙여 5가지 약점과 각각의 개선 방법을 함께 제시.

▶ 인간관계 특징
대인관계, 친구관계, 직장 내 관계 특징을 구체적으로. 최소 4~5문장.

▶ 재물운
재물을 모으는 방식, 돈과의 관계, 투자 성향. 최소 4~5문장.

▶ 직업운
어울리는 직종, 커리어 방향, 직장생활 특징. 최소 4~5문장.

▶ 사업운
사업 적합성, 어울리는 사업 분야, 주의할 점. 최소 4~5문장.

▶ 연애운
연애 스타일, 이상형, 주의할 패턴. 최소 4~5문장.

▶ 결혼운
결혼 시기, 배우자 인연, 결혼생활 특징. 최소 4~5문장.

▶ 건강운
취약한 부위, 주의할 건강 이슈, 건강 관리법. 최소 4~5문장.

▶ 인생 흐름 분석
10대~60대까지 인생의 전반적인 흐름과 변화 시기를 설명. 최소 5~6문장.

▶ 향후 10년 운세 (2025~2034년)
연도별로 중요한 변화와 기회, 주의할 시기를 설명. 각 연도 1~2문장.

▶ 2026년 월별 운세
1월부터 12월까지 각 달의 운세와 주의사항을 구체적으로.

▶ 행운 요소
- 행운의 색상: (구체적으로 2~3가지)
- 행운의 숫자: (2~3가지)
- 행운의 방향: (구체적으로)
- 행운의 음식: (구체적으로 3~5가지)

▶ 실천 조언
지금 당장 실생활에서 실천할 수 있는 조언 5가지를 번호를 붙여 구체적으로.

전체 10,000자 이상. 각 섹션을 충분히 상세하게 작성하고 절대 중간에 끊지 마세요.`;
  prompt=prompt
    .replace('{name}',name).replace('{name}',name).replace('{name}',name)
    .replace('{gender}',gender).replace('{y}',y).replace('{m}',m).replace('{d}',d)
    .replace('{btime}',btime).replace('{saju}',sajuStr)
    .replace('{concerns}',concerns.join(', ')).replace('{memo_line}',memoLine);

  try{
    var res=await fetch('/api/saju',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:[{role:'user',content:prompt}]})
    });
    var data=await res.json();
    clearInterval(interval);

    if(!res.ok||data.error){
      var errMsg=data.error?data.error.type+': '+data.error.message:'HTTP '+res.status;
      document.getElementById('progBox').classList.remove('show');
      document.getElementById('formSection').style.display='block';
      setStep(1);
      alert('오류: '+errMsg);
      return;
    }

    var raw=(data.content||[]).map(function(c){return c.text||'';}).join('')||'풀이를 가져오지 못했습니다.';
    lastData={name,gender,y,m,d,btime,concerns,ysb,msb,dsb,hsb,raw,memo,birth};
    historyList.unshift({name,gender,y,m,d,btime,concerns,ysb,msb,dsb,hsb,raw,memo,ts:new Date().toLocaleString('ko-KR')});

    // 팔자 미리보기
    var pdata=[{lbl:'시주',sb:hsb},{lbl:'일주',sb:dsb},{lbl:'월주',sb:msb},{lbl:'연주',sb:ysb}];
    document.getElementById('pillarsPreview').innerHTML=pdata.map(function(p){
      return p.sb
        ?'<div class="pill"><div class="pill-card"><div class="pill-s">'+p.sb.s+'</div><div class="pill-b">'+p.sb.b+'</div></div><div class="pill-label">'+p.lbl+'</div></div>'
        :'<div class="pill"><div class="pill-card" style="opacity:.35"><div class="pill-s">?</div><div class="pill-b">?</div></div><div class="pill-label">시주</div></div>';
    }).join('');

    var html=raw.replace(/##+ */g,'').replace(/---+/g,'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'$1');
    document.getElementById('resName').textContent=name;
    document.getElementById('resPreview').innerHTML=html;
    document.getElementById('progBox').classList.remove('show');
    document.getElementById('resultArea').classList.add('show');
    setStep(3);

  }catch(e){
    clearInterval(interval);
    document.getElementById('progBox').classList.remove('show');
    document.getElementById('formSection').style.display='block';
    setStep(1);
    alert('오류가 발생했습니다: '+e.message);
  }
}

// ── PDF 다운로드 ──
function downloadPDF(){
  if(!lastData)return;
  var d=lastData;
  var oh=calcOheng(d.ysb,d.msb,d.dsb,d.hsb);
  var pdata=[{lbl:'시주',sb:d.hsb},{lbl:'일주',sb:d.dsb},{lbl:'월주',sb:d.msb},{lbl:'연주',sb:d.ysb}];
  var pillarsHTML=pdata.map(function(p){
    return p.sb
      ?'<div style="text-align:center;"><div style="width:50px;border:1px solid #d4c4a0;border-radius:4px;overflow:hidden;"><div style="background:#8b2020;color:white;font-size:1.1rem;padding:8px 0;text-align:center;">'+p.sb.s+'</div><div style="background:#f0e4c4;font-size:1.1rem;padding:8px 0;text-align:center;border-top:1px solid #d4c4a0;">'+p.sb.b+'</div></div><div style="font-size:.65rem;color:#6b6058;margin-top:3px;">'+p.lbl+'</div></div>'
      :'<div style="text-align:center;"><div style="width:50px;border:1px solid #d4c4a0;border-radius:4px;overflow:hidden;opacity:.4;"><div style="background:#8b2020;color:white;font-size:1.1rem;padding:8px 0;text-align:center;">?</div><div style="background:#f0e4c4;font-size:1.1rem;padding:8px 0;text-align:center;">?</div></div><div style="font-size:.65rem;color:#6b6058;margin-top:3px;">시주</div></div>';
  }).join('');

  var ohBars=['목','화','토','금','수'].map(function(k,i){
    var colors=['#5a8a3a','#c9503a','#c9933a','#8a8a9a','#3a6a9a'];
    var labels=['목(木)','화(火)','토(土)','금(金)','수(水)'];
    var pct=oh[k]||0;
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">'
      +'<div style="width:40px;font-size:.8rem;font-weight:600;color:'+colors[i]+';text-align:right;">'+labels[i]+'</div>'
      +'<div style="flex:1;background:#f0ebe4;border-radius:20px;height:14px;overflow:hidden;">'
      +'<div style="width:'+pct+'%;height:100%;background:'+colors[i]+';border-radius:20px;"></div></div>'
      +'<div style="width:30px;font-size:.75rem;color:#6b6058;">'+pct+'%</div>'
      +'</div>';
  }).join('');

  // 섹션 파싱
  var safeRaw=d.raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  var sections=safeRaw.split(/▶/).filter(function(s){return s.trim();});
  var sectionsHTML=sections.map(function(s){
    var lines=s.trim().split('\n');
    var title=lines[0].trim();
    var body=lines.slice(1).join('\n').trim();
    return '<div style="margin-bottom:28px;page-break-inside:avoid;">'
      +'<h3 style="font-family:\'Noto Serif KR\',serif;font-size:1rem;font-weight:700;color:#8b2020;border-bottom:2px solid #f0e4c4;padding-bottom:8px;margin-bottom:12px;">'+title+'</h3>'
      +'<div style="font-size:.88rem;line-height:2;color:#2a1f10;white-space:pre-wrap;">'+body+'</div>'
      +'</div>';
  }).join('');

  var today=new Date().toLocaleDateString('ko-KR');
  var metaTags=d.concerns.map(function(c){return '<span style="display:inline-block;padding:3px 12px;background:#f0e4c4;border:1px solid rgba(184,134,42,.3);border-radius:20px;font-size:.75rem;color:#6b6058;margin:2px;">'+c+'</span>';}).join('');

  var pdfHTML='<!DOCTYPE html><html lang="ko"><head>'
    +'<meta charset="UTF-8">'
    +'<title>'+d.name+'님 사주 리포트 · 사주한장</title>'
    +'<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet">'
    +'<style>'
    +'*{margin:0;padding:0;box-sizing:border-box;}'
    +'body{background:#f8f7f4;color:#1a1410;font-family:"Noto Sans KR",sans-serif;}'
   @media print{'
    +'*{-webkit-print-color-adjust:exact !important;}'
    +'body{background:white !important;}'
    +'.no-print{display:none !important;}'
    +'@page{margin:15mm;size:A4;}'
    +'}'+'</style>'
    +'</head><body>'
    +'<div style="max-width:800px;margin:0 auto;padding:40px 40px 60px;">'

    // 헤더
    +'<div style="text-align:center;padding-bottom:32px;border-bottom:2px solid #e4ddd4;margin-bottom:32px;">'
    +'<img src="https://saju-hanjang.vercel.app/logo.png" style="width:80px;height:80px;object-fit:contain;margin-bottom:12px;" alt="사주한장">'
    +'<div style="font-family:\'Noto Serif KR\',serif;font-size:.9rem;letter-spacing:.2em;color:#6b6058;margin-bottom:8px;">사주한장</div>'
    +'<h1 style="font-family:\'Noto Serif KR\',serif;font-size:1.8rem;font-weight:700;margin-bottom:6px;"><span style="color:#b8862a;">'+d.name+'</span>님의 사주 리포트</h1>'
    +'<p style="color:#6b6058;font-size:.85rem;">'+d.y+'년 '+d.m+'월 '+d.d+'일 · '+d.btime+' · '+d.gender+'성</p>'
    +'<div style="margin-top:12px;">'+metaTags+'</div>'
    +'</div>'

    // 팔자 카드
    +'<div style="background:white;border:1px solid #e4ddd4;border-radius:12px;padding:24px;margin-bottom:24px;">'
    +'<h3 style="font-family:\'Noto Serif KR\',serif;font-size:.9rem;font-weight:600;color:#6b6058;text-align:center;margin-bottom:16px;letter-spacing:.1em;">✦ 사주팔자 ✦</h3>'
    +'<div style="display:flex;justify-content:center;gap:12px;">'+pillarsHTML+'</div>'
    +'</div>'

    // 오행 차트
    +'<div style="background:white;border:1px solid #e4ddd4;border-radius:12px;padding:24px;margin-bottom:32px;">'
    +'<h3 style="font-family:\'Noto Serif KR\',serif;font-size:.9rem;font-weight:600;color:#6b6058;text-align:center;margin-bottom:16px;letter-spacing:.1em;">✦ 오행 비율 ✦</h3>'
    +ohBars
    +'</div>'

    // 본문
    +sectionsHTML

    // 푸터
    +'<div style="text-align:center;padding-top:24px;border-top:1px solid #e4ddd4;margin-top:24px;">'
    +'<p style="font-size:.75rem;color:#6b6058;">본 리포트는 명리학 이론을 바탕으로 작성된 참고용 콘텐츠입니다.</p>'
    +'<p style="font-family:\'Noto Serif KR\',serif;font-size:.8rem;color:#b8862a;margin-top:6px;letter-spacing:.1em;">사주한장 · '+today+'</p>'
    +'</div>'
    +'</div>'

    // 인쇄 버튼
    +'<div class="no-print" style="position:fixed;bottom:24px;right:24px;display:flex;gap:10px;">'
    +'<button onclick="window.print()" style="padding:12px 24px;background:#8b2020;color:white;border:none;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);">🖨️ PDF 저장 / 인쇄</button>'
    +'<button onclick="window.close()" style="padding:12px 20px;background:#6b6058;color:white;border:none;border-radius:8px;font-size:.9rem;cursor:pointer;">✕ 닫기</button>'
    +'</div>'
    +'</body></html>';

  var w=window.open('','_blank');
  w.document.write(pdfHTML);
  w.document.close();
  setStep(4);
}

// ── 초기화 ──
function resetAll(){
  lastData=null;
  document.getElementById('formSection').style.display='block';
  document.getElementById('resultArea').classList.remove('show');
  setStep(1);
  document.getElementById('name').value='';
  document.getElementById('birth').value='';
  document.getElementById('memo').value='';
}

// ── 히스토리 ──
function showHistory(){
  if(!historyList.length){alert('아직 생성한 풀이가 없습니다.');return;}
  var area=document.querySelector('.content');
  var rows=historyList.map(function(h,i){
    return '<div style="display:flex;align-items:center;justify-content:space-between;background:white;border:1px solid #e4ddd4;border-radius:10px;padding:14px 18px;margin-bottom:10px;">'
      +'<div><div style="font-weight:600;color:#1a1410;font-size:.9rem;">'+h.name+' ('+h.gender+')</div>'
      +'<div style="color:#6b6058;font-size:.76rem;margin-top:2px;">'+h.y+'.'+h.m+'.'+h.d+' · '+h.ts+'</div></div>'
      +'<button onclick="redownload('+i+')" style="padding:7px 16px;background:#f0e4c4;border:1px solid #b8862a;color:#8b2020;border-radius:6px;font-size:.78rem;font-weight:600;cursor:pointer;">📄 PDF</button>'
      +'</div>';
  }).join('');
  area.innerHTML='<button onclick="location.reload()" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:white;border:1.5px solid #e4ddd4;border-radius:8px;font-size:.84rem;color:#6b6058;cursor:pointer;margin-bottom:20px;">← 돌아가기</button>'
    +'<div style="background:white;border:1px solid #e4ddd4;border-radius:12px;padding:24px;">'
    +'<h2 style="font-family:\'Noto Serif KR\',serif;font-size:.95rem;font-weight:600;margin-bottom:16px;">📋 생성 기록 ('+historyList.length+'건)</h2>'
    +rows+'</div>';
}

function redownload(i){
  lastData=historyList[i];
  downloadPDF();
}
