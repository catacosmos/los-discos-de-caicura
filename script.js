let vinilos = [];

function limpiarTextoParaOrdenar(texto) {
  return texto
    .toLowerCase() 
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]/g, ""); 
}

async function cargarData() {
  try {
    const response = await fetch("data/vinilos.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    vinilos = await response.json();
    
    vinilos = vinilos.map(v => {
      const anioOrigen = parseInt(v.año_original || v.año) || 0;
      const decadaCalculada = anioOrigen > 0 ? `${Math.floor(anioOrigen / 10) * 10}s` : 'Desconocida';

      return {
        ...v,
        año_original: anioOrigen,
        año_edicion: parseInt(v.año_edicion || v["año edición"]) || anioOrigen,
        decada: decadaCalculada
      };
    });

    vinilos.sort((a, b) => {
      const artistaA = limpiarTextoParaOrdenar(a.artista);
      const artistaB = limpiarTextoParaOrdenar(b.artista);
      return artistaA.localeCompare(artistaB);
    });

    mostrarVinilos(vinilos);
    cargarFiltros();
  } catch (e) {
    console.error("Error cargando el JSON:", e);
    document.getElementById("vinilos-container").innerHTML = "<p style='color:red; text-align:center'>Error cargando datos. Revisa la consola (F12).</p>";
  }
}

function mostrarVinilos(lista) {
  const container = document.getElementById("vinilos-container");
  const contador = document.getElementById("contador-vinilos"); 
  container.innerHTML = "";

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

    const anioMostrar = v.año_original || "N/A";

    div.innerHTML = `
        <img src="${v.portada}" alt="${v.titulo}" onerror="this.onerror=null; this.src='images/default-vinyl.png';">
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

  const anioOriginal = v.año_original || "N/A";
  const anioEdicion = v.año_edicion || "N/A";
  const decadaMostrar = v.decada;
  
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
        <img src="${v.portada}" alt="Portada de ${v.titulo}" onerror="this.onerror=null; this.src='images/default-vinyl.png';">
        <div>
          <h2>${v.titulo}</h2>
          <p><strong>Artista:</strong> ${v.artista}</p>
          <p><strong>Lanzamiento original:</strong> ${anioOriginal} (${decadaMostrar})</p>
          <p><strong>Año de esta edición:</strong> ${anioEdicion}</p>
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
  
  modal.classList.add("show");
}

document.querySelector(".close-btn").onclick = () => {
  document.getElementById("modal-detalle").classList.remove("show");
}

window.onclick = (event) => {
  const modal = document.getElementById("modal-detalle");
  if (event.target == modal) {
    modal.classList.remove("show");
  }
}

document.addEventListener('keydown', function(event) {
  const modal = document.getElementById("modal-detalle");
  if (event.key === "Escape" && modal.classList.contains("show")) {
    modal.classList.remove("show");
  }
});

function cargarFiltros() {
  const filterArtista = document.getElementById("filter-artista");
  const filterDecada = document.getElementById("filter-decada");
  const filterGenero = document.getElementById("filter-genero"); 
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select"); 

  const artistas = [...new Set(vinilos.map(v => v.artista))].sort((a, b) => {
    return limpiarTextoParaOrdenar(a).localeCompare(limpiarTextoParaOrdenar(b));
  });
  
  const decadas = [...new Set(vinilos.map(v => v.decada))].filter(d => d !== 'Desconocida').sort();
  
  let generosRaw = [];
  vinilos.forEach(v => {
    if (Array.isArray(v.genero)) {
      generosRaw.push(...v.genero);
    } else if (v.genero) {
      generosRaw.push(v.genero);
    }
  });
  const generos = [...new Set(generosRaw)].sort();

  filterArtista.innerHTML = '<option value="">Todos los Artistas</option>';
  artistas.forEach(a => {
    filterArtista.innerHTML += `<option value="${a}">${a}</option>`;
  });

  filterDecada.innerHTML = '<option value="">Todas las Décadas</option>';
  decadas.forEach(d => {
    filterDecada.innerHTML += `<option value="${d}">${d}</option>`;
  });

  filterGenero.innerHTML = '<option value="">Todos los Géneros</option>';
  generos.forEach(g => {
    filterGenero.innerHTML += `<option value="${g}">${g}</option>`;
  });

  filterArtista.addEventListener("change", aplicarFiltros);
  filterDecada.addEventListener("change", aplicarFiltros);
  filterGenero.addEventListener("change", aplicarFiltros);
  searchInput.addEventListener("input", aplicarFiltros);
  sortSelect.addEventListener("change", aplicarFiltros); 
}

function aplicarFiltros() {
  const artistaSeleccionado = document.getElementById("filter-artista").value;
  const decadaSeleccionada = document.getElementById("filter-decada").value;
  const generoSeleccionado = document.getElementById("filter-genero").value;
  const textoBusqueda = document.getElementById("search-input").value.toLowerCase();
  const sortOption = document.getElementById("sort-select").value; 

  let filtrados = vinilos.filter(v => {
    const coincideArtista = artistaSeleccionado === "" || v.artista === artistaSeleccionado;
    const coincideDecada = decadaSeleccionada === "" || v.decada === decadaSeleccionada;
    
    const coincideGenero = generoSeleccionado === "" || 
      (Array.isArray(v.genero) ? v.genero.includes(generoSeleccionado) : v.genero === generoSeleccionado);

    const coincideTexto = v.titulo.toLowerCase().includes(textoBusqueda) ||
      v.artista.toLowerCase().includes(textoBusqueda);

    return coincideArtista && coincideDecada && coincideGenero && coincideTexto;
  });

  filtrados.sort((a, b) => {
    const artistaA = limpiarTextoParaOrdenar(a.artista);
    const artistaB = limpiarTextoParaOrdenar(b.artista);
    const tituloA = limpiarTextoParaOrdenar(a.titulo);
    const tituloB = limpiarTextoParaOrdenar(b.titulo);

    if (sortOption === "artista-za") {
      return artistaB.localeCompare(artistaA);
    } else if (sortOption === "titulo-az") {
      return tituloA.localeCompare(tituloB);
    } else if (sortOption === "anio-asc") {
      return (a.año_original || 0) - (b.año_original || 0); 
    } else if (sortOption === "anio-desc") {
      return (b.año_original || 0) - (a.año_original || 0); 
    } else {
      return artistaA.localeCompare(artistaB);
    }
  });

  mostrarVinilos(filtrados);
}

// NUEVO: Lógica para mostrar/ocultar el panel de filtros
const btnToggle = document.getElementById("btn-toggle-filtros");
const panelFiltros = document.getElementById("filtros-panel");

btnToggle.addEventListener("click", () => {
  panelFiltros.classList.toggle("oculto");
  if (panelFiltros.classList.contains("oculto")) {
    btnToggle.innerHTML = "Filtrar y Ordenar ▼";
    btnToggle.classList.remove("activo");
  } else {
    btnToggle.innerHTML = "Ocultar Filtros ▲";
    btnToggle.classList.add("activo");
  }
});

document.getElementById("btn-limpiar").addEventListener("click", () => {
  document.getElementById("search-input").value = "";
  document.getElementById("filter-artista").value = "";
  document.getElementById("filter-decada").value = "";
  document.getElementById("filter-genero").value = "";
  document.getElementById("sort-select").value = "default";
  aplicarFiltros();
});

const btnSubir = document.getElementById("btn-subir");
window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    btnSubir.classList.add("show");
  } else {
    btnSubir.classList.remove("show");
  }
});
btnSubir.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

cargarData();
