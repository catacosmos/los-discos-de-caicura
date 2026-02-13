let vinilos = [];

async function cargarData() {
  try {
    const response = await fetch("data/vinilos.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    vinilos = await response.json();
    mostrarVinilos(vinilos);
    cargarFiltros();
  } catch (e) {
    console.error("Error cargando el JSON:", e);
    document.getElementById("vinilos-container").innerHTML = "<p style='color:red; text-align:center'>Error cargando datos. Revisa la consola (F12).</p>";
  }
}

function mostrarVinilos(lista) {
  const container = document.getElementById("vinilos-container");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>No se encontraron vinilos que coincidan...</p>
        <span>¡Prueba con otro filtro o artista!</span>
      </div>
    `;
    return;
  }

  lista.forEach((v) => {
    const div = document.createElement("div");
    div.classList.add("vinilo-card");
    div.onclick = () => abrirModal(v);

    // CORRECCIÓN: Usamos v.año O v["año edición"] para que no salga "undefined"
    const anioMostrar = v.año || v["año edición"] || "N/A";

    div.innerHTML = `
        <img src="${v.portada}" alt="${v.titulo}">
        <h3>${v.titulo}</h3>
        <p><strong>${v.artista}</strong></p>
        <p>${anioMostrar}</p>
      `;
    container.appendChild(div);
  });
}

function abrirModal(v) {
  const modal = document.getElementById("modal-detalle");
  const content = document.getElementById("modal-body-content");

  // CORRECCIÓN: Detectar listas de canciones con nombres variados
  // Buscamos las variaciones en tu JSON (Side A/B, Side 1/2, Lado 1/2)
  const ladoA = v["canciones side A"] || v["canciones side 1"] || v["canciones lado 1"];
  const ladoB = v["canciones side B"] || v["canciones side 2"] || v["canciones lado 2"];
  const anioMostrar = v.año || v["año edición"] || "N/A";

  let listaHTML = "";

  if (v.canciones) {
    // Caso de lista única
    listaHTML = `<ul>${v.canciones.map(c => `<li>${c}</li>`).join('')}</ul>`;
  } else if (ladoA && ladoB) {
    // Caso Lado A y B detectados
    listaHTML = `
      <h4>Lado A / 1</h4><ul>${ladoA.map(c => `<li>${c}</li>`).join('')}</ul>
      <h4>Lado B / 2</h4><ul>${ladoB.map(c => `<li>${c}</li>`).join('')}</ul>`;
  } else {
    listaHTML = "<p>No hay lista de canciones disponible.</p>";
  }

  content.innerHTML = `
      <div class="modal-grid">
        <img src="${v.portada}" alt="Portada">
        <div>
          <h2>${v.titulo}</h2>
          <p><strong>Artista:</strong> ${v.artista}</p>
          <p><strong>Año:</strong> ${anioMostrar} (${v.decada})</p>
          <p><strong>Género:</strong> ${Array.isArray(v.genero) ? v.genero.join(", ") : (v.genero || 'N/A')}</p>
          <p><strong>Tamaño:</strong> ${v.tamano}</p> <hr>
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
  const searchInput = document.getElementById("search-input");

  const artistas = [...new Set(vinilos.map(v => v.artista))].sort();
  const decadas = [...new Set(vinilos.map(v => v.decada))].sort();

  filterArtista.innerHTML = '<option value="">Todos los Artistas</option>';
  artistas.forEach(a => {
    filterArtista.innerHTML += `<option value="${a}">${a}</option>`;
  });

  filterDecada.innerHTML = '<option value="">Todas las Décadas</option>';
  decadas.forEach(d => {
    filterDecada.innerHTML += `<option value="${d}">${d}</option>`;
  });

  filterArtista.addEventListener("change", aplicarFiltros);
  filterDecada.addEventListener("change", aplicarFiltros);
  searchInput.addEventListener("input", aplicarFiltros);
}

function aplicarFiltros() {
  const artistaSeleccionado = document.getElementById("filter-artista").value;
  const decadaSeleccionada = document.getElementById("filter-decada").value;
  const textoBusqueda = document.getElementById("search-input").value.toLowerCase();

  const filtrados = vinilos.filter(v => {
    const coincideArtista = artistaSeleccionado === "" || v.artista === artistaSeleccionado;
    const coincideDecada = decadaSeleccionada === "" || v.decada === decadaSeleccionada;
    const coincideTexto = v.titulo.toLowerCase().includes(textoBusqueda) ||
      v.artista.toLowerCase().includes(textoBusqueda);

    return coincideArtista && coincideDecada && coincideTexto;
  });

  mostrarVinilos(filtrados);
}

cargarData();
