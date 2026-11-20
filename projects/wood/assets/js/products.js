export const CATEGORIES = [
  { id: 'sofas', name: 'Диваны' },
  { id: 'tables', name: 'Столы' },
  { id: 'chairs', name: 'Стулья' },
  { id: 'wardrobes', name: 'Шкафы' },
  { id: 'beds', name: 'Кровати' },
  { id: 'dressers', name: 'Комоды' },
];

/** @typedef {{id:string, name:string, category:string, material:string, size:string, price:number, image:string, featured?:boolean}} Product */

// ПЛЕЙСХОЛДЕР: названия, размеры и цены вымышленные
/** @type {Product[]} */
export const PRODUCTS = [
  { id: 'sofa-nord', name: 'Диван «Норд»', category: 'sofas', material: 'Ясень, лён', size: '220 × 95 × 85 см', price: 89000, image: 'assets/img/products/sofa.webp', featured: true },
  { id: 'sofa-uyut', name: 'Диван «Уют» угловой', category: 'sofas', material: 'Сосна, велюр', size: '280 × 160 × 85 см', price: 124000, image: 'assets/img/products/sofa.webp' },
  { id: 'table-dub', name: 'Стол обеденный «Дубрава»', category: 'tables', material: 'Массив дуба', size: '160 × 90 × 75 см', price: 78000, image: 'assets/img/products/table.webp', featured: true },
  { id: 'table-coffee', name: 'Журнальный стол «Срез»', category: 'tables', material: 'Ясень', size: '90 × 60 × 45 см', price: 28500, image: 'assets/img/products/table.webp' },
  { id: 'chair-klassik', name: 'Стул «Классик»', category: 'chairs', material: 'Бук', size: '45 × 50 × 90 см', price: 18000, image: 'assets/img/products/chair.webp' },
  { id: 'chair-bar', name: 'Барный стул «Лофт»', category: 'chairs', material: 'Дуб, металл', size: '40 × 45 × 105 см', price: 21500, image: 'assets/img/products/chair.webp' },
  { id: 'wardrobe-forest', name: 'Шкаф «Лесной»', category: 'wardrobes', material: 'Массив сосны', size: '120 × 55 × 210 см', price: 96000, image: 'assets/img/products/wardrobe.webp', featured: true },
  { id: 'wardrobe-coupe', name: 'Шкаф-купе «Рассвет»', category: 'wardrobes', material: 'Ясень, зеркало', size: '200 × 60 × 240 см', price: 142000, image: 'assets/img/products/wardrobe.webp' },
  { id: 'bed-sonya', name: 'Кровать «Соня»', category: 'beds', material: 'Массив дуба', size: '160 × 200 см', price: 98000, image: 'assets/img/products/bed.webp', featured: true },
  { id: 'bed-kids', name: 'Кровать детская «Домик»', category: 'beds', material: 'Сосна', size: '90 × 190 см', price: 42000, image: 'assets/img/products/bed.webp' },
  { id: 'dresser-ladya', name: 'Комод «Ладья»', category: 'dressers', material: 'Дуб', size: '110 × 45 × 90 см', price: 64000, image: 'assets/img/products/dresser.webp' },
  { id: 'dresser-mini', name: 'Комод «Мини»', category: 'dressers', material: 'Сосна', size: '80 × 40 × 80 см', price: 36000, image: 'assets/img/products/dresser.webp' },
];
