// 📦 Ouvri modal pou sove paj yo
function openSaveDialog() {
    document.getElementById('saveModal').style.display = 'block';
  }

  let currentEditor = null;

document.addEventListener('focusin', e => {
  if (e.target.classList.contains('editor')) {
    currentEditor = e.target;
  }
});

  
  function saveAllPages() {
    const title = document.getElementById('noteTitle').value.trim();
    const folder = document.getElementById('folderName').value.trim();
  
    if (!title || !folder) {
      alert("Veuillez entrer un titre et un dossier.");
      return;
    }
  
    // Rekipere tout paj yo
    const pages = document.querySelectorAll('.page .editor');
    const contents = Array.from(pages).map(p => p.innerHTML.trim());
  
    const note = {
      title,
      contents,
      date: new Date().toLocaleString()
    };
  
    let data = JSON.parse(localStorage.getItem('notesFolders') || '{}');
  
    if (!data[folder]) data[folder] = [];
  
    // Rechèch si tit deja egziste
    const existingIndex = data[folder].findIndex(n => n.title === title);
    
    
  
    if (existingIndex !== -1) {
      // Si li egziste: ranplase
      data[folder][existingIndex] = note;
    } else {
      // Sinon: ajoute nouvo
      data[folder].push(note);
    }
  
    // Sove
    localStorage.setItem('notesFolders', JSON.stringify(data));
  
    // Netwayaj apre sove
    document.getElementById('saveModal').style.display = 'none';
    document.getElementById('noteTitle').value = '';
    document.getElementById('folderName').value = '';
    showSavedNotes();
  }
  
  
  // 📂 Montre tout nòt ki sove yo, klase pa katab
  function showSavedNotes() {
    const savedNotesList = document.getElementById('savedNotesList');
    savedNotesList.innerHTML = '';
  
    const data = JSON.parse(localStorage.getItem('notesFolders') || '{}');
    let modified = false;
  
    for (const folder in data) {
      if (!data[folder] || data[folder].length === 0) {
        delete data[folder];
        modified = true;
        continue;
      }
  
      const folderDiv = document.createElement('div');
  
      const header = document.createElement('h4');
      header.className = 'folder-header';
      header.onclick = () => toggleFolder(folder);
      header.innerHTML = `📁 ${folder} <span class="note-count">(${data[folder].length} nòt)</span>`;
  
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-folder-btn';
      deleteBtn.textContent = '🗑️';
      deleteBtn.onclick = (e) => deleteFolder(e, folder);
      header.appendChild(deleteBtn);
  
      folderDiv.appendChild(header);
  
      const folderNotesDiv = document.createElement('div');
      folderNotesDiv.id = `folder-${folder}`;
      folderNotesDiv.className = 'folder-notes';
      folderNotesDiv.style.display = 'none';
  
data[folder].forEach(note => {
  const noteDiv = document.createElement('div');
  noteDiv.style = 'padding:6px; margin-bottom:5px; border:1px solid #ddd; border-radius:5px; background:#f8f8f8;';
  
  // Pran premye 3 paragraf ki pa vid, koupe yo si yo twò long
  let cleanLines = note.contents
    .map(text => text.trim())
    .filter(text => text !== '')
    .slice(0, 3)
    .map(text => text.length > 120 ? text.slice(0, 120) + '...' : text);
  
// Pran sèlman kontni premye paj la
let firstPage = (note.contents && note.contents[0]) ? note.contents[0].trim() : '';

// Fè rezime: premye 3 liy ki pa vid, limite longè chak
let summaryLines = firstPage.split('\n')
  .map(line => line.trim())
  .filter(line => line !== '')
  .slice(0, 3)
  .map(line => line.length > 120 ? line.slice(0, 120) + '...' : line);

let summaryText = summaryLines.join('<br>');
  
  noteDiv.innerHTML = `
    <strong>${note.title}</strong><br>
    <small>${note.date}</small><br>
    <div class="note-summary" style="margin:5px 0; font-style:italic; color:#444;">
      ${summaryText}
    </div>
    <button onclick="viewNote('${folder}', '${note.title}', this)">Voir</button>
    <button onclick="editNote('${folder}', '${note.title}')">Modifier</button>
    <button onclick="deleteNote('${folder}', '${note.title}')">Supprimer</button>
  `;
  folderNotesDiv.appendChild(noteDiv);
});
  
      folderDiv.appendChild(folderNotesDiv);
      savedNotesList.appendChild(folderDiv);
    }
  
    // Si nou te efase katab, sove nouvo done yo
    if (modified) {
      localStorage.setItem('notesFolders', JSON.stringify(data));
    }
  }
  
  
  // 📂 Fè katab klikab pou ouvri/fèmen nòt li yo
  function toggleFolder(folderName) {
    // Kache tout lòt katab
    document.querySelectorAll('.folder-notes').forEach(div => {
      if (div.id !== `folder-${folderName}`) {
        div.style.display = 'none';
      }
    });
  
    // Toggle katab aktyèl la
    const selected = document.getElementById(`folder-${folderName}`);
    selected.style.display = (selected.style.display === 'none') ? 'block' : 'none';
  }
  
  // 🖊️ Mete nòt nan mode edisyon
  function editNote(folder, title) {
  const data = JSON.parse(localStorage.getItem('notesFolders') || '{}');
  const note = data[folder].find(n => n.title === title);
  if (!note) return;
  
  // Netwaye editè a
  document.getElementById('pagesContainer').innerHTML = '';
  note.contents.forEach(c => addPage(c));
  
  // Chanje tab pou "note"
  switchTab('note', document.querySelectorAll('.bottom-nav a')[1]);
  
  // ❌ Pa efase nòt la!
  // ❌ data[folder] = data[folder].filter(n => n.title !== title);
  // ❌ localStorage.setItem('notesFolders', JSON.stringify(data));
  
  // Mete valè tit & folder pou montre nan modal
  document.getElementById('noteTitle').value = note.title;
  document.getElementById('folderName').value = folder;
  
  openSaveDialog(); // Relouvri modal la pou modifye
}
  // 🗑️ Efase yon nòt sove
  function deleteNote(folder, title) {
    if (!confirm(`Ou vle efase "${title}" nan katab "${folder}"?`)) return;
  
    let data = JSON.parse(localStorage.getItem('notesFolders') || '{}');
  
    // Retire nòt la
    data[folder] = data[folder].filter(n => n.title !== title);
  
    // Si katab la vin vid, retire katab la tou
    if (data[folder].length === 0) delete data[folder];
  
    // Mete ajou done yo
    localStorage.setItem('notesFolders', JSON.stringify(data));
  
    // Rafrechi afichaj
    showSavedNotes();
  }
  

  function deleteFolder(event, folderName) {
    event.stopPropagation(); // Anpeche toggleFolder aktive
  
    if (!confirm(`Ou vle efase katab "${folderName}" ak tout nòt ki ladan l?`)) return;
  
    let data = JSON.parse(localStorage.getItem('notesFolders') || '{}');
    delete data[folderName];
  
    localStorage.setItem('notesFolders', JSON.stringify(data));
    showSavedNotes();
  }
  
  
  // 🔄 Chak fwa w antre nan tab "list", montre nòt yo
  document.querySelector('[onclick*="switchTab(\'list\'"]').addEventListener('click', showSavedNotes);
  




  // Emoji pa kategori
const emojiData = {
    smileys: ["😀", "😂", "😍", "😎", "😢", "🤔", "😡", "😴", "😇", "🤪"],
    animals: ["🐶", "🐱", "🐰", "🦊", "🐼", "🐨", "🐸", "🦄", "🐵", "🐔"],
    food: ["🍎", "🍔", "🍕", "🍣", "🍩", "🍉", "🍪", "🍫", "🥗", "🍰"],
    activities: ["⚽", "🏀", "🏈", "🎾", "🎳", "🎸", "🎮", "🎭", "🎨", "🎤"],
    objects: ["💡", "📱", "💻", "📷", "🎁", "🔑", "🕯️", "💎", "📚", "🛒"],
  };
  
  // Chajman emoji nan lis la dapre kategori
  function loadEmojis(category) {
    const emojiList = document.getElementById("emojiList");
    emojiList.innerHTML = "";
    emojiData[category].forEach(emoji => {
      const span = document.createElement("span");
      span.textContent = emoji;
      span.style.cursor = "pointer";
      span.style.margin = "4px";
      span.style.userSelect = "none";
      span.style.display = "inline-block";
      span.style.width = "28px";
      span.style.height = "28px";
      span.style.textAlign = "center";
      span.style.lineHeight = "28px";
      span.style.fontSize = "22px";
      span.className = "emoji";
      emojiList.appendChild(span);
    });
  }
  
  // Manadjè kategori yo (bouton)
  const catButtons = document.querySelectorAll("#emojiCategories .catBtn");
  catButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Enaktive tout bouton, aktive bouton seleksyone a
      catButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
  
      // Chaje emojis pou kategori sa
      loadEmojis(btn.dataset.cat);
    });
  });
  
  // Insert emoji nan editè kouran
  document.getElementById("emojiList").addEventListener("click", (e) => {
    if (e.target.classList.contains("emoji")) {
      insertAtCursor(e.target.textContent);
      // Fèmen emoji picker apre chwazi
      emojiPicker.style.display = "none";
    }
  });
  
  // Bouton pou montre/kache emoji picker
  const emojiBtn = document.getElementById("emojiBtn");
  const emojiPicker = document.getElementById("emojiPicker");
  emojiBtn.addEventListener("click", () => {
    emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
  });
  
  // Insert nan kèsè editè contenteditable
  function insertAtCursor(text) {
    const editor = currentEditor;
    if (!editor) return;
  
    editor.focus(); // Mete kèsè a
  
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
  
    const range = sel.getRangeAt(0);
    range.deleteContents();
  
    const node = document.createTextNode(text);
    range.insertNode(node);
  
    // Mennen kèsè apre emoji a
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  
  // Chajman inisyal kategori
  loadEmojis("smileys");




  const dropdownToggle = document.getElementById("formatDropdownToggle");
  const dropdownMenu = document.getElementById("formatDropdown");

  dropdownToggle.addEventListener("click", () => {
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
  });

  // Fèmen dropdown si ou klike deyò li
  window.addEventListener("click", function (e) {
    if (!e.target.matches('#formatDropdownToggle')) {
      dropdownMenu.style.display = "none";
    }
  });


  function applyPlatformFormat() {
    const platform = document.getElementById('platformFormat').value;
    if (!platform || !currentEditor) return;
  
    let text = currentEditor.innerText;
  
    if (platform === 'whatsapp') {
      text = formatForWhatsApp(text);
    } else if (platform === 'facebook') {
      alert("Facebook pa mande fòma espesyal pou tèks.");
    } else if (platform === 'twitter') {
      const count = text.length;
      alert(`Twitter limite a 280 karaktè. Tèks ou a gen ${count} karaktè.`);
    }
  
    if (platform === 'whatsapp') {
      currentEditor.innerText = text;
    }
  }
  
  // Fonksyon pou WhatsApp
  function formatForWhatsApp(text) {
    return text
      .split('\n')
      .map(line => {
        if (line.startsWith('-')) return line; // deja lis
        if (line.match(/^\d+\./)) return `- ${line}`; // convert 1. 2. to list
  
        // Bold (mot ant **)
        if (line.includes('<b>') || line.includes('<strong>')) {
          line = line.replace(/<[^>]+>/g, '');
          return `*${line.trim()}*`;
        }
  
        // Italic (mot ant <i>)
        if (line.includes('<i>') || line.includes('<em>')) {
          line = line.replace(/<[^>]+>/g, '');
          return `_${line.trim()}_`;
        }
  
        return line;
      })
      .join('\n');
  }
  
  
  function populateFolderSelect() {
  const folderSelect = document.getElementById('folderSelect');
  folderSelect.innerHTML = '<option value="">📁 Chwazi yon katab</option>'; // Rekomanse
  
  const data = JSON.parse(localStorage.getItem('notesFolders') || '{}');
  Object.keys(data).forEach(folder => {
    const opt = document.createElement('option');
    opt.value = folder;
    opt.textContent = folder;
    folderSelect.appendChild(opt);
  });
}

// Chak fwa ou ouvri modal la, chaje katab yo
function openSaveDialog() {
  document.getElementById('saveModal').style.display = 'block';
  populateFolderSelect(); // 🔁 mete select katab yo ajou
}

function selectFolderName(selectEl) {
  const folderInput = document.getElementById('folderName');
  folderInput.value = selectEl.value;
}
  



document.addEventListener('focusin', (e) => {
  if (e.target.classList.contains('editor')) {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }
  
});



async function exportAllPagesToPDF() {
  const pages = document.querySelectorAll('.page');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4'); // portrait A4
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const btns = page.querySelector('.btns');
    
    // Sove stil orijinal yo
    const originalPageStyle = page.getAttribute('style') || '';
    const originalBtnsDisplay = btns.style.display;
    
    // Kache bouton yo
    btns.style.display = 'none';
    
    // Fòse wotè 71vh
    page.style.height = '71vh';
    page.style.overflow = 'hidden';
    
    // Konvèti an imaj
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = 210;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    if (i !== 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    // Reyafiche bouton yo & stil orijinal
    btns.style.display = originalBtnsDisplay;
    page.setAttribute('style', originalPageStyle);
  }
  
  pdf.save('mes-notes.pdf');
}



function insertLocalImage(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    // Kreye eleman imaj la
    const img = document.createElement('img');
    img.src = e.target.result;
    img.style.maxWidth = '100%';
    img.style.display = 'block';
    img.style.margin = '10px 0';
    img.style.cursor = 'move';
    
    // Ajoute atribi pou resize
    img.setAttribute('resizable', 'true');
    
    // Jwenn editè ki aktif oswa premye editè disponib
    let editor = document.activeElement;
    if (!editor || !editor.classList.contains('editor')) {
      editor = document.querySelector('.editor');
    }
    
    if (!editor) {
      alert('Pa gen editè ki disponib pou mete imaj la.');
      return;
    }
    
    // Enseri imaj la nan pozisyon kèsè a
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      
      const newRange = document.createRange();
      newRange.setStartAfter(img);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      editor.appendChild(img);
    }
    
    // Ajoute fonksyonalite resize
    setupImageResize(img);
    
    editor.focus();
  };
  
  reader.readAsDataURL(file);
  input.value = '';
}

function setupImageResize(img) {
  // Kreye div kontnè pou resize
  const resizeContainer = document.createElement('div');
  resizeContainer.style.position = 'relative';
  resizeContainer.style.display = 'inline-block';
  
  // Ranplase imaj la ak kontnè a
  img.parentNode.insertBefore(resizeContainer, img);
  resizeContainer.appendChild(img);
  
  // Kreye kwen pou resize
  const resizeHandle = document.createElement('div');
  resizeHandle.style.position = 'absolute';
  resizeHandle.style.right = '0';
  resizeHandle.style.bottom = '0';
  resizeHandle.style.width = '15px';
  resizeHandle.style.height = '15px';
  resizeHandle.style.background = 'blue';
  resizeHandle.style.cursor = 'se-resize';
  
  resizeContainer.appendChild(resizeHandle);
  
  // Ajoute evènman pou resize
  let isResizing = false;
  let startX, startY, startWidth, startHeight;
  
  resizeHandle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(img.width || img.offsetWidth);
    startHeight = parseInt(img.height || img.offsetHeight);
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  });
  
  function resize(e) {
    if (!isResizing) return;
    
    const newWidth = startWidth + (e.clientX - startX);
    const newHeight = startHeight + (e.clientY - startY);
    
    img.style.width = newWidth + 'px';
    img.style.height = newHeight + 'px';
    img.style.maxWidth = 'none'; // Retire max-width pandan resize
  }
  
  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }
}
  