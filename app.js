const form = document.getElementById("entry-form");
const entries = document.getElementById("entries");
const mediaUpload = document.getElementById("media-upload");
const mediaList = document.getElementById("media-list");
const loreForm = document.getElementById("lore-form");
const loreList = document.getElementById("lore-list");

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const title = formData.get("title");
  const mood = formData.get("mood");
  const content = formData.get("content");

  const entry = document.createElement("li");
  entry.className = "entry";
  entry.innerHTML = `
    <div class="entry__meta">
      <span>${title}</span>
      <span>${mood} · ${formatDate(new Date())}</span>
    </div>
    <p>${content}</p>
  `;

  entries.prepend(entry);
  form.reset();
});

mediaUpload.addEventListener("change", () => {
  mediaList.innerHTML = "";
  Array.from(mediaUpload.files).forEach((file) => {
    const item = document.createElement("li");
    item.textContent = `${file.name}`;
    mediaList.appendChild(item);
  });
});

loreForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loreForm);
  const title = formData.get("lore-title");
  const category = formData.get("lore-category");
  const notes = formData.get("lore-notes");

  const item = document.createElement("li");
  item.innerHTML = `
    <div class="lore-list__meta">
      <span>${title}</span>
      <span>${category}</span>
    </div>
    <p>${notes}</p>
  `;

  loreList.prepend(item);
  loreForm.reset();
});
