const popup = document.createElement("div");
popup.classList.add("popup");
const loading1 = document.createElement("div");
loading1.classList.add("loading");
loading1.classList.add("dot-one");
const loading2 = document.createElement("div");
loading2.classList.add("loading");
loading2.classList.add("dot-two");
popup.appendChild(loading1);
popup.appendChild(loading2);
document.querySelector("body").appendChild(popup);

function load_end() {
    popup.parentNode.removeChild(popup);
}