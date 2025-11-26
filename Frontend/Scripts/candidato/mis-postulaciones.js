console.log('Script de Mis Postulaciones cargado');

const API_URL = 'http://127.0.0.1:8000/api';

// Variables globales (Ajustadas para Mis Postulaciones)
let misPostulaciones = [];
let postulacionesFiltradas = [];
let paginaActual = 1;
const postulacionesPorPagina = 9;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando Mis Postulaciones...');
    
    // Verificar autenticación al inicio
    const usuarioLogueado = sessionStorage.getItem('usuario_logueado');
    if (!usuarioLogueado) {
        window.location.href = './login_candidato.html';
        return;
    }
    
    // El ID del usuario es CRÍTICO para obtener sus postulaciones
    const idUsuario = sessionStorage.getItem('usuario_id');
    if (!idUsuario) {
        console.error("ID de usuario no encontrado. Cierre sesión e intente de nuevo.");
        window.location.href = './login_candidato.html';
        return;
    }

    // Inicializar elementos
    inicializarUsuario(); // 1. CRÍTICO: Cargar nombre y avatar
    inicializarEventos();
    cargarPostulaciones(idUsuario); // 2. Cargar los datos específicos del usuario
});


// 🔑 CRÍTICO: FUNCIÓN PARA INICIALIZAR SESIÓN Y AVATAR
function inicializarUsuario() {
    const nombreUsuario = sessionStorage.getItem('usuario_nombre') || 'Usuario';
    const nombreUsuarioSpan = document.getElementById('nombreUsuario');
    const usuarioAvatar = document.getElementById('usuarioAvatar');
    
    // Asegura que el nombre en el navbar se muestre
    if (nombreUsuarioSpan) {
        nombreUsuarioSpan.textContent = nombreUsuario;
    }
    
    // Genera las iniciales para el avatar
    if (usuarioAvatar) {
        const iniciales = nombreUsuario.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        usuarioAvatar.textContent = iniciales;
    }
}

function inicializarEventos() {
    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Estás seguro que querés cerrar sesión?')) {
                sessionStorage.clear();
                // Ajusta la ruta de login si es necesario
                window.location.href = './login_candidato.html'; 
            }
        });
    }

    // Eventos de Filtrado
    const formBusqueda = document.getElementById('formBusquedaPostulaciones');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    const btnLimpiar = document.getElementById('btnLimpiarPostulaciones');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }
    
    // [Opcional: Implementación de Paginación]
}

// ===============================================
// LÓGICA DE DATOS
// ===============================================

// 1. Cargar las postulaciones del usuario
async function cargarPostulaciones(idUsuario) {
    const loader = document.getElementById('loaderPostulaciones');
    const postulacionesGrid = document.getElementById('postulacionesGrid');
    
    try {
        loader.style.display = 'block';
        postulacionesGrid.innerHTML = '';
        
        console.log(`Cargando postulaciones para usuario ID: ${idUsuario}`);
        
        // Asume que tu backend tiene este endpoint para obtener las postulaciones de un usuario:
        const response = await fetch(`${API_URL}/postulaciones/usuario/${idUsuario}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar postulaciones');
        }

        misPostulaciones = await response.json();
        postulacionesFiltradas = [...misPostulaciones];
        
        console.log(`${misPostulaciones.length} postulaciones cargadas.`);
        
        mostrarPostulaciones();
        
    } catch (error) {
        console.error('Error al cargar postulaciones:', error);
        postulacionesGrid.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error al cargar el historial</h3>
                <p>Asegúrate de que tu backend esté corriendo y la ruta /postulaciones/usuario/{id} sea correcta.</p>
            </div>
        `;
        mostrarNotificacion('Error al cargar tus postulaciones', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

// 2. Mostrar las postulaciones en la interfaz
function mostrarPostulaciones() {
    const postulacionesGrid = document.getElementById('postulacionesGrid');
    const contadorResultados = document.getElementById('contadorResultadosPostulaciones');
    
    contadorResultados.innerHTML = `<strong>${postulacionesFiltradas.length}</strong> postulaciones encontradas`;
    
    if (postulacionesFiltradas.length === 0) {
        postulacionesGrid.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fas fa-inbox"></i>
                <h3>Aún no tienes postulaciones</h3>
                <p>¡Explora <a href="./buscar_empleos.html">Buscar Empleos</a> para empezar!</p>
            </div>
        `;
        // [Opcional: Ocultar Paginación]
        return;
    }
    
    // Lógica de paginación
    const inicio = (paginaActual - 1) * postulacionesPorPagina;
    const fin = inicio + postulacionesPorPagina;
    const postulacionesPagina = postulacionesFiltradas.slice(inicio, fin);
    
    // Renderizado de las cards
    postulacionesGrid.innerHTML = postulacionesPagina.map(postulacion => crearCardPostulacion(postulacion)).join('');
    
    // [Opcional: Agregar eventos a botones y actualizar paginación]
}

// 3. Crear el HTML de cada card de postulación
function crearCardPostulacion(postulacion) {
    // Los datos de la oferta vienen dentro del objeto de postulación (postulacion.oferta)
    const oferta = postulacion.oferta || {}; 
    const estado = postulacion.estado_actual || 'Postulado';
    
    // Mapea el estado para usar la clase CSS de color definida antes
    const estadoClase = estado.toLowerCase()
        .replace(/\s/g, '-') // Reemplaza espacios con guiones (e.g., 'En Revisión' -> 'en-revision')
        .replace(/[^a-z0-9-]/g, ''); // Elimina cualquier otro carácter

    // Asegúrate de que los campos vengan en el JSON de la API
    const fechaPostulacion = new Date(postulacion.fecha_postulacion || Date.now()).toLocaleDateString('es-AR');

    return `
        <div class="oferta-card postulacion-card">
            <div style="flex-grow: 1;">
                <p class="oferta-empresa">${oferta.nombre_empresa || 'Empresa Desconocida'}</p>
                <h3 class="oferta-titulo">${oferta.nombre_puesto || 'Puesto Desconocido'}</h3>
                
                <div class="oferta-detalles">
                    <span class="oferta-detalle">
                        <i class="fas fa-map-marker-alt"></i>
                        ${oferta.ubicacion || 'No especificado'}
                    </span>
                    <span class="oferta-detalle">
                        <i class="fas fa-clock"></i>
                        ${oferta.jornada || 'Full-time'}
                    </span>
                    <span class="oferta-detalle">
                        <i class="fas fa-calendar-alt"></i>
                        Postulado el ${fechaPostulacion}
                    </span>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f1f5f9;">
                <span class="estado-postulacion ${estadoClase}">${estado}</span>
                
                <button class="btn-ver-oferta" data-id-oferta="${oferta.id_oferta}" style="width: auto;">
                    <i class="fas fa-eye"></i> Ver Oferta
                </button>
            </div>
        </div>
    `;
}


// [Opcional: Implementación de aplicarFiltros, limpiarFiltros y utilidades]

function aplicarFiltros() { /* ... */ }
function limpiarFiltros() { /* ... */ }
function mostrarNotificacion(mensaje, tipo) { /* ... */ }

// Nota: Las funciones de utilidad (calcularDiasPublicacion, formatearNumero, etc.) 
// deben copiarse desde buscar_empleo.js o estar en un archivo utilidades.js compartido.
// Si las tienes en buscar_empleo.js, asegúrate de copiarlas en mis_postulaciones.js.