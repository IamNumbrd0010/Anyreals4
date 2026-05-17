import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ELEMENTS */

const mainImage =
  document.getElementById("mainImage");

const thumbnails =
  document.getElementById("thumbnails");

const propertyTitle =
  document.getElementById("propertyTitle");

const propertyPrice =
  document.getElementById("propertyPrice");

const propertyLocation =
  document.getElementById("propertyLocation");

const propertyDescription =
  document.getElementById("propertyDescription");

const similarGrid =
  document.getElementById("similarGrid");

/* LOAD PROPERTY */

const property =
  JSON.parse(
    localStorage.getItem("selectedProperty")
  );

if (!property) {

  window.location.href = "properties.html";

}

/* MAIN INFO */

mainImage.src = property.image;

propertyTitle.innerText =
  property.title;

propertyPrice.innerText =
  `₦${property.price.toLocaleString()}`;

propertyLocation.innerText =
  property.location;

propertyDescription.innerText =
  property.fullDescription;

/* GALLERY */

thumbnails.innerHTML = "";

if (property.gallery?.length)
console.log(property.gallery); {

  property.gallery.forEach(img => {

    const thumb =
      document.createElement("img");

    thumb.src = img;

    thumb.onclick = () => {

      mainImage.src = img;

    };

    thumbnails.appendChild(thumb);

  });
}

/* LOAD SIMILAR PROPERTIES */

loadSimilar();

async function loadSimilar() {

  const snapshot =
    await getDocs(collection(db, "properties"));

  let properties = [];

  snapshot.forEach(doc => {

    properties.push({
      id: doc.id,
      ...doc.data()
    });

  });

  const similar =
    properties.filter(p =>
      p.type === property.type &&
      p.id !== property.id
    ).slice(0, 3);

  similarGrid.innerHTML = "";

  similar.forEach(p => {

    similarGrid.innerHTML += `

      <div class="card">

        <img src="${p.image}">

        <div class="card-content">

          <h3>
            ₦${p.price.toLocaleString()}
          </h3>

          <p>${p.title}</p>

          <small>${p.location}</small>

        </div>

      </div>

    `;
  });
}