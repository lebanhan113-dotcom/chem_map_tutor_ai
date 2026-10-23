
(function(){
'use strict';
let fullName='',className='';
try{fullName=sessionStorage.getItem('edp_student_fullname')||'';className=sessionStorage.getItem('edp_student_class')||''}catch(e){}
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cleanName(t){return String(t||'').normalize('NFC').trim().replace(/\s+/g,' ').slice(0,80)}
function setName(t){fullName=cleanName(t);try{sessionStorage.setItem('edp_student_fullname',fullName)}catch(e){}}
function setClass(t){className=String(t||'').trim().replace(/\s+/g,' ').slice(0,24);try{sessionStorage.setItem('edp_student_class',className)}catch(e){}}
function getName(){let input=document.querySelector('.ep-student-name');if(input&&input.value.trim()!==fullName)setName(input.value);return fullName}
function valid(t){return t.length>=3&&t.length<=80&&/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u.test(t)&&t.split(' ').length>=2}
function requireName(){const t=getName();if(valid(t))return true;const msg='Vui l\u00f2ng nh\u1eadp h\u1ecd v\u00e0 t\u00ean h\u1ecdc sinh h\u1ee3p l\u1ec7 (\u00edt nh\u1ea5t h\u1ecd v\u00e0 t\u00ean, kh\u00f4ng d\u00f9ng ch\u1eef s\u1ed1).';alert(msg);let el=document.querySelector('.ep-student-name');if(el){el.focus();el.scrollIntoView({behavior:'smooth',block:'center'})}return false}
function toolbar(){return `<section class="ep-student-bar" aria-label="Th\u00f4ng tin h\u1ecdc sinh tham gia l\u00e0m b\u00e0i"><div class="ep-student-title"><span>\ud83d\udc64 TH\u00d4NG TIN H\u1eccC SINH</span><small>Nh\u1eadp tr\u01b0\u1edbc khi b\u1eaft \u0111\u1ea7u l\u00e0m b\u00e0i</small></div><label class="ep-student-field">H\u1ecd v\u00e0 t\u00ean h\u1ecdc sinh <span class="ep-student-flag">*</span><input class="ep-student-name" aria-label="H\u1ecd v\u00e0 t\u00ean h\u1ecdc sinh" type="text" autocomplete="name" maxlength="80" placeholder="V\u00ed d\u1ee5: Nguy\u1ec5n V\u0103n An" value="${h(fullName)}" oninput="EPSTUDENT.setName(this.value)" required></label><label class="ep-student-field">L\u1edbp <small>(kh\u00f4ng b\u1eaft bu\u1ed9c)</small><input class="ep-student-class" aria-label="L\u1edbp h\u1ecdc sinh" type="text" maxlength="24" placeholder="V\u00ed d\u1ee5: 10A1" value="${h(className)}" oninput="EPSTUDENT.setClass(this.value)"></label><p class="ep-student-note">H\u1ecd t\u00ean \u0111\u01b0\u1ee3c nh\u1edb t\u1ea1m trong phi\u00ean tr\u00ecnh duy\u1ec7t v\u00e0 \u0111\u00ednh k\u00e8m t\u1ec7p k\u1ebft qu\u1ea3 b\u1ea1n ch\u1ee7 \u0111\u1ed9ng xu\u1ea5t. Ch\u1ec9 nh\u1eadp h\u1ecd t\u00ean th\u1eadt khi \u0111\u01b0\u1ee3c nh\u00e0 tr\u01b0\u1eddng/gi\u00e1o vi\u00ean cho ph\u00e9p; kh\u00f4ng d\u00f9ng thi\u1ebft b\u1ecb c\u00f4ng c\u1ed9ng.</p></section>`}
window.EPSTUDENT={getName,getClass:()=>className,setName,setClass,requireName,toolbar,valid};
})();
