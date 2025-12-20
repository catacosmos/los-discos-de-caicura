let vinilos = [];

async function cargarData(){
  const response = await fetch("data/vinilos.json");
  vinilos = await response.json();
  mostrarVinilos(vinilos);
  cargarFiltros();
}

function mostrarVinilos(lista){
  const container = document.getElementById("vinilos-container");
  container.innerHTML = "";

  lista.forEach(v => {
    const div = document.createElement("div");
    div.classList.add("vinilo-card");

    div.innerHTML = `
      <img src="${v.portada}" alt="${v.titulo}">
      <h3>${v.titulo}</h3>
      <p>${v.artista}</p>
      <p>${v.año}</p>
    `;

    container.appendChild(div);
  });
}

function cargarFiltros(){
  // se completará luego
}

cargarData();
