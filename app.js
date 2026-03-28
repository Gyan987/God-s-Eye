console.log("JS connected");
console.log("JS connected");
const form = document.getElementById("lostForm");
const list = document.getElementById("lostList");

function showItems() {
  list.innerHTML = "";
  const items = JSON.parse(localStorage.getItem("items")) || [];

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = ${item.name} | ${item.place} | ${item.date} | ${item.contact};
    list.appendChild(li);
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const item = {
    name: document.getElementById("itemName").value,
    description: document.getElementById("description").value,
    place: document.getElementById("lostPlace").value,
    date: document.getElementById("lostDate").value,
    contact: document.getElementById("contact").value
  };

  let items = JSON.parse(localStorage.getItem("items")) || [];
  items.push(item);
  localStorage.setItem("items", JSON.stringify(items));

  form.reset();
  showItems();
});

showItems();