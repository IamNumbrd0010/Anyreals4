import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* 🔥 ELEMENTS */

const pendingList =
  document.getElementById("pendingList");

const totalUsers =
  document.getElementById("totalUsers");

const totalAgents =
  document.getElementById("totalAgents");

const pendingAgents =
  document.getElementById("pendingAgents");

const propertyForm =
  document.getElementById("propertyForm");

/* 🔐 PROTECT ADMIN PAGE */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "auth.html";
    return;
  }

  try {

    const userDoc = await getDoc(
      doc(db, "users", user.uid)
    );

    if (!userDoc.exists()) {
      alert("User data not found");
      return;
    }

    const data = userDoc.data();

    /* 🚫 BLOCK NON ADMINS */

    if (data.role !== "admin") {

      alert("Access denied");

      window.location.href = "index.html";

      return;
    }

    loadDashboard();

  } catch (error) {

    console.error(error);

    alert("Error loading admin panel");
  }
});

/* 📊 LOAD DASHBOARD */

async function loadDashboard() {

  try {

    const snapshot =
      await getDocs(collection(db, "users"));

    let users = [];

    snapshot.forEach(docItem => {

      users.push({
        id: docItem.id,
        ...docItem.data()
      });

    });

    totalUsers.innerText = users.length;

    totalAgents.innerText =
      users.filter(
        u => u.role === "agent"
      ).length;

    pendingAgents.innerText =
      users.filter(
        u => u.role === "pending-agent"
      ).length;

    renderPending(users);

  } catch (error) {

    console.error(error);

    alert("Error loading dashboard");
  }
}

/* 🧑‍⚖️ PENDING AGENTS */

function renderPending(users) {

  const pending = users.filter(
    u => u.role === "pending-agent"
  );

  pendingList.innerHTML = "";

  if (!pending.length) {

    pendingList.innerHTML =
      "<p>No pending applications</p>";

    return;
  }

  pending.forEach(user => {

    const card =
      document.createElement("div");

    card.className =
      "admin-user-card";

    card.innerHTML = `

      <h3>
        ${user.businessName || "No Business Name"}
      </h3>

      <p>
        <strong>Name:</strong>
        ${user.name}
      </p>

      <p>
        <strong>Email:</strong>
        ${user.email}
      </p>

      <p>
        <strong>Phone:</strong>
        ${user.phone || "-"}
      </p>

      <p>
        <strong>CAC:</strong>
        ${user.cac || "-"}
      </p>

      <button
        class="approve-btn"
        onclick="approveAgent('${user.id}')"
      >
        Approve
      </button>

      <button
        class="reject-btn"
        onclick="rejectAgent('${user.id}')"
      >
        Reject
      </button>
    `;

    pendingList.appendChild(card);

  });
}

/* ✅ APPROVE AGENT */

window.approveAgent = async (id) => {

  try {

    await updateDoc(
      doc(db, "users", id),
      {
        role: "agent",
        verificationStatus: "approved"
      }
    );

    alert("Agent approved");

    location.reload();

  } catch (error) {

    console.error(error);

    alert("Error approving agent");
  }
};

/* ❌ REJECT AGENT */

window.rejectAgent = async (id) => {

  try {

    await updateDoc(
      doc(db, "users", id),
      {
        role: "buyer",
        verificationStatus: "rejected"
      }
    );

    alert("Application rejected");

    location.reload();

  } catch (error) {

    console.error(error);

    alert("Error rejecting application");
  }
};

/* 🏠 ADD PROPERTY */

propertyForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    try {

      /* MAIN IMAGE */
      const mainFile =
        document.getElementById("mainImage").files[0];

      let mainImage = "";

      if (mainFile) {

        mainImage = await convertToBase64(mainFile);

      }

      /* GALLERY IMAGES */
      const galleryFiles =
        document.getElementById("galleryImages").files;

      let gallery = [];

      for (let file of galleryFiles) {

        const base64 =
          await convertToBase64(file);

        gallery.push(base64);
      }

      /* PROPERTY OBJECT */

      const property = {

        title:
          document.getElementById("title").value,

        price:
          Number(
            document.getElementById("price").value
          ),

        location:
          document.getElementById("location").value,

        address:
          document.getElementById("address").value,

        type:
          document.getElementById("type").value,

        image: mainImage,

        gallery: gallery,

        shortDescription:
          document.getElementById("shortDescription")
            .value,

        fullDescription:
          document.getElementById("fullDescription")
            .value,

        featured:
          document.getElementById("featured").checked,

        verified: true,

        status: "available",

        createdAt: Date.now()
      };

      await addDoc(
        collection(db, "properties"),
        property
      );

      alert("Property added successfully");

      propertyForm.reset();

    } catch (error) {

      console.error(error);

      alert("Error adding property");

    }
  }
);

/* 🔥 CONVERT IMAGE TO BASE64 */

function convertToBase64(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = error => reject(error);

  });
}

/* =========================
   LOAD ADMIN PROPERTIES
========================= */

const adminProperties =
  document.getElementById("adminProperties");

const propertySearch =
  document.getElementById("propertySearch");

let allProperties = [];

async function loadProperties() {

  const snapshot =
    await getDocs(collection(db, "properties"));

  allProperties = [];

  snapshot.forEach(docItem => {

    allProperties.push({
      id: docItem.id,
      ...docItem.data()
    });

  });

  renderProperties(allProperties);
}

/* =========================
   RENDER PROPERTIES
========================= */

function renderProperties(properties) {

  adminProperties.innerHTML = "";

  if (!properties.length) {

    adminProperties.innerHTML =
      "<p>No properties found</p>";

    return;
  }

  properties.forEach(property => {

    const card =
      document.createElement("div");

    card.className =
      "admin-property-card";

    card.innerHTML = `

      <img src="${property.image}">

      <div class="admin-property-content">

        <h3>${property.title}</h3>

        <p>
          ₦${property.price.toLocaleString()}
        </p>

        <p>${property.location}</p>

        <p>
          ${
            property.featured
              ? "⭐ Featured"
              : "Regular"
          }
        </p>

        <div class="admin-property-actions">

          <button
            class="feature-btn"
            onclick="toggleFeatured('${property.id}', ${property.featured})"
          >
            ${
              property.featured
                ? "Unfeature"
                : "Feature"
            }
          </button>

          <button
            class="delete-btn"
            onclick="deleteProperty('${property.id}')"
          >
            Delete
          </button>

        </div>

      </div>

    `;

    adminProperties.appendChild(card);

  });
}

/* =========================
   DELETE PROPERTY
========================= */

window.deleteProperty =
  async (id) => {

    const confirmDelete =
      confirm(
        "Delete this property?"
      );

    if (!confirmDelete) return;

    await deleteDoc(
      doc(db, "properties", id)
    );

    alert("Property deleted");

    loadProperties();
};

/* =========================
   FEATURE TOGGLE
========================= */

window.toggleFeatured =
  async (id, currentStatus) => {

    await updateDoc(
      doc(db, "properties", id),
      {
        featured: !currentStatus
      }
    );

    loadProperties();
};

/* =========================
   SEARCH
========================= */

propertySearch.addEventListener(
  "input",
  () => {

    const value =
      propertySearch.value.toLowerCase();

    const filtered =
      allProperties.filter(property =>
        property.title
          .toLowerCase()
          .includes(value)
      );

    renderProperties(filtered);
  }
);

/* INITIAL LOAD */

loadProperties();