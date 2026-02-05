MasalaMeal (Modern)

What changed vs the old static HTML:
- Modern glassy UI + responsive layout (no Tailwind dependency)
- Day/Night theme toggle (saved in localStorage)
- Background "food" videos for day/night (placeholders included)
- Menu loads from a PHP JSON API (api/menu.php) fed by data/menu.json
- Search + category + dietary filters
- Cart (localStorage) + quick checkout summary (front-end only)
- Optional contact form endpoint (api/contact.php) logs submissions

Run locally (two easy options):
1) Using PHP built-in server (recommended)
   - Open Terminal in this folder
   - Run: php -S localhost:8000
   - Then open: http://localhost:8000

2) Upload to hosting
   - Upload the entire folder
   - Ensure PHP is enabled
   - Open index.php in the browser

Replace videos:
- assets/video/food-day.mp4
- assets/video/food-night.mp4
Use short looping food/cooking clips (mp4). Keep them muted.

Update menu items:
- Edit data/menu.json
- Images live in assets/img/menu/

NOTE:
- api/contact.php writes to data/contact_submissions.log
  If you want real email, wire it to SMTP (SendGrid/Mailgun) instead of mail().
