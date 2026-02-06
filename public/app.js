const form = document.getElementById("entry-form");
const entries = document.getElementById("entries");

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
