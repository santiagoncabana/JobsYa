// =============================================
// OFERTAS.JS - Lógica para cargar ofertas
// =============================================

// Configuración
const CONFIG = {
  API_URL: '/api/ofertas', // Cambiar por tu URL real
  OFERTAS_POR_PAGINA: 10
};

// Estado global
let estado = {
  paginaActual: 1,
  totalPaginas: 1,
  filtros: {}
};

// =============================================
// INICIALIZACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  cargarOfertas();
  inicializarFiltros();
  inicializarBuscador();
});

// =============================================
// CARGAR OFERTAS (FETCH AL BACKEND)
// =============================================
async function cargarOfertas(pagina = 1) {
  const contenedor = document.getElementById('lista-ofertas');
  const cargando = document.getElementById('cargando');
  const vacio = document.getElementById('estado-vacio');
  const error = document.getElementById('estado-error');
  
  // Mostrar loading, ocultar otros estados
  cargando.style.display = 'block';
  vacio.style.display = 'none';
  error.style.display = 'none';
  contenedor.innerHTML = '';
  
  try {
    // Construir parámetros de búsqueda
    const params = new URLSearchParams({
      pagina: pagina,
      limite: CONFIG.OFERTAS_POR_PAGINA,
      ...estado.filtros
    });
    
    // Fetch al endpoint
    const respuesta = await fetch(`${CONFIG.API_URL}?${params}`);
    
    if (!respuesta.ok) throw new Error('Error en la respuesta');
    
    const datos = await respuesta.json();
    
    // Ocultar loading
    cargando.style.display = 'none';
    
    // Verificar si hay ofertas
    if (datos.ofertas.length === 0) {
      vacio.style.display = 'block';
      return;
    }
    
    // Actualizar estado
    estado.paginaActual = datos.pagina;
    estado.totalPaginas = datos.totalPaginas;
    
    // Actualizar contador
    document.getElementById('total-ofertas').textContent = datos.total.toLocaleString();
    
    // Renderizar ofertas y paginación
    renderizarOfertas(datos.ofertas);
    renderizarPaginacion();
    
  } catch (err) {
    console.error('Error al cargar ofertas:', err);
    cargando.style.display = 'none';
    error.style.display = 'block';
  }
}

// =============================================
// RENDERIZAR OFERTAS
// =============================================
function renderizarOfertas(ofertas) {
  const contenedor = document.getElementById('lista-ofertas');
  
  contenedor.innerHTML = ofertas.map(oferta => `
    <article class="oferta-tarjeta ${oferta.destacada ? 'destacada' : ''}">
      <div class="oferta-cabecera">
        <div class="empresa-logo">${oferta.empresa.iniciales}</div>
        <div class="oferta-info">
          <a href="/oferta/${oferta.id}" class="oferta-titulo">${oferta.titulo}</a>
          <p class="oferta-empresa">${oferta.empresa.nombre}</p>
        </div>
      </div>
      <div class="oferta-badges">
        ${oferta.destacada ? `
          <span class="badge badge-destacada">
            <i class="fas fa-star"></i> Destacada
          </span>
        ` : ''}
        <span class="badge badge-ubicacion">
          <i class="fas fa-map-marker-alt"></i> ${oferta.ubicacion}
        </span>
        <span class="badge badge-modalidad">
          <i class="fas fa-${obtenerIconoModalidad(oferta.modalidad)}"></i> ${oferta.modalidad}
        </span>
        <span class="badge badge-jornada">
          <i class="fas fa-clock"></i> ${oferta.jornada}
        </span>
      </div>
      <p class="oferta-descripcion">${oferta.descripcion}</p>
      <div class="oferta-footer">
        <span class="oferta-salario">
          $${oferta.salarioMin.toLocaleString()} - $${oferta.salarioMax.toLocaleString()}
        </span>
        <span class="oferta-fecha">${calcularTiempoTranscurrido(oferta.fechaPublicacion)}</span>
        <button class="boton-postular" onclick="postular(${oferta.id})">
          Postularme
        </button>
      </div>
    </article>
  `).join('');
}

// =============================================
// RENDERIZAR PAGINACIÓN
// =============================================
function renderizarPaginacion() {
  const contenedor = document.getElementById('paginacion');
  const { paginaActual, totalPaginas } = estado;
  
  if (totalPaginas <= 1) {
    contenedor.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Botón anterior
  html += `
    <button class="paginacion-btn" 
            onclick="cambiarPagina(${paginaActual - 1})" 
            ${paginaActual === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // Números de página
  const rango = calcularRangoPaginacion(paginaActual, totalPaginas);
  
  rango.forEach(num => {
    if (num === '...') {
      html += `<span class="paginacion-puntos">...</span>`;
    } else {
      html += `
        <button class="paginacion-btn ${num === paginaActual ? 'activo' : ''}" 
                onclick="cambiarPagina(${num})">
          ${num}
        </button>
      `;
    }
  });
  
  // Botón siguiente
  html += `
    <button class="paginacion-btn" 
            onclick="cambiarPagina(${paginaActual + 1})" 
            ${paginaActual === totalPaginas ? 'disabled' : ''}>
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  contenedor.innerHTML = html;
}

function calcularRangoPaginacion(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  
  if (actual <= 3) return [1, 2, 3, 4, '...', total];
  if (actual >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  
  return [1, '...', actual - 1, actual, actual + 1, '...', total];
}

function cambiarPagina(pagina) {
  if (pagina < 1 || pagina > estado.totalPaginas) return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cargarOfertas(pagina);
}

// =============================================
// FILTROS
// =============================================
function inicializarFiltros() {
  // Modalidad
  document.querySelectorAll('[name="modalidad"]').forEach(el => {
    el.addEventListener('change', aplicarFiltros);
  });
  
  // Jornada
  document.querySelectorAll('[name="jornada"]').forEach(el => {
    el.addEventListener('change', aplicarFiltros);
  });
  
  // Fecha
  document.querySelectorAll('[name="fecha"]').forEach(el => {
    el.addEventListener('change', aplicarFiltros);
  });
  
  // Salario (con debounce)
  const salarioMin = document.getElementById('salario-min');
  const salarioMax = document.getElementById('salario-max');
  
  if (salarioMin) salarioMin.addEventListener('input', debounce(aplicarFiltros, 500));
  if (salarioMax) salarioMax.addEventListener('input', debounce(aplicarFiltros, 500));
}

function aplicarFiltros() {
  const filtros = {};
  
  // Modalidad (checkboxes)
  const modalidades = [];
  document.querySelectorAll('[name="modalidad"]:checked').forEach(el => {
    modalidades.push(el.value);
  });
  if (modalidades.length) filtros.modalidad = modalidades.join(',');
  
  // Jornada (checkboxes)
  const jornadas = [];
  document.querySelectorAll('[name="jornada"]:checked').forEach(el => {
    jornadas.push(el.value);
  });
  if (jornadas.length) filtros.jornada = jornadas.join(',');
  
  // Fecha (radio)
  const fecha = document.querySelector('[name="fecha"]:checked');
  if (fecha) filtros.fecha = fecha.value;
  
  // Salario
  const salarioMin = document.getElementById('salario-min')?.value;
  const salarioMax = document.getElementById('salario-max')?.value;
  if (salarioMin) filtros.salarioMin = salarioMin;
  if (salarioMax) filtros.salarioMax = salarioMax;
  
  estado.filtros = filtros;
  cargarOfertas(1); // Volver a página 1 al filtrar
}

function limpiarFiltros() {
  // Limpiar checkboxes y radios
  document.querySelectorAll('.filtros-lateral input').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
    if (el.type === 'number') el.value = '';
  });
  
  estado.filtros = {};
  cargarOfertas(1);
}

// =============================================
// BUSCADOR
// =============================================
function inicializarBuscador() {
  const form = document.getElementById('form-buscador');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      buscar();
    });
  }
}

function buscar() {
  const keyword = document.getElementById('buscar-keyword')?.value || '';
  const ubicacion = document.getElementById('buscar-ubicacion')?.value || '';
  const categoria = document.getElementById('buscar-categoria')?.value || '';
  
  if (keyword) estado.filtros.keyword = keyword;
  if (ubicacion) estado.filtros.ubicacion = ubicacion;
  if (categoria) estado.filtros.categoria = categoria;
  
  cargarOfertas(1);
}

// =============================================
// POSTULACIÓN
// =============================================
function postular(ofertaId) {
  // Verificar si está logueado (implementar según tu auth)
  const usuarioLogueado = verificarSesion();
  
  if (!usuarioLogueado) {
    window.location.href = `/login?redirect=/oferta/${ofertaId}`;
    return;
  }
  
  // Redirigir a la página de postulación o abrir modal
  window.location.href = `/postular/${ofertaId}`;
}

function verificarSesion() {
  // Implementar según tu sistema de autenticación
  // Ejemplo: return localStorage.getItem('token') !== null;
  return false;
}

// =============================================
// UTILIDADES
// =============================================
function calcularTiempoTranscurrido(fecha) {
  const ahora = new Date();
  const publicacion = new Date(fecha);
  const diff = ahora - publicacion;
  
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  
  if (minutos < 60) return `Hace ${minutos} minutos`;
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (dias === 1) return 'Hace 1 día';
  if (dias < 30) return `Hace ${dias} días`;
  return `Hace más de un mes`;
}

function obtenerIconoModalidad(modalidad) {
  const iconos = {
    'Remoto': 'home',
    'Presencial': 'building',
    'Híbrido': 'laptop-house'
  };
  return iconos[modalidad] || 'briefcase';
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// =============================================
// ORDENAMIENTO
// =============================================
function cambiarOrden(orden) {
  estado.filtros.orden = orden;
  cargarOfertas(1);
}

// Listener para el select de ordenar
document.getElementById('ordenar-por')?.addEventListener('change', (e) => {
  cambiarOrden(e.target.value);
});