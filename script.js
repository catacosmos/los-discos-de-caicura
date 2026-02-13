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

  // 1. Normalizar datos básicos (Año, Género, Tamaño)
  const anioMostrar = v.año || v["año edición"] || "N/A";
  const generoMostrar = Array.isArray(v.genero) ? v.genero.join(", ") : (v.genero || 'N/A');
  const tamanoMostrar = Array.isArray(v.tamano) ? v.tamano.join(", ") : (v.tamano || 'N/A');

  // 2. CONFIGURACIÓN DE LADOS (Aquí definimos la "inteligencia" del código)
  // Esto hace que funcione para todos, tengan 2, 4 o 6 lados.
  const configuracionLados = [
    { etiqueta: "Side A", keys: ["canciones side A", "canciones side 1", "canciones lado 1", "canciones lado A"] },
    { etiqueta: "Side B", keys: ["canciones side B", "canciones side 2", "canciones lado 2", "canciones lado B"] },
    { etiqueta: "Side C", keys: ["canciones side C", "canciones side 3", "canciones lado 3", "canciones lado C"] },
    { etiqueta: "Side D", keys: ["canciones side D", "canciones side 4", "canciones lado 4", "canciones lado D"] },
    { etiqueta: "Side E", keys: ["canciones side E", "canciones side 5", "canciones lado 5", "canciones lado E"] },
    { etiqueta: "Side F", keys: ["canciones side F", "canciones side 6", "canciones lado 6", "canciones lado F"] }
  ];

  let listaHTML = "";

  // 3. Generación de la lista de canciones
  if (v.canciones) {
    // Caso especial: Discos que solo tienen una lista simple sin lados
    listaHTML = `<ul>${v.canciones.map(c => `<li>${c}</li>`).join('')}</ul>`;
  } else {
    // Recorremos la configuración. Si el JSON tiene alguna de las keys, mostramos el lado.
    configuracionLados.forEach(lado => {
      // Buscamos si existe alguna de las variantes en el objeto 'v' (el vinilo actual)
      let cancionesEncontradas = null;
      
      for (const key of lado.keys) {
        if (v[key]) {
          cancionesEncontradas = v[key];
          break; // ¡Encontrado! Dejamos de buscar variantes para este lado.
        }
      }

      // Si encontramos canciones para este lado, agregamos el HTML con la etiqueta estandarizada (Side A, Side B...)
      if (cancionesEncontradas) {
        listaHTML += `
          <h4 class="side-title">${lado.etiqueta}</h4>
          <ul>${cancionesEncontradas.map(c => `<li>${c}</li>`).join('')}</ul>
        `;
      }
    });
  }

  // Si no encontró nada en absoluto
  if (listaHTML === "") listaHTML = "<p>No hay lista de canciones disponible.</p>";

  // 4. Renderizado en el Modal
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
