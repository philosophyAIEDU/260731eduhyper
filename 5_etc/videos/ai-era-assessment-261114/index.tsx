import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,spring,Audio,staticFile} from 'remotion';
import subtitles from './subs.json';
const mint='#79f2d0',muted='#91a1b9',white='#edf4ff';
const scenes:[number,string,string,string,string,string[]][]=[
[0,'문제 제기','AI 시대, 평가에 금이 가다','기존의 시험은 능력을 제대로 보여줄 수 있을까?','crack',['지식 암기','시험 점수','실제 능력']],
[3.88,'01 / AI 안경','정답을 아는 것 ≠ 능력','AI 안경이 던지는 형평성의 질문','glasses',['문제 인식','AI 분석','답 선택']],
[16.73,'01 / 평가의 신뢰','수능을 넘어, 전문직 시험까지','AI 사용 의혹이 넓어지는 평가의 현장','cards',['수능','전문직 시험','평가의 신뢰']],
[23.61,'02 / 기존의 공식','공부 → 시험 → 능력 평가','지식을 기억하고, 같은 장소에서 답하던 방식','flow',['지식 습득','오프라인 시험','점수로 평가']],
[35.83,'02 / 변화의 신호','기존 공식에 생긴 균열','AI가 등장하며 평가의 전제가 흔들립니다','crack',['지식 암기','정답 선택','능력 판단']],
[39.8,'03 / 통제의 한계','더 작은 AI도 막을 수 있을까?','도구는 작아지고, 차단은 어려워집니다','shrink',['AI 안경','소형 AI 도구','완벽한 차단?']],
[50.69,'04 / 질문의 전환','AI를 활용하는 능력을 평가하기','배제의 방법에서 평가의 방법으로','compare',['AI 사용 차단','평가 기준 전환','AI 활용 능력']],
[59.24,'05 / 기술의 속도','AI의 발전 속도가 달라졌다','새로운 모델, 그리고 AI가 개발하는 AI','loop',['AI 개발','새로운 AI','더 빠른 개발']],
[76.96,'05 / 벌어지는 간격','기술은 빠르게, 제도는 천천히','인간의 제도와 사회가 변화를 따라가기 어렵습니다','speed',['AI 기술','벌어지는 간격','사회 · 제도']],
[88.39,'06 / 금지만으로 충분할까','금지에만 집중할 때 생기는 빈틈','더 교묘해지는 사용을 어떻게 발견할까요?','cards',['사용 금지','드러나지 않는 사용','평가의 사각지대']],
[107.42,'07 / 논의의 출발점','AI를 가진 사람의 능력','AI를 활용한다는 전제에서 평가를 고민하기','compare',['AI 배제','질문의 전환','활용 능력 평가']],
[125.06,'08 / 전문직 시험의 예','필기 점수로 충분할까?','객관식과 주관식에 AI가 개입한다면','flow',['객관식','주관식 필기','평가 기능의 변화']],
[140.38,'08 / 전문직 시험의 예','평가의 초점은 ‘일을 해내는가’','AI를 활용해서라도, 관련 업무를 얼마나 잘 수행하는가','flow',['사람 + AI','실제 업무 수행','능력 평가']],
[158.93,'09 / 능력의 재정의','AI와 함께 발휘하는 나의 능력','도구를 활용한 수행 능력에 주목하기','cards',['AI 활용','분야 전문성','수행 능력']],
[169.08,'09 / 평가 방식의 전환','정답 선택에서 실제 수행으로','이 분야에서 자신의 능력을 얼마나 보이는가','compare',['단답 · 오지선다','평가의 전환','분야별 수행 능력']],
[182.48,'10 / 첫 번째 합의','AI 활용을 전제로 평가 논의하기','쉽지 않지만, 여기까지 합의해도 큰 진척','flow',['활용 인정','평가 방법 논의','새 기준 마련']],
[194.95,'11 / 변화의 현실','도구는 더 작아질 것입니다','눈에 보이는 AI 안경만의 문제가 아닙니다','shrink',['AI 안경','더 작은 도구','탐지의 한계']],
[213.55,'11 / 새로운 기준','새 평가 기준의 출발점','AI를 활용한다는 사실을 인정하고 논의하기','flow',['현실 인정','활용 전제','새로운 평가']],
[227.83,'12 / 이미 시작된 균열','변화를 받아들이고, 빠르게 배우기','AI가 가져온 영향을 우리에게 도움이 되도록','crack',['변화 이해','빠른 적응','지속적인 학습']],
[246.9,'함께 생각할 질문','여러분은 어떻게 생각하시나요?','이 영상은 화자의 개인적인 의견입니다','cards',['AI 사용의 인정','새로운 평가 기준','선생님들의 생각']],
[259.93,'대화를 이어갑니다','AI 시대, 무엇을 평가할 것인가','여러분의 생각을 댓글로 남겨주세요','end',['AI 활용','사람의 능력','평가의 변화']]
];
const Tile=({text,i,f,active=false}:{text:string,i:number,f:number,active?:boolean})=>{const p=spring({frame:Math.max(0,f-i*8),fps:30,config:{damping:22}});return <div style={{width:430,height:210,border:`1px solid ${active?mint:'#35475f'}`,borderRadius:24,background:active?'#123b38':'#111e32',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,fontWeight:700,color:active?mint:white,opacity:p,transform:`translateY(${(1-p)*45}px)`}}>{text}</div>};
const Film=()=>{const f=useCurrentFrame(),t=f/30;let idx=0;scenes.forEach((s,i)=>{if(t>=s[0])idx=i});const [start,chapter,title,desc,type,labels]=scenes[idx],local=f-Math.round(start*30);const p=spring({frame:local,fps:30,config:{damping:22}}),sub=subtitles.find(s=>t>=s.start&&t<s.end);return <AbsoluteFill style={{background:'#081321',color:white,fontFamily:'Noto Sans CJK KR, sans-serif'}}>
{/* Audio is included for Studio preview; final rendering remuxes the original AAC losslessly. */}
<Audio src={staticFile('audio.m4a')}/>
<svg width="1920" height="1080" style={{position:'absolute'}}><defs><pattern id="g" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#1a2a3a" strokeWidth="1"/></pattern></defs><rect width="1920" height="1080" fill="url(#g)"/><circle cx="1700" cy="120" r="340" stroke="#173e43" fill="none" strokeWidth="1"/><circle cx="1700" cy="120" r="285" stroke="#173e43" fill="none" strokeWidth="1"/><circle cx={1700+340*Math.cos(f/180)} cy={120+340*Math.sin(f/180)} r="5" fill={mint}/></svg>
<div style={{position:'absolute',left:110,top:65,fontSize:22,letterSpacing:5,color:muted}}>AI & EDUCATION</div><div style={{position:'absolute',right:110,top:65,fontSize:23,color:mint}}>{chapter}</div>
<div style={{position:'absolute',left:110,top:167,opacity:p,transform:`translateY(${(1-p)*25}px)`}}><div style={{width:65,height:5,background:mint,marginBottom:25}}/><div style={{fontSize:68,fontWeight:800,letterSpacing:-3}}>{title}</div><div style={{fontSize:30,color:muted,marginTop:22}}>{desc}</div></div>
<div style={{position:'absolute',left:110,right:110,top:430,height:380,display:'flex',alignItems:'center',justifyContent:'center',gap:35}}>
{type==='glasses'?<><svg width="720" height="330" viewBox="0 0 720 330"><g fill="#102d39" stroke={mint} strokeWidth="7"><rect x="60" y="65" width="240" height="175" rx="60"/><rect x="420" y="65" width="240" height="175" rx="60"/><path d="M300 120Q360 85 420 120M60 100L10 75M660 100L710 75" fill="none"/></g><g fill={mint} fontSize="28" fontFamily="sans-serif"><text x="125" y="165">문제 인식</text><text x="482" y="165">AI 분석</text></g><path d={`M90 ${85+(local%120)}H270M450 ${85+(local%120)}H630`} stroke={mint} opacity=".35" strokeWidth="3"/></svg><div style={{fontSize:55,color:mint}}>→</div><Tile text="답 선택" i={2} f={local} active/></>:type==='speed'?<div style={{width:'100%',padding:'0 80px'}}>{['AI 기술의 발전','사회 · 제도의 변화'].map((x,i)=><div key={x} style={{marginBottom:43}}><div style={{fontSize:30,marginBottom:16,color:i?muted:mint}}>{x}</div><div style={{width:'100%',height:46,background:'#17243a',borderRadius:12}}><div style={{height:'100%',width:`${i?23+Math.min(local/70,10):52+Math.min(local/22,43)}%`,background:i?'#5d6f8c':mint,borderRadius:12}}/></div></div>)}<div style={{fontSize:22,color:muted}}>발전 속도의 차이를 보여주는 개념도</div></div>:type==='shrink'?labels.map((x,i)=><React.Fragment key={x}><div style={{width:450,display:'flex',flexDirection:'column',alignItems:'center',gap:32,opacity:Math.min(1,Math.max(0,(local-i*10)/18))}}><div style={{width:170-i*52,height:170-i*52,border:`4px solid ${mint}`,borderRadius:25,transform:`scale(${1+Math.sin(f/40+i)*.025})`}}/><div style={{fontSize:35}}>{x}</div></div>{i<2&&<div style={{fontSize:45,color:muted}}>→</div>}</React.Fragment>):labels.map((x,i)=><React.Fragment key={x}><Tile text={x} i={i} f={local} active={i===2}/>{i<2&&<div style={{fontSize:46,color:muted}}>{type==='cards'?'·':'→'}</div>}</React.Fragment>)}
{type==='crack'&&<svg style={{position:'absolute',inset:0,pointerEvents:'none'}} width="1700" height="380"><path d="M600 0L665 85L630 130L710 215L675 270L740 380" fill="none" stroke="#ffb48d" strokeWidth="6" strokeDasharray="600" strokeDashoffset={600*(1-Math.min(local/65,1))}/></svg>}
{type==='loop'&&<div style={{position:'absolute',bottom:0,fontSize:28,color:mint,opacity:Math.min(1,local/80)}}>개발 → 발전 → 다음 개발로 이어지는 순환</div>}
</div>
<div style={{position:'absolute',left:110,bottom:198,color:muted,fontSize:20}}>AI 시대의 평가를 다시 생각하다 <span style={{marginLeft:25,color:mint}}>{String(idx+1).padStart(2,'0')} / {scenes.length}</span></div>
{sub&&<div style={{position:'absolute',bottom:53,left:70,right:70,textAlign:'center'}}><span style={{display:'inline-block',background:'#000',padding:'10px 23px',fontSize:49,fontWeight:750,lineHeight:1.4,color:'white'}}>{sub.text}</span></div>}
<div style={{position:'absolute',bottom:0,height:5,left:0,width:`${t/274.566*100}%`,background:mint}}/>
</AbsoluteFill>};
registerRoot(()=> <Composition id="Main" component={Film} width={1920} height={1080} fps={30} durationInFrames={8237}/>);
