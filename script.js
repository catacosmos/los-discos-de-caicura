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
  const contador = document.getElementById("contador-vinilos"); // Capturamos el contador
  container.innerHTML = "";

  // Actualizar el texto del contador
  if (contador) {
    contador.textContent = `Mostrando ${lista.length} disco${lista.length !== 1 ? 's' : ''}`;
  }

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

  const anioMostrar = v.año || v["año edición"] || "N/A";
  const generoMostrar = Array.isArray(v.genero) ? v.genero.join(", ") : (v.genero || 'N/A');
  const tamanoMostrar = Array.isArray(v.tamano) ? v.tamano.join(", ") : (v.tamano || 'N/A');

  const configuracionLados = [
    { etiqueta: "Side A", keys: ["canciones side A", "canciones side 1", "canciones lado 1", "canciones lado A"] },
    { etiqueta: "Side B", keys: ["canciones side B", "canciones side 2", "canciones lado 2", "canciones lado B"] },
    { etiqueta: "Side C", keys: ["canciones side C", "canciones side 3", "canciones lado 3", "canciones lado C"] },
    { etiqueta: "Side D", keys: ["canciones side D", "canciones side 4", "canciones lado 4", "canciones lado D"] },
    { etiqueta: "Side E", keys: ["canciones side E", "canciones side 5", "canciones lado 5", "canciones lado E"] },
    { etiqueta: "Side F", keys: ["canciones side F", "canciones side 6", "canciones lado 6", "canciones lado F"] }
  ];

  let listaHTML = "";

  if (v.canciones) {
    listaHTML = `<ul>${v.canciones.map(c => `<li>${c}</li>`).join('')}</ul>`;
  } else {
    configuracionLados.forEach(lado => {
      let cancionesEncontradas = null;
      for (const key of lado.keys) {
        if (v[key]) {
          cancionesEncontradas = v[key];
          break;
        }
      }
      if (cancionesEncontradas) {
        listaHTML += `
          <h4 class="side-title">${lado.etiqueta}</h4>
          <ul>${cancionesEncontradas.map(c => `<li>${c}</li>`).join('')}</ul>
        `;
      }
    });
  }

  if (listaHTML === "") listaHTML = "<p>No hay lista de canciones disponible.</p>";

  content.innerHTML = `
      <div class="modal-grid">
        <img src="${v.portada}" alt="Portada de ${v.titulo}">
        <div>
          <h2>${v.titulo}</h2>
          <p><strong>Artista:</strong> ${v.artista}</p>
          <p><strong>Año:</strong> ${anioMostrar} (${v.decada})</p>
          <p><strong>Género:</strong> ${generoMostrar}</p>
          <p><strong>Tamaño:</strong> ${tamanoMostrar}</p> 
          <hr>
          <h3>Tracklist:</h3>
          <div class="tracklist-container">
            ${listaHTML}
          </div>
        </div>
      </div>
    `;
  
  modal.style.display = "block";
}

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
  const sortSelect = document.getElementById("sort-select"); // Nuevo selector

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

  // Escuchar eventos
  filterArtista.addEventListener("change", aplicarFiltros);
  filterDecada.addEventListener("change", aplicarFiltros);
  searchInput.addEventListener("input", aplicarFiltros);
  sortSelect.addEventListener("change", aplicarFiltros); // Escucha al ordenar
}

function aplicarFiltros() {
  const artistaSeleccionado = document.getElementById("filter-artista").value;
  const decadaSeleccionada = document.getElementById("filter-decada").value;
  const textoBusqueda = document.getElementById("search-input").value.toLowerCase();
  const sortOption = document.getElementById("sort-select").value; // Leer opción de orden

  let filtrados = vinilos.filter(v => {
    const coincideArtista = artistaSeleccionado === "" || v.artista === artistaSeleccionado;
    const coincideDecada = decadaSeleccionada === "" || v.decada === decadaSeleccionada;
    const coincideTexto = v.titulo.toLowerCase().includes(textoBusqueda) ||
      v.artista.toLowerCase().includes(textoBusqueda);

    return coincideArtista && coincideDecada && coincideTexto;
  });

  // Lógica de ordenamiento
  filtrados.sort((a, b) => {
    if (sortOption === "artista-az") {
      return a.artista.localeCompare(b.artista);
    } else if (sortOption === "artista-za") {
      return b.artista.localeCompare(a.artista);
    } else if (sortOption === "titulo-az") {
      return a.titulo.localeCompare(b.titulo);
    } else if (sortOption === "anio-asc" || sortOption === "anio-desc") {
      // Extraemos el año numérico para comparar bien
      const anioA = parseInt(a.año || a["año edición"]) || 0;
      const anioB = parseInt(b.año || b["año edición"]) || 0;
      
      if (sortOption === "anio-asc") {
        return anioA - anioB; // Menor a mayor
      } else {
        return anioB - anioA; // Mayor a menor
      }
    }
    return 0; // "default" mantiene el orden original del JSON
  });

  mostrarVinilos(filtrados);
}

cargarData();
