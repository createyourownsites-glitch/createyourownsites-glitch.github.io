export const menu = Object.freeze([
  {id:'chicken',name:'Курица с овощами',category:'Горячее',price:420,weight:'320 г',image:'chicken.webp',description:'Сочное куриное филе, запечённые сезонные овощи, картофель и травы.',allergens:'Молоко'},
  {id:'pasta',name:'Паста с томатами',category:'Горячее',price:390,weight:'280 г',image:'pasta.webp',description:'Паста, печёные томаты черри, пармезан и свежий базилик.',allergens:'Глютен, молоко, яйца'},
  {id:'syrniki',name:'Сырники с ягодами',category:'Завтраки',price:310,weight:'220 г',image:'syrniki.webp',description:'Три творожных сырника, сметана, свежие ягоды и ягодный соус.',allergens:'Молоко, яйца, глютен'},
  {id:'coffee',name:'Капучино',category:'Напитки',price:190,weight:'250 мл',image:'coffee.webp',description:'Двойной эспрессо и нежная молочная пена. Готовим на обычном молоке.',allergens:'Молоко'},
  {id:'latte',name:'Латте',category:'Напитки',price:220,weight:'350 мл',image:'coffee.webp',description:'Мягкий кофе с большим количеством молока и тонким слоем пены.',allergens:'Молоко'}
]);
const products = new Map(menu.map(item=>[item.id,item]));
export function normalizeCart(value) {
  const clean={};
  if(!value || typeof value!=='object' || Array.isArray(value)) return clean;
  for(const [id,quantity] of Object.entries(value)) {
    if(products.has(id) && Number.isInteger(quantity) && quantity>0) clean[id]=Math.min(quantity,20);
  }
  return clean;
}
export function changeQuantity(cart,id,delta) {
  const next=normalizeCart(cart);
  if(!products.has(id) || !Number.isInteger(delta)) return next;
  const quantity=Math.max(0,Math.min(20,(next[id]||0)+delta));
  if(quantity) next[id]=quantity; else delete next[id];
  return next;
}
export function summarize(cart,mode='pickup') {
  const clean=normalizeCart(cart);
  let count=0,subtotal=0;
  for(const [id,quantity] of Object.entries(clean)) { count+=quantity; subtotal+=products.get(id).price*quantity; }
  const delivery=mode==='delivery' && subtotal>0 && subtotal<1500 ? 200 : 0;
  return {count,subtotal,delivery,total:subtotal+delivery};
}
export function validPhone(phone) {
  const digits=String(phone||'').replace(/\D/g,'');
  return digits.length===11 && /^[78]/.test(digits);
}
export function validateCheckout(data,cart) {
  const errors={};
  if(!summarize(cart).count) errors.cart='Добавьте хотя бы одно блюдо.';
  if(String(data.name||'').trim().length<2) errors.name='Укажите имя, минимум 2 символа.';
  if(!validPhone(data.phone)) errors.phone='Укажите российский номер из 11 цифр, начиная с +7 или 8.';
  if(!['pickup','delivery'].includes(data.mode)) errors.mode='Выберите способ получения.';
  if(data.mode==='delivery' && String(data.address||'').trim().length<8) errors.address='Укажите улицу, дом и квартиру или офис.';
  if(!data.acknowledged) errors.acknowledged='Подтвердите, что оформляете демонстрационный заказ.';
  return errors;
}
