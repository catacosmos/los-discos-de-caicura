let vinilos = [];

async function cargarData(){
  const response = await fetch("data/vinilos.json");
  vinilos = await response.json();
  mostrarVinilos(vinilos);
  cargarFiltros();
}

function mostrarVinilos(lista) {
  const container = document.getElementById("vinilos-container");
  container.innerHTML = "";

  lista.forEach((v, index) => {
    const div = document.createElement("div");
    div.classList.add("vinilo-card");
    // Agregamos un evento de clic a la card
    div.onclick = () => abrirModal(v);

    div.innerHTML = `
      <img src="${v.portada}" alt="${v.titulo}">
      <h3>${v.titulo}</h3>
      <p><strong>${v.artista}</strong></p>
      <p>${v.año}</p>
    `;
    container.appendChild(div);
  });
}

function abrirModal(v) {
  const modal = document.getElementById("modal-detalle");
  const content = document.getElementById("modal-body-content");

  // Manejamos la lista de canciones (considerando que Nicole tiene side A/B y Beatles no)
  let listaHTML = "";
  if (v.canciones) {
    listaHTML = `<ul>${v.canciones.map(c => `<li>${c}</li>`).join('')}</ul>`;
  } else if (v["canciones side A"]) {
    listaHTML = `
      <h4>Side A</h4><ul>${v["canciones side A"].map(c => `<li>${c}</li>`).join('')}</ul>
      <h4>Side B</h4><ul>${v["canciones side B"].map(c => `<li>${c}</li>`).join('')}</ul>`;
  }

  content.innerHTML = `
    <div class="modal-grid">
      <img src="${v.portada}" alt="Portada">
      <div>
        <h2>${v.titulo}</h2>
        <p><strong>Artista:</strong> ${v.artista}</p>
        <p><strong>Año:</strong> ${v.año} (${v.decada})</p>
        <p><strong>Género:</strong> ${v.genero || 'N/A'}</p>
        <hr>
        <h3>Tracklist:</h3>
        ${listaHTML}
      </div>
    </div>
  `;
  modal.style.display = "block";
}

// Lógica para cerrar el modal
document.querySelector(".close-btn").onclick = () => {
  document.getElementById("modal-detalle").style.display = "none";
}

window.onclick = (event) => {
  const modal = document.getElementById("modal-detalle");
  if (event.target == modal) modal.style.display = "none";
}

function cargarFiltros() {
    const filterArtista = document.getElementById("filter-artista");
    const filterDecada = document.getElementById("filter-decada");
    const searchInput = document.getElementById("search-input"); // Nuevo

    const artistas = [...new Set(vinilos.map(v => v.artista))].sort();
    const decadas = [...new Set(vinilos.map(v => v.decada))].sort();

    filterArtista.innerHTML = '<option value="">Todos los Artistas</option>';
    artistas.forEach(a => { filterArtista.innerHTML += `<option value="${a}">${a}</option>`; });

    filterDecada.innerHTML = '<option value="">Todas las Décadas</option>';
    decadas.forEach(d => { filterDecada.innerHTML += `<option value="${d}">${d}</option>`; });

    // Eventos
    filterArtista.addEventListener("change", aplicarFiltros);
    filterDecada.addEventListener("change", aplicarFiltros);
    searchInput.addEventListener("input", aplicarFiltros); // Escucha mientras escribes
}

function aplicarFiltros() {
    const artistaSeleccionado = document.getElementById("filter-artista").value;
    const decadaSeleccionada = document.getElementById("filter-decada").value;
    const textoBusqueda = document.getElementById("search-input").value.toLowerCase(); // Nuevo

    const filtrados = vinilos.filter(v => {
        const coincideArtista = artistaSeleccionado === "" || v.artista === artistaSeleccionado;
        const coincideDecada = decadaSeleccionada === "" || v.decada === decadaSeleccionada;
        
        // Nueva lógica: busca en el título O en el artista
        const coincideTexto = v.titulo.toLowerCase().includes(textoBusqueda) || 
                              v.artista.toLowerCase().includes(textoBusqueda);

        return coincideArtista && coincideDecada && coincideTexto;
    });

    mostrarVinilos(filtrados);
}

cargarData();
