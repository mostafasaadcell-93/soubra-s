# Soubra's · web menu + ordering (concept demo)

An animated 3D menu and ordering site for **Soubra's** (Saida, since 1982, by Majed Soubra), built as a pitch demo. It uses Soubra's name, menu and photos, so it carries a "Concept demo" label and a `noindex` tag until Soubra's approves it.

## Run it
No build step, no libraries. Serve the folder:
```
python -m http.server 8080   →   http://localhost:8080
```
Deploy on Vercel as a static site (Framework: Other, no build command).

## Files
| File | What it is |
|---|---|
| `index.html` | Page structure |
| `css/style.css` | The whole design (green, cream, the red apostrophe) |
| `js/menu-data.js` | **The menu**: 12 categories, 74 items, prices, choices, burger layers. Edit prices here |
| `js/app.js` | Everything that moves: intro, 3D hero, X-ray burger, product sheet, cart, checkout, search |
| `assets/menu/<id>.webp` | 68 product photos cut from Soubra's QR menu (95 px) |
| `assets/brand/` | Two of their Instagram posts (ring box, ghost) |

## What the site does
1. **Intro:** the green velvet ring box from their own post drops in, opens to "Want to have a burger with me?" and a burger pops up. Once per visit; tap to skip.
2. **3D hero:** a Soubra's Classic built from 10 real layers tilts with the mouse. On computers the hero stays pinned while you scroll and the burger explodes into labeled layers ("140g beef", "Special mustard"…), then "10 layers. One bite." slides in with an order button. On phones it comes apart and back together on a loop; tap to hold it open.
3. **Ticker** with their own lines ("Ghost your ex, not your fav restaurant", "Want to have a burger with me?") that speeds up and leans with your scroll.
4. **Menu:** sticky category bar, 3D tilt cards, featured green cards for the Big Soubra's meals, Signature and Spicy tags.
5. **Product sheet:** every burger and sub opens as an **X-ray** of its layers. Tap an ingredient to take it out and its layer slides away. Choices (BBQ or Buffalo, beef or escalope, Pepsi / Miranda / 7UP), a note, quantity, live price. Edit any line from the cart.
6. **Cart and checkout:** Pickup or Delivery, name, Lebanese phone check, address, notes. Builds a clean WhatsApp message with every change ("No dill pickles · Note: well done").
7. **Search** (button or press `/`): names and ingredients, "spicy", "cheese", "under 8", quick chips.
8. **Since 1982** band (the year counts back from today), Instagram polaroids, Visit with map link and both phones.
9. Details: fly-to-cart animation, cursor and magnetic buttons on computers, letters that flip up, reduced motion respected everywhere.

## Demo mode → real orders
Placing an order sends nothing in the demo. With Soubra's permission, set the first line of `js/app.js`:
`const WHATSAPP_NUMBER = '';` → e.g. `'96178700690'`

## Before launch: ask Soubra's
- [ ] **WhatsApp number** for orders (78 700 690 or 81 55 00 45?)
- [ ] **Opening hours** (not shown anywhere yet) and the **delivery fee / area**
- [ ] **Laban Ayran price** (cut off in the screenshots)
- [ ] **Possibly missing items** where screenshots met: Appetizers (around Mini burger, Halloumi, BBQ wings, Twister fries), Salads (before Kaniratcha), Shawarma (before the 1kg), Beef Burgers (after 24k), Wraps (after Chicken Esco)
- [ ] The **dip list** ("dip of your choice" goes in the note for now) and **shawarma sandwich sizes** ("Starting $4")
- [ ] The real **logo file** (SVG/PNG). The wordmark is the Yellowtail font with a red apostrophe
- [ ] **Original photos**: the menu photos are 95 px crops, fine on cards, soft on big screens
- [ ] Descriptions written by us where the menu had none: fries box, fries plate, cheesy fries, twister fries, shawarma plate/sandwiches/markouk, 1kg

Small fixes made to their menu text: "Premuim" → Premium, "chees" → cheese, "beast" → breast, "citron Ette" → citronette, "debs lremen / debes remen" → debs el remmen.
