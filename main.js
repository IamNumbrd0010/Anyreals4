// NAV MENU TOGGLE
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navMenu");

toggle.onclick = () => {
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
};

// SEARCH FUNCTION
function handleSearch() {
  const location = document.getElementById("searchLocation").value;
  const type = document.getElementById("searchType").value;
  const price = document.getElementById("searchPrice").value;

  const params = new URLSearchParams({
    location,
    type,
    price
  });

  window.location.href = "properties.html?" + params.toString();
}

function goToProperties() {
  window.location.href = "properties.html";
}
// RECENTLY VIEWED
function loadRecentlyViewed() {
    const recentSection = document.getElementById("recentSection");
    const recentGrid = document.getElementById("recentGrid");
  
    let viewed = JSON.parse(localStorage.getItem("viewed")) || [];
  
    if (viewed.length === 0) return;
  
    // load properties
    fetchProperties().then(props => {
      let recentItems = viewed
        .map(id => props.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 6);
  
      recentGrid.innerHTML = "";
  
      recentItems.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
  
        card.innerHTML = `
          <img src="${p.image}">
          <div class="card-content">
            <h4>₦${p.price.toLocaleString()}</h4>
            <p>${p.title}</p>
          </div>
        `;
  
        card.onclick = () => {
          localStorage.setItem("selectedProperty", JSON.stringify(p));
          window.location.href = "property.html";
        };
  
        recentGrid.appendChild(card);
      });
  
      recentSection.style.display = "block";
    });
  }
  function fetchProperties() {
    return new Promise(resolve => {
      resolve(properties);
    });
  }
  loadRecentlyViewed();