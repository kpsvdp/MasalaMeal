
import React, { useMemo, useState, useEffect } from 'react'
import { ShoppingCart, Search, IndianRupee, Flame, Leaf, Minus, Plus, X, Bike, MapPin, Clock, Phone, Utensils } from 'lucide-react'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

const MENU = [
  { id: 'pavbhaji', name: 'Pav Bhaji', price: 189, veg: true, spice: 2, category: 'Starters', emoji: '🍛', desc: 'Buttery buns with spicy mashed veggies' },
  { id: 'paneertikka', name: 'Paneer Tikka', price: 269, veg: true, spice: 3, category: 'Starters', emoji: '🧀', desc: 'Char-grilled cottage cheese, mint chutney' },
  { id: 'tandoori', name: 'Tandoori Chicken', price: 349, veg: false, spice: 3, category: 'Starters', emoji: '🍗', desc: 'Clay-oven chicken, smoky & juicy' },
  { id: 'butterchicken', name: 'Butter Chicken', price: 329, veg: false, spice: 1, category: 'Mains', emoji: '🥣', desc: 'Creamy tomato gravy, tender chicken' },
  { id: 'palakpaneer', name: 'Palak Paneer', price: 289, veg: true, spice: 1, category: 'Mains', emoji: '🥬', desc: 'Spinach gravy with paneer cubes' },
  { id: 'cholebhature', name: 'Chole Bhature', price: 239, veg: true, spice: 2, category: 'Mains', emoji: '🥯', desc: 'Fluffy bhature & spicy chickpeas' },
  { id: 'hyd-biryani', name: 'Hyderabadi Biryani', price: 329, veg: false, spice: 3, category: 'Biryani', emoji: '🍚', desc: 'Fragrant basmati rice, tender meat' },
  { id: 'veg-biryani', name: 'Veg Dum Biryani', price: 289, veg: true, spice: 2, category: 'Biryani', emoji: '🥕', desc: 'Slow-cooked veggies & rice' },
  { id: 'garlicnaan', name: 'Garlic Naan', price: 79, veg: true, spice: 0, category: 'Breads', emoji: '🫓', desc: 'Leavened bread, garlic & butter' },
  { id: 'butternaan', name: 'Butter Naan', price: 69, veg: true, spice: 0, category: 'Breads', emoji: '🫓', desc: 'Soft naan with butter' },
  { id: 'gulabjamun', name: 'Gulab Jamun', price: 139, veg: true, spice: 0, category: 'Desserts', emoji: '🍮', desc: 'Milk-solid dumplings in syrup' },
  { id: 'rasmalai', name: 'Rasmalai', price: 169, veg: true, spice: 0, category: 'Desserts', emoji: '🍰', desc: 'Saffron milk & soft patties' },
  { id: 'masalatea', name: 'Masala Chai', price: 59, veg: true, spice: 0, category: 'Beverages', emoji: '🫖', desc: 'Spiced tea, comforting' },
  { id: 'lassi', name: 'Mango Lassi', price: 119, veg: true, spice: 0, category: 'Beverages', emoji: '🥭', desc: 'Sweet mango yogurt drink' },
]
const CATEGORIES = ['All','Starters','Mains','Biryani','Breads','Desserts','Beverages']

export default function App(){
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [vegOnly, setVegOnly] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState({})
  const [orderType, setOrderType] = useState('delivery')
  const [payment, setPayment] = useState('COD')
  const [slot, setSlot] = useState('ASAP')
  const [promo, setPromo] = useState('')

  useEffect(()=>{
    const saved = localStorage.getItem('mm_cart')
    if(saved) setCart(JSON.parse(saved))
  },[])
  useEffect(()=>{
    localStorage.setItem('mm_cart', JSON.stringify(cart))
  },[cart])

  const items = useMemo(()=> MENU
    .filter(m => category==='All' || m.category===category)
    .filter(m => !vegOnly || m.veg)
    .filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
  ,[query,category,vegOnly])

  const cartList = useMemo(()=> Object.entries(cart).map(([id,qty])=>({...MENU.find(m=>m.id===id), qty})),[cart])
  const subtotal = useMemo(()=> cartList.reduce((s,i)=> s + i.price * i.qty, 0), [cartList])
  const deliveryFee = orderType==='delivery' ? (subtotal>=699 || subtotal===0 ? 0 : 49) : 0
  const promoDiscount = promo.toUpperCase()==='WELCOME50' && subtotal>=500 ? 50 : 0
  const total = Math.max(0, subtotal + deliveryFee - promoDiscount)

  const add = (id)=> setCart(c => ({...c, [id]: (c[id]||0)+1}))
  const sub = (id)=> setCart(c => { const q=(c[id]||0)-1; const n={...c}; if(q<=0) delete n[id]; else n[id]=q; return n })
  const remove = (id)=> setCart(c => { const n={...c}; delete n[id]; return n })
  const clearCart = ()=> { setCart({}); setPromo('') }

  const placeOrder = (e)=>{
    e.preventDefault()
    if(cartList.length===0) return alert('Your cart is empty.')
    const data = new FormData(e.target)
    const name = data.get('name')
    const phone = data.get('phone')
    if(!name || !phone) return alert('Please enter name and phone.')
    alert(`Thank you, ${name}! Your order total is ${INR.format(total)}. (Demo only)`)
    clearCart(); setCartOpen(false)
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-30 glass">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2 font-extrabold text-xl">
            <Utensils className="w-6 h-6"/><span>MasalaMitra</span>
            <span className="badge ml-2">Authentic Indian</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline hidden md:inline-flex" onClick={()=>setVegOnly(v=>!v)}>
              <Leaf className="w-4 h-4 mr-2"/>{vegOnly?'Veg only':'All dishes'}
            </button>
            <button className="btn btn-primary relative" onClick={()=>setCartOpen(true)}>
              <ShoppingCart className="w-4 h-4 mr-2"/>Cart
              {cartList.length>0 && <span className="absolute -top-2 -right-2 text-xs bg-orange-600 text-white rounded-full px-2">{cartList.reduce((s,i)=>s+i.qty,0)}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container pt-10 pb-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">From Tandoor to Table — <span className="text-orange-600">Order Indian Favourites</span></h1>
            <p className="mt-3 text-slate-700">Freshly cooked with authentic spices. Free delivery above {INR.format(699)}. Use <b>WELCOME50</b> on ₹500+.</p>
            <div className="mt-4 flex gap-2">
              <a href="#menu" className="btn btn-primary">Browse Menu</a>
              <button className="btn btn-outline" onClick={()=>setCartOpen(true)}><ShoppingCart className="w-4 h-4 mr-2"/>View Cart</button>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4"/>11 AM – 11 PM</span>
              <span className="inline-flex items-center gap-2"><Phone className="w-4 h-4"/>080-123-4567</span>
            </div>
          </div>
          <div className="rounded-3xl bg-orange-100 p-8 text-center shadow-inner">
            <div className="text-7xl md:text-8xl">🍛🫓🍗</div>
            <p className="mt-2 text-slate-700">Spice-kissed meals, delivered fast.</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section id="menu" className="border-t bg-white">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input className="input pl-9" placeholder="Search dishes…" value={query} onChange={e=>setQuery(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={()=>setCategory(c)} className={`btn ${category===c?'btn-primary':'btn-outline'}`}>{c}</button>
              ))}
              <button className={`btn ${vegOnly?'btn-primary':'btn-outline'}`} onClick={()=>setVegOnly(v=>!v)}><Leaf className="w-4 h-4 mr-2"/>{vegOnly?'Veg only':'Include non-veg'}</button>
            </div>
          </div>

          {/* Menu grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {items.map(item => (
              <div key={item.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold flex items-center gap-2"><span className="text-2xl">{item.emoji}</span>{item.name}</div>
                  <div className="flex items-center gap-2">
                    {item.veg && <span className="badge inline-flex items-center gap-1"><Leaf className="w-3 h-3"/>Veg</span>}
                    {item.spice>0 && <span className="badge inline-flex items-center gap-1"><Flame className="w-3 h-3"/>Spice {item.spice}</span>}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-semibold inline-flex items-center"><IndianRupee className="w-4 h-4 mr-1"/>{item.price}</div>
                  {cart[item.id] ? (
                    <div className="flex items-center gap-2">
                      <button className="btn btn-outline" onClick={()=>sub(item.id)}><Minus className="w-4 h-4"/></button>
                      <span className="w-6 text-center">{cart[item.id]}</span>
                      <button className="btn btn-primary" onClick={()=>add(item.id)}><Plus className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={()=>add(item.id)}>Add</button>
                  )}
                </div>
              </div>
            ))}
            {items.length===0 && <div className="col-span-full text-center text-slate-500 py-16">No dishes match your search.</div>}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-orange-50/60 border-y">
        <div className="container py-10 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">About MasalaMitra</h2>
            <p className="text-slate-700">We celebrate India’s regional flavours — from smoky tandoor starters to comforting curries and dum biryani. Fresh produce and house-ground spices.</p>
            <ul className="list-disc ml-5 mt-3 text-slate-700 space-y-2">
              <li>Hygienic kitchen • FSSAI compliant</li>
              <li>Contactless delivery available</li>
              <li>Custom spice levels on request</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">Outlet Info</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="inline-flex items-center gap-2"><MapPin className="w-4 h-4"/>Indiranagar, Bengaluru</div>
              <div className="inline-flex items-center gap-2"><Clock className="w-4 h-4"/>11:00 – 23:00</div>
              <div className="inline-flex items-center gap-2"><Phone className="w-4 h-4"/>080-123-4567</div>
              <div className="inline-flex items-center gap-2"><Bike className="w-4 h-4"/>Free delivery ≥ {INR.format(699)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Footer */}
      <section id="contact" className="bg-white">
        <div className="container py-10 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Catering & Events</h2>
            <p className="text-slate-700">Planning a party, office lunch, or wedding sangeet? We’ve got full-service catering and curated party boxes.</p>
          </div>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Thanks! We will contact you soon.')}} className="glass rounded-2xl p-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="block text-sm mb-1">Name</label><input className="input" placeholder="Your name"/></div>
              <div><label className="block text-sm mb-1">Phone</label><input className="input" placeholder="9xxxxxxxxx"/></div>
            </div>
            <div><label className="block text-sm mb-1">Message</label><input className="input" placeholder="Tell us about your event"/></div>
            <button className="btn btn-primary">Send Enquiry</button>
          </form>
        </div>
        <footer className="border-t">
          <div className="container py-6 text-sm flex flex-col md:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} MasalaMitra. All rights reserved.</p>
            <p className="text-slate-500">Demo UI — Frontend only (no backend).</p>
          </div>
        </footer>
      </section>

      {/* Drawer */}
      <div className={"drawer " + (cartOpen?'open':'')} aria-hidden={!cartOpen}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Order</h3>
            <button className="btn btn-outline" onClick={()=>setCartOpen(false)}><X className="w-4 h-4 mr-1"/>Close</button>
          </div>
          <div className="p-4 flex-1 overflow-auto space-y-3">
            {cartList.length===0 && <p className="text-sm text-slate-500">Your cart is empty. Add something yummy!</p>}
            {cartList.map(item => (
              <div key={item.id} className="border rounded-xl p-3 flex items-center gap-3">
                <div className="text-2xl">{item.emoji}</div>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">{item.name}{item.veg && <Leaf className="w-3 h-3 text-green-600"/>}{item.spice>0 && <Flame className="w-3 h-3 text-orange-600"/>}</div>
                  <div className="text-xs text-slate-500">{INR.format(item.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline" onClick={()=>sub(item.id)}><Minus className="w-4 h-4"/></button>
                  <span className="w-6 text-center">{item.qty}</span>
                  <button className="btn btn-primary" onClick={()=>add(item.id)}><Plus className="w-4 h-4"/></button>
                  <button className="btn btn-outline" onClick={()=>remove(item.id)}><X className="w-4 h-4"/></button>
                </div>
              </div>
            ))}

            {cartList.length>0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Promo:</span>
                  <input className="input" placeholder="WELCOME50" value={promo} onChange={e=>setPromo(e.target.value)} />
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm space-y-1">
                  <Row label="Subtotal" value={INR.format(subtotal)} />
                  <Row label={orderType==='delivery'?'Delivery':'Pickup'} value={deliveryFee===0 ? (orderType==='delivery'?'Free':'—') : INR.format(deliveryFee)} />
                  {promoDiscount>0 && <Row label="Promo" value={`- ${INR.format(promoDiscount)}`} />}
                  <div className="border-t mt-2 pt-2 flex items-center justify-between font-semibold">
                    <span>Total</span><span>{INR.format(total)}</span>
                  </div>
                  {orderType==='delivery' && subtotal<699 && subtotal>0 && (
                    <p className="text-[11px] mt-1 text-slate-500">Add {INR.format(699 - subtotal)} more for free delivery.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className={"btn "+(orderType==='delivery'?'btn-primary':'btn-outline')} onClick={()=>setOrderType('delivery')}><Bike className="w-4 h-4 mr-2"/>Delivery</button>
                  <button className={"btn "+(orderType==='pickup'?'btn-primary':'btn-outline')} onClick={()=>setOrderType('pickup')}><MapPin className="w-4 h-4 mr-2"/>Pickup</button>
                </div>
                <form onSubmit={placeOrder} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-sm mb-1">Name</label><input name="name" className="input" placeholder="Your name"/></div>
                    <div><label className="block text-sm mb-1">Phone</label><input name="phone" className="input" placeholder="9xxxxxxxxx"/></div>
                  </div>
                  {orderType==='delivery' && (
                    <div><label className="block text-sm mb-1">Address</label><input name="address" className="input" placeholder="House, Street, Area, City"/></div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-sm mb-1">Time</label>
                      <select value={slot} onChange={e=>setSlot(e.target.value)} className="input">
                        <option value="ASAP">ASAP (30–40 min)</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="13:30">1:30 PM</option>
                        <option value="19:00">7:00 PM</option>
                      </select>
                    </div>
                    <div><label className="block text-sm mb-1">Payment</label>
                      <select value={payment} onChange={e=>setPayment(e.target.value)} className="input">
                        <option value="COD">Cash on Delivery</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card on Delivery</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">Place order • {INR.format(total)}</button>
                  <button type="button" className="btn btn-outline w-full" onClick={clearCart}>Clear cart</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      {cartOpen && <div className="fixed inset-0 bg-black/30" onClick={()=>setCartOpen(false)} />}
    </div>
  )
}

function Row({label, value}){
  return <div className="flex items-center justify-between py-0.5"><span className="text-slate-600">{label}</span><span className="font-medium">{value}</span></div>
}
