<?php
  // Simple PHP front page.
  $appName = 'MasalaMeal';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title><?php echo htmlspecialchars($appName); ?> • Modern Menu</title>
  <meta name="description" content="A modern South Indian restaurant menu with day/night theme, background food videos, search and filters." />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="assets/css/app.css" />
  <script defer src="assets/js/app.js"></script>
</head>
<body>
  <!-- Background video layer (day/night) -->
  <div class="bg-layer" aria-hidden="true">
    <video id="bgVideoDay" class="bg-video" autoplay muted loop playsinline preload="metadata" poster="assets/img/menu/meals_south.jpg">
      <!-- Replace these with your own food videos (mp4/webm) -->
      <source src="assets/video/food-day.mp4" type="video/mp4" />
    </video>
    <video id="bgVideoNight" class="bg-video" autoplay muted loop playsinline preload="metadata" poster="assets/img/menu/chicken_biryani.jpg">
      <source src="assets/video/food-night.mp4" type="video/mp4" />
    </video>
    <div class="bg-overlay"></div>
  </div>

  <header class="topbar">
    <a class="brand" href="#">
      <span class="logo">MM</span>
      <span>
        <span class="brand-title"><?php echo htmlspecialchars($appName); ?></span>
        <span class="brand-sub">South Indian • Modern Menu</span>
      </span>
    </a>

    <nav class="navlinks" aria-label="Primary">
      <a href="#menu">Menu</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>

    <div class="actions">
      <button id="themeToggle" class="chip" type="button" aria-label="Toggle theme">
        <span class="chip-ic">🌗</span>
        <span class="chip-tx">Day</span>
      </button>

      <button id="motionToggle" class="chip" type="button" aria-label="Toggle background video">
        <span class="chip-ic">🎬</span>
        <span class="chip-tx">Video</span>
      </button>

      <button id="cartBtn" class="chip" type="button" aria-label="Open cart">
        <span class="chip-ic">🧺</span>
        <span class="chip-tx">Cart</span>
        <span id="cartCount" class="pill">0</span>
      </button>
    </div>
  </header>

  <main class="shell">
    <section class="hero" role="banner">
      <div class="hero-copy">
        <h1>South Indian, served clean.</h1>
        <p>
          Search fast, filter smart, add to cart, and keep the vibe with a day/night food-video background.
          This is still simple HTML/CSS/JS + PHP — just designed like a 2026 website.
        </p>

        <div class="hero-controls">
          <label class="search">
            <span class="sr-only">Search menu</span>
            <input id="searchInput" type="search" placeholder="Search dosa, idli, biryani…" autocomplete="off" />
          </label>

          <div class="filterrow">
            <button class="filter" data-filter="all" type="button">All</button>
            <button class="filter" data-filter="veg" type="button">Veg</button>
            <button class="filter" data-filter="nonveg" type="button">Non‑veg</button>
            <button class="filter" data-filter="bestseller" type="button">Bestseller</button>
            <button class="filter" data-filter="spicy" type="button">Spicy</button>
            <button class="filter" data-filter="gluten_free" type="button">GF</button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat"><span class="stat-k">⚡</span><span class="stat-v">Instant search</span></div>
          <div class="stat"><span class="stat-k">🧾</span><span class="stat-v">Cart + checkout</span></div>
          <div class="stat"><span class="stat-k">🌗</span><span class="stat-v">Day/Night</span></div>
        </div>
      </div>

      <div class="hero-card">
        <div class="hero-card-top">
          <h2 id="menu">Menu</h2>
          <div class="seg">
            <button class="segbtn" data-cat="all" type="button">All</button>
            <button class="segbtn" data-cat="Veg" type="button">Veg</button>
            <button class="segbtn" data-cat="Non-Veg" type="button">Non‑veg</button>
            <button class="segbtn" data-cat="Desserts" type="button">Desserts</button>
          </div>
        </div>

        <div id="menuGrid" class="grid" aria-live="polite">
          <!-- populated by JS -->
        </div>

        <div id="emptyState" class="empty" hidden>
          <div class="empty-ic">🍽️</div>
          <div class="empty-tx">
            <strong>No matches.</strong>
            <div>Try a different keyword or remove filters.</div>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="panel">
      <h3>About</h3>
      <p>
        This project is structured like a real product: data lives in <code>data/menu.json</code>,
        PHP exposes it as an API (<code>api/menu.php</code>), and the UI renders it with modern JS.
      </p>
      <p>
        Two examples of “advanced but practical” tech here:
        (1) a small API layer (PHP) so you can later connect a database, and
        (2) a stateful UI (theme + cart in localStorage) so it behaves like an app.
      </p>
    </section>

    <section id="contact" class="panel">
      <h3>Contact</h3>
      <form id="contactForm" class="form" method="post" action="api/contact.php" novalidate>
        <div class="fieldrow">
          <label class="field">
            <span>Name</span>
            <input name="name" required minlength="2" placeholder="Your name" />
          </label>
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
        </div>
        <label class="field">
          <span>Message</span>
          <textarea name="message" rows="4" required minlength="10" placeholder="Tell us what you want…"></textarea>
        </label>
        <div class="form-actions">
          <button class="btn" type="submit">Send</button>
          <span id="contactStatus" class="muted" role="status" aria-live="polite"></span>
        </div>
      </form>
      <p class="muted">Note: <code>api/contact.php</code> logs messages to <code>data/contact_submissions.log</code> (no email config needed).</p>
    </section>

    <footer class="footer">
      <div>© <?php echo date('Y'); ?> <?php echo htmlspecialchars($appName); ?></div>
      <div class="muted">Built with HTML + CSS + JS + PHP</div>
    </footer>
  </main>

  <!-- Item modal -->
  <dialog id="itemModal" class="modal">
    <form method="dialog" class="modal-inner">
      <button class="modal-x" value="cancel" aria-label="Close">✕</button>
      <img id="modalImg" class="modal-img" alt="" />
      <div class="modal-body">
        <div class="modal-title">
          <h3 id="modalName"></h3>
          <div id="modalPrice" class="price"></div>
        </div>
        <div id="modalBadges" class="badges"></div>
        <p id="modalDesc" class="muted"></p>
        <div class="modal-actions">
          <button id="modalAdd" class="btn" value="default" type="button">Add to cart</button>
          <button class="btn ghost" value="cancel">Close</button>
        </div>
      </div>
    </form>
  </dialog>

  <!-- Cart drawer -->
  <dialog id="cart" class="drawer">
    <form method="dialog" class="drawer-inner">
      <div class="drawer-top">
        <strong>Cart</strong>
        <button class="modal-x" value="cancel" aria-label="Close">✕</button>
      </div>
      <div id="cartItems" class="cart-items"></div>
      <div class="drawer-bottom">
        <div class="totals">
          <div class="muted">Total</div>
          <div id="cartTotal" class="total">£0.00</div>
        </div>
        <button id="checkoutBtn" class="btn" type="button">Checkout (demo)</button>
        <p class="muted tiny">Demo checkout: it just clears the cart. Hook Stripe later if you want.</p>
      </div>
    </form>
  </dialog>
</body>
</html>
