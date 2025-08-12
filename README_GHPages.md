# MasalaMeal — South Indian Restaurant Menu (Static Version)

This is the **static GitHub Pages version** of MasalaMeal — a South Indian restaurant menu & ordering UI.  
It does **not** include the Node.js backend, so all data (menu, prices, calories) is loaded directly from a static `menu.json` file.

## 🌟 Features
- Modern responsive design (HTML + Tailwind CSS)
- Sidebar category navigation with price ranges
- Veg / Non‑veg quick filter
- Search with ⌘K / Ctrl+K shortcut
- Menu items show **name, calories, price**, and badges (Veg, Spicy, Bestseller, Gluten‑Free)
- Sticky cart with live totals and checkout form
- Works 100% on GitHub Pages — no backend required

## 📂 Project Structure
```
index.html       → Main page
styles.css       → Tailwind-based custom styles
app.js           → Menu rendering, cart logic
menu.json        → All menu items, prices, calories
/img/            → Food images (replace with your own)
```
> You can replace **`menu.json`** to update the menu without touching HTML/JS.

## 🚀 Hosting on GitHub Pages
1. Create a new GitHub repository (e.g., `MasalaMeal`).
2. Upload all files from this folder to the **root** of your repo.
3. Commit & push.
4. In your repo: **Settings → Pages → Branch = main → Folder = /(root)** → Save.
5. Wait a few minutes — your site will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

## 📝 Editing the Menu
Open `menu.json` and edit or add items under categories:
```json
{
  "restaurant": {
    "name": "MasalaMeal",
    "currency": "£"
  },
  "categories": {
    "Dosa Corner": [
      {
        "id": "dosa_plain",
        "name": "Plain Dosa",
        "description": "Crisp fermented rice-lentil crepe.",
        "price": 5.00,
        "calories": 250,
        "veg": true,
        "bestseller": true,
        "gluten_free": true
      }
    ]
  }
}
```
Reload your GitHub Pages site to see changes.

## 📸 Images
Replace placeholder images in `/img/` with real photos of your dishes.  
Make sure filenames match the IDs in `menu.json` (e.g., `dosa_plain.jpg`).

---
🍛 **MasalaMeal** — Authentic South Indian Flavours, now on GitHub Pages.
