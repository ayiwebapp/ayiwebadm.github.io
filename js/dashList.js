const container = document.querySelector(".data");
    const deleteSelectedBtn = document.getElementById("deleteSelected");
    
const categoriesDiv = document.getElementById("categories"); // ajoute sa anwo

 let selectedKey = "";
 const selectedCheckboxes = new Set();

let allCategoryButtons = [];
let currentPage = 1;
const itemsPerPage = 9;

function loadAllCategories() {
  categoriesDiv.innerHTML = "";
  allCategoryButtons = [];
  currentPage = 1;
  
  db.ref().once("value").then(snapshot => {
    firebaseData = snapshot.val() || {};
    
    const keys = Object.keys(firebaseData).sort(); // triye alfabetik
    
    keys.forEach(key => {
      const data = firebaseData[key];
      if (!data || Object.keys(data).length === 0) {
        db.ref(key).remove().catch(console.error); // efase kategori vid
        return;
      }
      
      const btn = document.createElement("button");
      btn.textContent = `${key} (${Object.keys(data).length})`;
      btn.setAttribute("data-key", key.toLowerCase());
      
      btn.onclick = () => {
        document.querySelectorAll("#categories button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedKey = key;
        loadCategoryData(key);
      };
      
      allCategoryButtons.push(btn);
    });
    
    displayPage(currentPage); // afiche premye paj la
  });
}

function displayPage(page) {
  categoriesDiv.innerHTML = "";
  
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageButtons = allCategoryButtons.slice(start, end);
  
  pageButtons.forEach(btn => categoriesDiv.appendChild(btn));
  
  addPaginationControls(page);
}

function displayFilteredCategories(filterText) {
  categoriesDiv.innerHTML = "";
  allCategoryButtons.forEach(btn => {
    const key = btn.getAttribute("data-key");
    if (key.includes(filterText.toLowerCase())) {
      categoriesDiv.appendChild(btn);
    }
  });
}
loadAllCategories();

function addPaginationControls(current) {
  const totalPages = Math.ceil(allCategoryButtons.length / itemsPerPage);
  
  const controlsDiv = document.createElement("div");
  controlsDiv.style.display = "flex";
  controlsDiv.style.justifyContent = "center";
  controlsDiv.style.marginTop = "10px";
  controlsDiv.style.gap = "10px";
  
  if (current > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "⟵ Précédent";
    prevBtn.onclick = () => {
      currentPage--;
      displayPage(currentPage);
    };
    controlsDiv.appendChild(prevBtn);
  }
  
  if (current < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Suivant ⟶";
    nextBtn.onclick = () => {
      currentPage++;
      displayPage(currentPage);
    };
    controlsDiv.appendChild(nextBtn);
  }
  
  categoriesDiv.appendChild(controlsDiv);
}


document.getElementById("categorySearch").addEventListener("input", function() {
  const searchText = this.value.trim();
  displayFilteredCategories(searchText);
});




    const dbRef = firebase.database().ref();

dbRef.once("value").then(snapshot => {
  firebaseData = snapshot.val();
  const keys = Object.keys(firebaseData);
keys.forEach(key => {
  const data = firebaseData[key];
  if (!data || Object.keys(data).length === 0) {
    // Efase kategori a paske li pa gen okenn done
    firebase.database().ref(key).remove().then(() => {
      console.log(`✅ Kategori "${key}" efase paske li te vid.`);
    }).catch(err => {
      console.error(`❌ Erè pandan efasman kategori "${key}":`, err);
    });
    return; // Pa ajoute li nan bouton yo
  }
  
  // Sinon li gen done, afiche li kòm bouton
  const btn = document.createElement("button");
  const itemCount = Object.keys(data).length;
  btn.textContent = `${key} (${itemCount})`;
  btn.onclick = () => {
    document.querySelectorAll("#categories button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedKey = key;
    loadCategoryData(key);
  };
  categoriesDiv.appendChild(btn);
});
});

    function renderDetails(obj) {
      const ul = document.createElement("ul");
      for (const key in obj) {
        const li = document.createElement("li");
        if (typeof obj[key] === "object" && obj[key] !== null) {
          li.innerHTML = `<span class="key">${key}:</span>`;
          li.appendChild(renderDetails(obj[key]));
        } else {
          li.innerHTML = `<span class="key">${key}:</span> ${obj[key]}`;
        }
        ul.appendChild(li);
      }
      return ul;
    }

    function refreshSelected() {
      selectedCheckboxes.clear();
      deleteSelectedBtn.style.display = "none";
    }

function loadCategoryData(category) {
  const data = firebaseData[category];
  container.innerHTML = "";
  refreshSelected();
  
  if (data && typeof data === "object") {
    deleteSelectedBtn.style.display = "inline-block";
    
    Object.entries(data).forEach(([itemKey, itemVal]) => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("data-key", itemKey);
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "checkbox";
      checkbox.onclick = () => {
        if (checkbox.checked) {
          selectedCheckboxes.add(itemKey);
        } else {
          selectedCheckboxes.delete(itemKey);
        }
      };
      
      const title = itemVal.Title || itemVal.name || itemVal.nom || itemKey;
      const summary = itemVal.summary || itemVal.description || "";
      
      const h4 = document.createElement("h4");
      h4.textContent = title;
      const p = document.createElement("p");
      p.textContent = summary;
      
      const toggle = document.createElement("span");
      toggle.className = "toggle";
      toggle.textContent = "🔽 Klike pou wè plis detay...";
      
      const detailDiv = document.createElement("div");
      detailDiv.className = "hidden";
      if (typeof itemVal === "object") {
        detailDiv.appendChild(renderDetails(itemVal));
      }
      
      toggle.onclick = () => {
        detailDiv.classList.toggle("hidden");
        toggle.textContent = detailDiv.classList.contains("hidden") ?
          "🔽 Klike pou wè plis detay..." :
          "🔼 Klike pou kache detay";
      };
      
      // Tout moun ka modifye / efase
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";
      
      const modifyBtn = document.createElement("button");
      modifyBtn.className = "modify";
      modifyBtn.innerHTML = "✏️ Modifye";
      
      modifyBtn.onclick = () => {
        detailDiv.innerHTML = "";
        detailDiv.classList.remove("hidden");
        
        const form = document.createElement("form");
        const newData = {};
        
        for (const key in itemVal) {
          const value = itemVal[key];
          const label = document.createElement("label");
          label.textContent = key + ": ";
          
          const input = document.createElement("input");
          input.type = "text";
          input.value = value;
          input.style.marginBottom = "5px";
          input.style.display = "block";
          input.style.width = "100%";
          
          label.appendChild(input);
          form.appendChild(label);
          newData[key] = input;
        }
        
        const saveBtn = document.createElement("button");
        saveBtn.type = "submit";
        saveBtn.textContent = "✅ Sove";
        saveBtn.style.backgroundColor = "green";
        saveBtn.style.color = "white";
        saveBtn.style.marginRight = "5px";
        
        const cancelBtnEdit = document.createElement("button");
        cancelBtnEdit.type = "button";
        cancelBtnEdit.textContent = "❌ Anile";
        cancelBtnEdit.className = "cancel";
        
        form.appendChild(saveBtn);
        form.appendChild(cancelBtnEdit);
        detailDiv.appendChild(form);
        
        form.onsubmit = (e) => {
          e.preventDefault();
          const updatedData = {};
          for (const key in newData) {
            updatedData[key] = newData[key].value;
          }
          
          firebase.database().ref(`${selectedKey}/${itemKey}`).set(updatedData).then(() => {
            alert("✔️ Done yo mete ajou avèk siksè.");
            h4.textContent = updatedData.Title || updatedData.name || updatedData.nom || itemKey;
            p.textContent = updatedData.summary || updatedData.description || "";
            detailDiv.innerHTML = "";
            detailDiv.appendChild(renderDetails(updatedData));
          }).catch(error => {
            alert("❌ Erè pandan mete ajou: " + error.message);
          });
        };
        
        cancelBtnEdit.onclick = () => {
          detailDiv.innerHTML = "";
          detailDiv.appendChild(renderDetails(itemVal));
          detailDiv.classList.add("hidden");
        };
      };
      
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete";
      deleteBtn.innerHTML = "🗑️ Efase";
      
      deleteBtn.onclick = () => {
        if (confirm("Ou sèten ou vle efase atik sa?")) {
          firebase.database().ref(`${selectedKey}/${itemKey}`).remove().then(() => {
            card.remove();
            alert("✔️ Efase ak siksè.");
            selectedCheckboxes.delete(itemKey);
            if (selectedCheckboxes.size === 0) {
              deleteSelectedBtn.style.display = "none";
            }
          }).catch(error => {
            alert("❌ Erè pandan efasman: " + error.message);
          });
        }
      };
      
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "cancel";
      cancelBtn.innerHTML = "❌ Anile";
      cancelBtn.onclick = () => detailDiv.classList.add("hidden");
      
      actionsDiv.appendChild(modifyBtn);
      actionsDiv.appendChild(deleteBtn);
      actionsDiv.appendChild(cancelBtn);
      
      card.appendChild(h4);
      if (summary) card.appendChild(p);
      card.appendChild(toggle);
      card.appendChild(detailDiv);
      card.appendChild(checkbox);
      card.appendChild(actionsDiv);
      container.appendChild(card);
    });
  } else {
    container.innerHTML = "<p>Pa gen done pou kategori sa.</p>";
    deleteSelectedBtn.style.display = "none";
  }
}

    deleteSelectedBtn.onclick = () => {
      if (selectedCheckboxes.size === 0) {
        alert("✅ Pa gen anyen make.");
        return;
      }

      if (confirm(`Ou vle efase ${selectedCheckboxes.size} atik?`)) {
        selectedCheckboxes.forEach(key => {
          firebase.database().ref(`${selectedKey}/${key}`).remove().then(() => {
            const item = document.querySelector(`[data-key='${key}']`);
            if (item) item.remove();
          }).catch(error => {
            alert("❌ Erè pandan efasman: " + error.message);
          });
        });
        alert("✔️ Tout sa ki make yo efase.");
        refreshSelected();
      }
    };

    deleteSelectedBtn.style.display = "none";
  
