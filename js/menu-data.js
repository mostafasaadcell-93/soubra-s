/* Soubra's menu. Source: soubras.gravitymenu.site (November 2026).
   Prices in US dollars. Edit this file to change items or prices.

   Item fields
     id    unique, also the photo name: assets/menu/<id>.webp
     n     name
     d     description
     p     price in dollars (null = price not listed yet)
     from  true when the menu says "Starting" (size and final price confirmed on WhatsApp)
     img   true when there is a photo
     L     burger layers, top to bottom, for the X-ray view (keys are in app.js)
           "key:Label_words" changes the label shown for that layer (underscores = spaces)
     rm    removable extras for items without layers ("No garlic")
     opt   choices: [{ n: "Flavor", c: ["BBQ", "Buffalo"] }]
     tag   "Signature" | "Spicy"
     dip   true when the item comes with "a dip of your choice" */
const SOFT = { n: 'Soft drink', c: ['Pepsi', 'Miranda', '7UP'] };

const MENU = [
  { id: 'appetizers', n: 'Appetizers', note: 'start here, thank us later', items: [
    { id: 'jalapeno-poppers', n: 'Jalapeño Poppers', d: '6 pcs of spicy, golden, crispy cheddar bites + dip', p: 7.5, img: true, tag: 'Spicy' },
    { id: 'legendary-cheesy-fries', n: 'Legendary Cheesy Fries', d: 'French fries mixed with steak sauce, shredded mozzarella and cheddar, topped with chopped beef burger, mushrooms, smoked cocktail and steak sauce', p: 12, img: true, tag: 'Signature', rm: ['Mushrooms'] },
    { id: 'mini-burger', n: 'Mini Burger', d: 'Beef or escalope chicken, fries, pickles, coleslaw and ketchup', p: 4, img: true, opt: [{ n: 'Patty', c: ['Beef', 'Escalope chicken'] }], rm: ['Pickles', 'Coleslaw', 'Ketchup'] },
    { id: 'bangbang-shrimps', n: 'Bang Bang Shrimps', d: '10 pcs of fried shrimps dipped in our signature bang bang sauce', p: 7.5, img: true },
    { id: 'chicken-nuggets', n: 'Chicken Nuggets', d: '10 pcs of fried nuggets + dip', p: 6, img: true },
    { id: 'chicken-tenders', n: 'Chicken Tenders', d: '5 pcs of crispy tenders served with honey mustard dip', p: 6.5, img: true },
    { id: 'halloumi-sticks', n: 'Halloumi Sticks', d: '6 pcs of fried halloumi sticks + dip', p: 7.5, img: true },
    { id: 'cheddar-bricks', n: 'Cheddar Bricks', d: '6 pcs of golden fried cheddar sticks + dip', p: 7.5, img: true },
    { id: 'mozzarella-sticks', n: 'Mozzarella Sticks', d: '6 pcs of mozzarella sticks + dip', p: 6.5, img: true },
    { id: 'onion-rings', n: 'Onion Rings', d: '10 pcs of onion rings + dip', p: 5.5, img: true },
    { id: 'wings', n: 'BBQ / Buffalo Wings', d: '12 pcs of wings dipped in BBQ or Buffalo + dip', p: 6.5, img: true, opt: [{ n: 'Flavor', c: ['BBQ', 'Buffalo'] }] },
    { id: 'fries-box', n: 'Fries Box + Dip', d: 'Fries in a box, with a dip', p: 3.5, img: true },
    { id: 'fries-plate', n: 'Fries Plate + 2 Dips', d: 'A plate of fries with 2 dips', p: 6, img: true },
    { id: 'cheesy-fries', n: 'Cheesy Fries', d: 'Fries loaded with cheese', p: 8.5, img: true },
    { id: 'twister-fries', n: 'Twister Fries + Dip', d: 'Twister fries with a dip', p: 7, img: true }
  ] },
  { id: 'big-soubras', n: "Big Soubra's Meal", note: 'the big guys, with fries & a drink', featured: true, items: [
    { id: 'soubras-duo', n: "Soubra's Duo", d: "Big Soubra's Chicken & Big Soubra's Beef with fries, dip of your choice & soft drink", p: 15, img: true, tag: 'Signature', dip: true, opt: [SOFT] },
    { id: 'big-soubras-beef', n: "Big Soubra's Beef", d: '2x premium beef patties, dijonnaise sauce, lettuce, diced onions, dill pickles & 2x cheddar slices with fries, dip of your choice & soft drink', p: 10, img: true, tag: 'Signature', dip: true, opt: [SOFT],
      L: 'bunT dijonnaise lettuce onion pickles cheddar beef:Premium_beef_patty cheddar2 beef2:Premium_beef_patty bunB' },
    { id: 'big-soubras-chicken', n: "Big Soubra's Chicken", d: '2x fried chicken patties, mayo, lettuce & 2x cheddar slices with fries, dip of your choice & soft drink', p: 10, img: true, dip: true, opt: [SOFT],
      L: 'bunT mayo lettuce cheddar chickenF:Fried_chicken_patty cheddar2 chickenF2:Fried_chicken_patty bunB' }
  ] },
  { id: 'salads', n: 'Salads', note: 'yes, we do green too', items: [
    { id: 'caesar-salad', n: 'Chicken Caesar Salad', d: 'Romaine lettuce, croutons, parmesan cheese, topped with grilled chicken, served with Caesar dressing', p: 8, img: true, rm: ['Croutons', 'Parmesan cheese'] },
    { id: 'tuna-rocca-salad', n: 'Tuna Rocca Salad', d: 'Rocca, iceberg, fresh mushrooms, corn, cucumber, olives, carrots, shredded mozzarella, fusilli pasta, topped with tuna, served with lemon mayo dressing', p: 9.5, img: true, rm: ['Mushrooms', 'Corn', 'Cucumber', 'Olives', 'Carrots', 'Mozzarella'] },
    { id: 'chicken-avocado-salad', n: 'Chicken Avocado Salad', d: 'Iceberg, corn, fresca, shredded cheddar, tortilla chips, avocado, olives, Mexican grilled chicken, served with lemon mayo dressing', p: 10, img: true, rm: ['Corn', 'Cheddar', 'Tortilla chips', 'Olives'] },
    { id: 'penneto-salad', n: 'Penneto Salad', d: 'Rocca, fresh mushrooms, cherry tomatoes, parmesan cheese, pine nuts, penne pasta mixed with pesto sauce, topped with grilled chicken breast, served with citronette dressing', p: 9, img: true, rm: ['Mushrooms', 'Cherry tomatoes', 'Parmesan', 'Pine nuts'] },
    { id: 'kaniratcha-salad', n: 'Kaniratcha Salad', d: 'Rocca, iceberg, radish, cucumber, carrot, mango, coriander, sushi rice, topped with crab sticks, fried shrimps and sriracha sauce, served with bang bang dressing', p: 12, img: true, tag: 'Spicy', rm: ['Radish', 'Coriander', 'Mango', 'Sriracha'] }
  ] },
  { id: 'shawarma', n: 'Shawarma', note: 'the Saida way', items: [
    { id: 'chicken-shawarma-plate', n: 'Chicken Shawarma Plate', d: 'Chicken shawarma on a plate', p: 15, img: true },
    { id: 'beef-shawarma-plate', n: 'Beef Shawarma Plate', d: '250g of beef shawarma, served with fries, tahini sauce, debs el remmen, biwaz, pickles and grilled tomato', p: 15, img: true, rm: ['Biwaz', 'Pickles', 'Debs el remmen'] },
    { id: 'beef-shawarma-meal', n: 'Beef Shawarma Meal', d: '250g of beef shawarma, served with tahini, debs el remmen, biwaz, pickles and grilled tomato', p: 15, img: true, rm: ['Biwaz', 'Pickles', 'Debs el remmen'] },
    { id: 'chicken-shawarma-meal', n: 'Chicken Shawarma Meal', d: '250g of chicken shawarma, served with fries, garlic, spicy garlic, pickles and coleslaw', p: 15, img: true, rm: ['Spicy garlic', 'Pickles', 'Coleslaw'] },
    { id: 'shawarma-1kg', n: 'Chicken / Beef Shawarma 1kg', d: '1kg of chicken or beef shawarma for the table', p: 45, opt: [{ n: 'Shawarma', c: ['Chicken', 'Beef'] }] },
    { id: 'chicken-shawarma', n: 'Chicken Shawarma', d: 'Chicken shawarma sandwich', p: 4, from: true, img: true, rm: ['Garlic', 'Pickles'] },
    { id: 'beef-shawarma', n: 'Beef Shawarma', d: 'Beef shawarma sandwich', p: 4, from: true, img: true, rm: ['Tahini', 'Pickles'] },
    { id: 'chicken-markouk', n: 'Chicken Shawarma Markouk', d: 'Chicken shawarma rolled in markouk bread', p: 7, img: true },
    { id: 'beef-markouk', n: 'Beef Shawarma Markouk', d: 'Beef shawarma rolled in markouk bread', p: 7, img: true }
  ] },
  { id: 'beef-burgers', n: 'Beef Burgers', note: '140g of premium beef, every time', items: [
    { id: 'lebanese-burger', n: 'Lebanese Burger', d: '140g of premium beef patty, coleslaw, fries, pickles and ketchup', p: 7.5, img: true,
      L: 'bunT ketchup fries coleslaw pickles beef bunB' },
    { id: 'soubras-classic', n: "Soubra's Classic", d: '140g of premium beef patty topped with cheddar slice, special mustard, dill pickles, iceberg, grilled onion, grilled tomato and cocktail sauce', p: 7.5, img: true, tag: 'Signature',
      L: 'bunT cocktail tomato:Grilled_tomato grilledOnion iceberg pickles mustard cheddar beef bunB' },
    { id: 'pablo-beef', n: 'Pablo Beef', d: "140g of premium beef patty, Soubra's sauce, iceberg, jalapeños, tomato, buttered pepper and onions, mixed cheese and tortilla chips", p: 9.5, img: true, tag: 'Spicy',
      L: 'bunT soubras nachos:Tortilla_chips jalapenos tomato peppers iceberg mixCheese beef bunB' },
    { id: 'sauron-eye', n: 'Sauron Eye', d: '140g of premium beef patty topped with emmental cheese, homemade cherry jam, buttered pineapple and onions, crispy beef bacon and mayo', p: 8.5, img: true,
      L: 'bunT mayo bacon pineapple cherryJam emmental beef bunB' },
    { id: 'mushroom-beef', n: 'Mushroom Beef', d: "140g of premium beef patty topped with 2 cheddar slices, Soubra's sauce and sautéed mushrooms", p: 9.5, img: true,
      L: 'bunT soubras mushrooms:Sautéed_mushrooms cheddar cheddar2 beef bunB' },
    { id: 'honeymozz-beef', n: 'Honeymozz Beef', d: '140g of premium beef patty, cocktail sauce, iceberg, dill pickles, tomato, deep fried mozzarella patty and honey mustard', p: 10, img: true,
      L: 'bunT honeyMustard mozzPatty tomato pickles iceberg cocktail beef bunB' },
    { id: 'franchise', n: 'Franchise', d: '140g of premium beef patty topped with emmental and cheddar slices, special mustard, iceberg, dill pickles, tomato, onion rings, crispy beef bacon and cocktail sauce', p: 9.5, img: true,
      L: 'bunT cocktail bacon onionRings tomato pickles iceberg mustard cheddar emmental beef bunB' },
    { id: '24k', n: '24k', d: "140g of premium beef patty, Soubra's sauce, iceberg, dill pickles, tomato, deep fried cheddar patty, crispy beef bacon and smoked BBQ sauce", p: 11, img: true, tag: 'Signature',
      L: 'bunT bbq bacon cheddarPatty tomato pickles iceberg soubras beef bunB' }
  ] },
  { id: 'grilled-chicken', n: 'Grilled Chicken Burgers', note: 'off the grill, onto the bun', items: [
    { id: 'classic-grilled-chicken', n: 'Classic Grilled Chicken', d: 'Grilled chicken breast topped with cheddar slice, garlic mayo, iceberg, dill pickles and fresh mushrooms', p: 7.5, img: true,
      L: 'bunT garlicMayo mushrooms:Fresh_mushrooms pickles iceberg cheddar chickenG bunB' },
    { id: 'caesar-chicken', n: 'Caesar', d: 'Grilled chicken breast topped with emmental cheese, Caesar sauce, lettuce, fresh mushrooms and parmesan cheese', p: 7.5, img: true,
      L: 'bunT caesar parmesan mushrooms:Fresh_mushrooms lettuce emmental chickenG bunB' },
    { id: 'pablo-chicken', n: 'Pablo Chicken', d: "Grilled chicken breast, Soubra's sauce, iceberg, jalapeños, tomato, buttered pepper and onions, mixed cheese and tortilla chips", p: 9, img: true, tag: 'Spicy',
      L: 'bunT soubras nachos:Tortilla_chips jalapenos tomato peppers iceberg mixCheese chickenG bunB' },
    { id: 'honeymozz-chicken', n: 'Honeymozz Chicken', d: 'Grilled chicken breast, cocktail sauce, iceberg, dill pickles, tomato, deep fried mozzarella patty and honey mustard sauce', p: 9.5, img: true,
      L: 'bunT honeyMustard mozzPatty tomato pickles iceberg cocktail chickenG bunB' },
    { id: 'mushroom-chicken', n: 'Mushroom Chicken', d: "Grilled chicken breast topped with 2 emmental slices, Soubra's sauce and sautéed mushrooms", p: 9, img: true,
      L: 'bunT soubras mushrooms:Sautéed_mushrooms emmental emmental2 chickenG bunB' }
  ] },
  { id: 'fried-chicken', n: 'Fried Chicken', note: 'loud crunch, zero regrets', items: [
    { id: 'classic-fried-chicken', n: 'Classic Fried Chicken', d: 'Golden fried chicken breast topped with cheddar slice, cocktail sauce, iceberg, dill pickles and tomato', p: 7.5, img: true,
      L: 'bunT cocktail tomato pickles iceberg cheddar chickenF bunB' },
    { id: 'crunchy', n: 'Crunchy', d: 'Escalope breast topped with melted cheddar sauce, iceberg, dill pickles, tomato, avocado and smoked cocktail sauce', p: 8, img: true,
      L: 'bunT cocktail:Smoked_cocktail_sauce avocado tomato pickles iceberg cheddarSauce chickenF:Escalope_breast bunB' },
    { id: 'old-school', n: 'Old School', d: "Golden fried chicken breast topped with emmental slice, Soubra's sauce, iceberg, corn, tomato, crispy beef bacon and smoked BBQ sauce", p: 8.5, img: true,
      L: 'bunT bbq bacon tomato corn iceberg soubras emmental chickenF bunB' },
    { id: 'zeus', n: 'Zeus', d: 'Golden fried chicken breast topped with emmental and cheddar slices, garlic mayo, rocca, dill pickles, tomato, turkey and cocktail sauce', p: 8, img: true,
      L: 'bunT cocktail turkey tomato pickles rocca garlicMayo cheddar emmental chickenF bunB' },
    { id: 'honey-bunny', n: 'Honey Bunny', d: 'Golden fried chicken breast, cocktail sauce, iceberg, dill pickles, tomato, deep fried mozzarella patty and honey mustard', p: 9.5, img: true,
      L: 'bunT honeyMustard mozzPatty tomato pickles iceberg cocktail chickenF bunB' }
  ] },
  { id: 'sandwiches', n: 'Sandwiches', note: 'subs worth the trip', items: [
    { id: 'tawouk-sandwich', n: 'Tawouk Sandwich', d: 'Char-grilled tawouk, garlic, pickles & fries', p: 7, img: true, rm: ['Garlic', 'Pickles', 'Fries'] },
    { id: 'chicken-sub', n: 'Chicken Sub', d: 'Chopped grilled chicken breast, mayo sauce, iceberg, pickles, corn, soy sauce and mozzarella cheese', p: 7, img: true,
      L: 'subT mozzarella corn pickles iceberg mayo chopped subB' },
    { id: 'avocado-chicken', n: 'Avocado Chicken', d: 'Chopped grilled chicken breast, avocado sauce, iceberg, pickles, corn, soy sauce, avocado slices and mozzarella cheese', p: 7.5, img: true,
      L: 'subT mozzarella avocado corn pickles iceberg avoSauce chopped subB' },
    { id: 'fajita', n: 'Fajita', d: 'Chopped grilled chicken breast, avocado sauce, sautéed mushrooms, onions and peppers, corn, soy sauce and mozzarella cheese', p: 8, img: true,
      L: 'subT mozzarella corn peppers:Sautéed_onions_&_peppers mushrooms:Sautéed_mushrooms avoSauce chopped subB' },
    { id: 'soubras-steak', n: "Soubra's Steak", d: "160g of sliced rib-eye steak topped with mixed cheese, Soubra's sauce, grilled onion and tomato", p: 9, img: true, tag: 'Signature',
      L: 'subT tomato grilledOnion soubras mixCheese steak subB' }
  ] },
  { id: 'wraps', n: 'Wraps', note: 'rolled tight, grilled right', items: [
    { id: 'tawouk-wrap', n: 'Tawouk Wrap', d: '200g of char-grilled tawouk, mozzarella, turkey, garlic, pickles and fries', p: 8, img: true, rm: ['Turkey', 'Garlic', 'Pickles', 'Fries'] },
    { id: 'crispy-chicken-wrapper', n: 'Crispy Chicken Wrapper', d: 'Chopped fried chicken breast topped with melted cheddar, BBQ or Buffalo sauce, iceberg and chips', p: 7, img: true, opt: [{ n: 'Sauce', c: ['BBQ', 'Buffalo'] }], rm: ['Iceberg', 'Chips'] },
    { id: 'chicken-cheese', n: 'Chicken Cheese', d: 'Charcoal-grilled chicken breast, garlic mayo, pickles, iceberg, tomato and mozzarella cheese', p: 7, img: true, rm: ['Garlic mayo', 'Pickles', 'Iceberg', 'Tomato'] },
    { id: 'chicken-esco', n: 'Chicken Esco', d: 'Chopped escalope breast, Caesar sauce, lettuce, turkey, parmesan and mozzarella cheese', p: 8, img: true, rm: ['Turkey', 'Parmesan', 'Lettuce'] }
  ] },
  { id: 'platters', n: 'Platters', note: 'for the seriously hungry', items: [
    { id: 'tawouk-platter', n: 'Tawouk Platter', d: '300g of char-grilled tawouk, garlic, pickles, coleslaw and fries', p: 15, img: true, rm: ['Garlic', 'Pickles', 'Coleslaw'] },
    { id: 'majesty-steak', n: "Soubra's Majesty Steak", d: '250g of MB2+ Australian black angus beef, side salad and fries, served with our signature steak sauce', p: 25, img: true, tag: 'Signature' },
    { id: 'entrecote', n: 'Entrecôte Steak', d: '250g of entrecôte steak, side salad and fries, served with our signature steak sauce', p: 20, img: true },
    { id: 'fish-and-chips', n: 'Fish and Chips', d: '2 deep fried fish fillets, tartar sauce, fries and coleslaw', p: 13, img: true, rm: ['Coleslaw'] },
    { id: 'crispy-platter', n: 'Crispy Platter', d: '6 pcs of golden crispy strips, fries + dip, pickles and coleslaw', p: 13, img: true, rm: ['Pickles', 'Coleslaw'] },
    { id: 'escalope-platter', n: 'Escalope Platter', d: '2 escalope breasts topped with emmental and turkey slices, fries, garlic mayo, pickles and coleslaw', p: 15, img: true, rm: ['Turkey', 'Pickles', 'Coleslaw'] },
    { id: 'grilled-chicken-platter', n: 'Grilled Chicken Platter', d: '2 grilled chicken breasts, side salad and fries, served with mushroom sauce', p: 15, img: true }
  ] },
  { id: 'kids', n: 'Kids Meal', note: 'small humans, big appetite', items: [
    { id: 'burger-kids-meal', n: "Burger Kids' Meal", d: '2 mini burgers (Lebanese beef and fried chicken), fries + dip and a juice', p: 8, img: true },
    { id: 'crispy-kids-meal', n: "Crispy Kids' Meal", d: '3 crispy chicken pieces, fries + dip and a juice', p: 7, img: true },
    { id: 'nuggets-kids-meal', n: "Chicken Nuggets Kids' Meal", d: '6 pcs of chicken nuggets, fries + dip and a juice', p: 7, img: true }
  ] },
  { id: 'drinks', n: 'Drinks', note: 'wash it down', items: [
    { id: 'juice', n: 'Juice', d: '', p: 1 },
    { id: 'soft-drinks', n: 'Soft Drinks', d: 'Pepsi, Miranda or 7UP', p: 1.5, opt: [{ n: 'Drink', c: ['Pepsi', 'Miranda', '7UP'] }] },
    { id: 'water', n: 'Water', d: '', p: 0.5 },
    { id: 'iced-tea', n: 'Iced Tea', d: '', p: 1.5 },
    { id: 'laban-ayran', n: 'Laban Ayran', d: '', p: null }
  ] }
];

/* Brand details used across the page */
const SOUBRAS = {
  phones: [{ show: '78 700 690', tel: '+96178700690' }, { show: '81 55 00 45', tel: '+96181550045' }],
  address: 'Houssam El Deen Rafic Hariri St., Saida',
  map: 'https://www.google.com/maps/search/?api=1&query=33.5617022,35.3828883',
  instagram: 'soubraslb'
};
