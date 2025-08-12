
// Minimal cart + menu for Masalameal
const MENU = [
  { id: 1, name: "Masala Dosa", price: 5.50, img: "assets/img/dish1.jpg", veg: true },
  { id: 2, name: "Butter Chicken", price: 9.50, img: "assets/img/dish2.jpg", veg: false },
  { id: 3, name: "Paneer Tikka", price: 7.25, img: "assets/img/dish3.jpg", veg: true },
  { id: 4, name: "Hyderabadi Biryani", price: 8.75, img: "assets/img/dish4.jpg", veg: false },
  { id: 5, name: "Samosa (2pc)", price: 3.00, img: "assets/img/dish5.jpg", veg: true },
  { id: 6, name: "Gulab Jamun", price: 3.50, img: "assets/img/dish6.jpg", veg: true }
];

const cart = new Map();

function fmt(n){ return "£" + n.toFixed(2) }

function renderMenu(){
  const grid = document.querySelector("#menu-grid");
  grid.innerHTML = "";
  MENU.forEach(m => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${m.img}" alt="${m.name}">
      <div class="p">
        <h3>${m.name}</h3>
        <div class="muted">${m.veg ? "Vegetarian" : "Chef special"}</div>
        <div class="row">
          <div class="price">${fmt(m.price)}</div>
          <button class="add" data-id="${m.id}">Add</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll(".add").forEach(btn => {
    btn.addEventListener("click", e => addToCart(parseInt(e.currentTarget.dataset.id)));
  });
}

function addToCart(id){
  const item = MENU.find(x => x.id === id);
  const entry = cart.get(id) || { ...item, qty: 0 };
  entry.qty += 1;
  cart.set(id, entry);
  renderCart();
}

function changeQty(id, delta){
  if(!cart.has(id)) return;
  const entry = cart.get(id);
  entry.qty += delta;
  if(entry.qty <= 0) cart.delete(id); else cart.set(id, entry);
  renderCart();
}

function renderCart(){
  const list = document.querySelector("#cart-list");
  const empty = document.querySelector("#cart-empty");
  const total = document.querySelector("#cart-total");
  list.innerHTML = "";
  let sum = 0;

  if(cart.size === 0){
    empty.style.display = "block";
    total.style.display = "none";
    return;
  }
  empty.style.display = "none";

  Array.from(cart.values()).forEach(e => {
    sum += e.price * e.qty;
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div>${e.name} <span class="muted">x${e.qty}</span></div>
      <div class="qty">
        <button aria-label="decrease" onclick="changeQty(${e.id}, -1)">-</button>
        <button aria-label="increase" onclick="changeQty(${e.id}, 1)">+</button>
      </div>
      <div class="price">${fmt(e.price * e.qty)}</div>`;
    list.appendChild(row);
  });

  total.style.display = "flex";
  total.querySelector("strong").textContent = fmt(sum);
}

function goToMenu(){
  document.getElementById("menu").scrollIntoView({behavior: "smooth"});
}

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  renderCart();
});
