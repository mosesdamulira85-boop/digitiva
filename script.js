
const API_URL = "https://digitiva-payments.mosesdamulira85.workers.dev";

const products = [
  {
    id: 1,
    name: "AI Video Creator Starter Kit",
    category: "AI",
    description: "A 21-page beginner's guide with 50 AI video prompts, 10 Shorts scripts, a 30-day content calendar and practical checklists.",
    price: 9.99,
    icon: "🎬"
  }
];

let cart = [];
let activeCategory = "All";

function renderProducts() {
  const grid = document.getElementById("product-grid");
  const search = document.getElementById("search-input").value.toLowerCase();

  const filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = filtered.length
    ? filtered.map(product => `
      <article class="product-card">
        <div class="product-icon">${product.icon}</div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <button onclick="addToCart(${product.id})">
          Add to Cart
        </button>
      </article>
    `).join("")
    : "<p>No matching products found.</p>";
}

function filterProducts(category) {
  activeCategory = category;
  renderProducts();
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  cart.push(product);
  updateCart();
  alert(product.name + " added to your cart!");
}

function updateCart() {
  document.getElementById("cart-count").textContent = cart.length;

  const items = document.getElementById("cart-items");

  items.innerHTML = cart.length
    ? cart.map((item, index) => `
      <div class="cart-item">
        <p>${item.name} — $${item.price.toFixed(2)}</p>
        <button onclick="removeFromCart(${index})">Remove</button>
      </div>
    `).join("")
    : "<p>Your cart is empty.</p>";

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  document.getElementById("cart-total").textContent =
    "Total: $" + total.toFixed(2);

  if (cart.length > 0) {
    items.insertAdjacentHTML("beforeend", `
      <button id="checkout-button" onclick="startCheckout()">
        Checkout with JJuma — $${total.toFixed(2)}
      </button>
    `);
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function showCart() {
  updateCart();
  document.getElementById("cart-modal").style.display = "flex";
}

function closeCart() {
  document.getElementById("cart-modal").style.display = "none";
}

async function startCheckout() {
  if (cart.length !== 1) {
    alert("Please keep only one product in your cart for checkout.");
    return;
  }

  const customerName = prompt("Enter your full name:");
  if (!customerName || customerName.trim().length < 2) {
    alert("Please enter your full name.");
    return;
  }

  const customerEmail = prompt("Enter your email address:");
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
    alert("Please enter a valid email address.");
    return;
  }

  const button = document.getElementById("checkout-button");
  if (button) {
    button.disabled = true;
    button.textContent = "Connecting to JJuma...";
  }

  try {
    const response = await fetch(`${API_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim()
      })
    });

    const result = await response.json();

    if (!response.ok || !result.payment_url) {
      throw new Error(result.error || "Checkout could not start.");
    }

    window.location.href = result.payment_url;

  } catch (error) {
    alert(error.message || "Connection failed. Please try again.");

    if (button) {
      button.disabled = false;
      button.textContent = "Try Checkout Again";
    }
  }
}

renderProducts();
updateCart();
