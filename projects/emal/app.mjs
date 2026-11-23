const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#nav');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');}});
const dialog=document.querySelector('#booking');
const form=document.querySelector('#booking-form');
const content=document.querySelector('#booking-content');
const success=document.querySelector('#booking-success');
const date=form.elements.date;
function localDate(value){return [value.getFullYear(),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-');}
function setDateRange(){const now=new Date();date.min=localDate(now);const max=new Date(now);max.setMonth(max.getMonth()+3);date.max=localDate(max);}
for(const button of document.querySelectorAll('[data-book]'))button.addEventListener('click',()=>{form.reset();clearErrors();setDateRange();form.elements.service.value=button.dataset.book||'Консультация';content.hidden=false;success.hidden=true;dialog.showModal();document.body.classList.add('modal-open');});
function close(){dialog.close();}
document.querySelector('.dialog-close').addEventListener('click',close);
document.querySelector('#booking-done').addEventListener('click',close);
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');form.reset();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}});
function clearErrors(){document.querySelector('#booking-error').textContent='';for(const name of ['name','phone','date']){document.querySelector(`#${name}-error`).textContent='';form.elements[name].removeAttribute('aria-invalid');}}
form.addEventListener('input',event=>{const input=event.target;const error=document.getElementById(`${input.name}-error`);if(error){error.textContent='';input.removeAttribute('aria-invalid');}if(input.name==='demo')document.querySelector('#booking-error').textContent='';});
form.addEventListener('submit',event=>{event.preventDefault();clearErrors();setDateRange();const errors={};if(form.elements.name.value.trim().length<2)errors.name='Введите имя, минимум 2 символа.';const digits=form.elements.phone.value.replace(/\D/g,'');if(digits.length!==11||!['7','8'].includes(digits[0]))errors.phone='Введите номер из 11 цифр, начиная с +7 или 8.';if(!date.value||date.value<date.min||date.value>date.max)errors.date='Выберите дату в ближайшие три месяца.';for(const [name,message] of Object.entries(errors)){document.querySelector(`#${name}-error`).textContent=message;form.elements[name].setAttribute('aria-invalid','true');}if(Object.keys(errors).length){form.elements[Object.keys(errors)[0]].focus();return;}if(!form.elements.demo.checked){document.querySelector('#booking-error').textContent='Подтвердите, что это демонстрационная запись.';form.elements.demo.focus();return;}const friendly=new Date(date.value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'});document.querySelector('#booking-summary').textContent=`Вы выбрали: ${form.elements.service.value}, ${friendly}.`;content.hidden=true;success.hidden=false;form.reset();success.focus();});
