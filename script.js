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

function cargarFiltros() {
    const filterArtista = document.getElementById("filter-artista");
    const filterDecada = document.getElementById("filter-decada");

    // Obtenemos valores únicos de nuestra data
    const artistas = [...new Set(vinilos.map(v => v.artista))].sort();
    const decadas = [...new Set(vinilos.map(v => v.decada))].sort();

    // Llenamos el selector de Artistas
    filterArtista.innerHTML = '<option value="">Todos los Artistas</option>';
    artistas.forEach(a => {
        filterArtista.innerHTML += `<option value="${a}">${a}</option>`;
    });

    // Llenamos el selector de Décadas
    filterDecada.innerHTML = '<option value="">Todas las Décadas</option>';
    decadas.forEach(d => {
        filterDecada.innerHTML += `<option value="${d}">${d}</option>`;
    });

    // Eventos para filtrar cuando el usuario cambie una opción
    filterArtista.addEventListener("change", aplicarFiltros);
    filterDecada.addEventListener("change", aplicarFiltros);
}

function aplicarFiltros() {
    const artistaSeleccionado = document.getElementById("filter-artista").value;
    const decadaSeleccionada = document.getElementById("filter-decada").value;

    const filtrados = vinilos.filter(v => {
        const coincideArtista = artistaSeleccionado === "" || v.artista === artistaSeleccionado;
        const coincideDecada = decadaSeleccionada === "" || v.decada === decadaSeleccionada;
        return coincideArtista && coincideDecada;
    });

    mostrarVinilos(filtrados);
}

cargarData();
