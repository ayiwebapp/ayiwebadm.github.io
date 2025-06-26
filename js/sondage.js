 let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let optionCount = 2;
  let editingPollId = null;

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
    });
  }

  function addOption() {
    optionCount++;
    const div = document.createElement("div");
    div.className = "input";
    div.innerHTML = `<input type="text" id="option${optionCount}" placeholder="Opsyon ${optionCount}">`;
    document.querySelector(".poll-form").insertBefore(div, document.querySelector(".poll-form").children[optionCount + 1]);
  }

  function savePoll() {
    const question = document.getElementById("question").value.trim();
    const options = {};
    for (let i = 1; i <= optionCount; i++) {
      const optInput = document.getElementById("option" + i);
      if (optInput) {
        const optVal = optInput.value.trim();
        if (optVal) options[optVal] = { votes: 0, voters: {} };
      }
    }
    if (!question || Object.keys(options).length < 2) {
      return alert("Tanpri bay yon tit ak omwen 2 opsyon!");
    }

    if (editingPollId) {
      db.ref("polls/" + editingPollId).once("value", snapshot => {
        const existingPoll = snapshot.val();
        if (!existingPoll) return alert("Sondaj pa jwenn!");
        const newOptions = {};
        for (const opt in options) {
          if (existingPoll.options[opt]) {
            newOptions[opt] = existingPoll.options[opt];
          } else {
            newOptions[opt] = { votes: 0, voters: {} };
          }
        }
        const updatedPoll = {
          id: editingPollId,
          question,
          options: newOptions,
          voters: existingPoll.voters || {},
          date: existingPoll.date || new Date().toLocaleString()
        };
        db.ref("polls/" + editingPollId).set(updatedPoll, (error) => {
          if (error) {
            alert("Echèk mete ajou sondaj la nan Firebase");
          } else {
            alert("Sondaj mete ajou avèk siksè!");
            polls = polls.filter(p => p.id !== editingPollId);
            polls.push(updatedPoll);
            localStorage.setItem("polls", JSON.stringify(polls));
            renderAllPolls();
          }
        });
        editingPollId = null;
      });
    } else {
      const poll = {
        id: Date.now(),
        question,
        date: new Date().toLocaleString(),
        options
      };
      polls.push(poll);
      localStorage.setItem("polls", JSON.stringify(polls));
      renderAllPolls();
    }

    document.getElementById("question").value = "";
    for (let i = 1; i <= optionCount; i++) {
      const optInput = document.getElementById("option" + i);
      if (optInput) optInput.value = "";
    }
    if (optionCount > 2) {
      for (let i = optionCount; i > 2; i--) {
        const optInput = document.getElementById("option" + i);
        if (optInput) optInput.parentElement.remove();
      }
      optionCount = 2;
    }
  }

  function renderAllPolls() {
    const container = document.getElementById("pollContainer");
    container.innerHTML = "";
    db.ref("polls").once("value", snapshot => {
      const firebasePolls = snapshot.val() || {};
      let allPolls = [...polls];
      for (let id in firebasePolls) {
        const pollFromFirebase = firebasePolls[id];
        const existingIndex = allPolls.findIndex(p => p.id == pollFromFirebase.id);
        if (existingIndex !== -1) {
          allPolls[existingIndex] = { ...allPolls[existingIndex], ...pollFromFirebase };
        } else {
          allPolls.push(pollFromFirebase);
        }
      }

      allPolls.forEach((poll, index) => {
        const optionsHtml = Object.entries(poll.options).map(([opt, data]) => {
          const voterNames = data.voters ? Object.keys(data.voters).join(", ") : "";
          return `<li>
            ${opt} - <strong>${data.votes || 0}</strong> vòt
            ${voterNames ? `<br><small>🧑 Votè yo: ${voterNames}</small>` : ""}
            <br><button style="display:none;" onclick="vote(${poll.id}, '${escapeHtml(opt)}')" ${hasVoted(poll.id) ? 'disabled' : ''}>Vote</button>
          </li>`;
        }).join("");

        const votersList = poll.voters ?
          Object.entries(poll.voters).map(([userId, choice]) =>
            `<li>👤 <strong>${userId}</strong> te vote pou <em>${choice}</em></li>`).join("") :
          "<li>Pa gen votè</li>";

        const published = isPublished(poll.id, firebasePolls);

        const div = document.createElement("div");
        div.className = "poll-item";
        div.innerHTML = `
          <strong>${poll.question}</strong><br>
          <small>🗓️ ${poll.date || "Dat pa disponib"}</small><br>
          <ul>${optionsHtml}</ul>
          <details>
            <summary>👥 Detay sou tout votè yo</summary>
            <ul>${votersList}</ul>
          </details>
          <div class="actions">
            <button onclick="editPoll(${index})">✏️</button>
            <button onclick="deletePoll(${index})">🗑️</button>
            <button onclick="publishPoll(${index})">🚀${published ? ' ✅' : ''}</button>
          </div>
        `;
        container.appendChild(div);
      });
    });
  }

  function hasVoted(pollId) {
    const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
    return votedPolls[pollId];
  }

  function markVoted(pollId) {
    const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
    votedPolls[pollId] = true;
    localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
  }

  function isPublished(id, firebasePolls) {
    return firebasePolls && firebasePolls[id];
  }

  function editPoll(index) {
    const poll = polls[index];
    editingPollId = poll.id;
    document.getElementById("question").value = poll.question;
    const keys = Object.keys(poll.options);
    for (let i = 0; i < keys.length; i++) {
      if (i < 2) {
        document.getElementById("option" + (i + 1)).value = keys[i];
      } else {
        addOption();
        document.getElementById("option" + (i + 1)).value = keys[i];
      }
    }
  }

  function deletePoll(index) {
    const poll = polls[index];
    if (confirm("Ou vle efase sondaj sa?")) {
      db.ref("polls/" + poll.id).remove();
      polls.splice(index, 1);
      localStorage.setItem("polls", JSON.stringify(polls));
      renderAllPolls();
    }
  }

  function publishPoll(index) {
    const poll = polls[index];
    db.ref("polls/" + poll.id).set(poll, (error) => {
      if (!error) renderAllPolls();
    });
  }
