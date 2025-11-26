// buscar_empleos.js
console.log('Script de búsqueda de empleos cargado');

const API_URL = 'http://127.0.0.1:8000/api';

// Variables globales
let todasLasOfertas = [];
let ofertasFiltradas = [];
let paginaActual = 1;
const ofertasPorPagina = 9;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando búsqueda de empleos...');
    
    // Verificar autenticación
    const usuarioLogueado = sessionStorage.getItem('usuario_logueado');
    if (!usuarioLogueado) {
        window.location.href = './login_candidato.html';
        return;
    }

    // Inicializar elementos
    inicializarUsuario();
    cargarEmpresas();
    cargarOfertas();
    inicializarEventos();
});

// Inicializar información del usuario
function inicializarUsuario() {
    const nombreUsuario = sessionStorage.getItem('usuario_nombre') || 'Usuario';
    const nombreUsuarioSpan = document.getElementById('nombreUsuario');
    const usuarioAvatar = document.getElementById('usuarioAvatar');
    
    if (nombreUsuarioSpan) {
        nombreUsuarioSpan.textContent = nombreUsuario;
    }
    
    if (usuarioAvatar) {
        const iniciales = nombreUsuario.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        usuarioAvatar.textContent = iniciales;
    }
}

// Inicializar eventos
function inicializarEventos() {
    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Estás seguro que querés cerrar sesión?')) {
                sessionStorage.clear();
                window.location.href = './login_candidato.html';
            }
        });
    }

    // Formulario de búsqueda
    const formBusqueda = document.getElementById('formBusqueda');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    // Botón limpiar
    const btnLimpiar = document.getElementById('btnLimpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }

    // Filtros avanzados
    const btnFiltrosAvanzados = document.getElementById('btnFiltrosAvanzados');
    const filtrosAvanzados = document.getElementById('filtrosAvanzados');
    if (btnFiltrosAvanzados && filtrosAvanzados) {
        btnFiltrosAvanzados.addEventListener('click', () => {
            const estaVisible = filtrosAvanzados.style.display !== 'none';
            filtrosAvanzados.style.display = estaVisible ? 'none' : 'block';
        });
    }

    // Aplicar filtros del sidebar
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    }

    // Toggle de vista
    const botonesVista = document.querySelectorAll('.btn-vista');
    botonesVista.forEach(btn => {
        btn.addEventListener('click', function() {
            botonesVista.forEach(b => b.classList.remove('activo'));
            this.classList.add('activo');
            
            const vista = this.getAttribute('data-vista');
            const grid = document.getElementById('ofertasGrid');
            
            if (vista === 'lista') {
                grid.classList.add('vista-lista');
            } else {
                grid.classList.remove('vista-lista');
            }
        });
    });

    // Paginación
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                mostrarOfertas();
            }
        });
    }
    
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            const totalPaginas = Math.ceil(ofertasFiltradas.length / ofertasPorPagina);
            if (paginaActual < totalPaginas) {
                paginaActual++;
                mostrarOfertas();
            }
        });
    }

    // Ordenamiento
    const ordenarPor = document.getElementById('ordenarPor');
    if (ordenarPor) {
        ordenarPor.addEventListener('change', () => {
            ordenarOfertas();
            mostrarOfertas();
        });
    }
    
    // ===================================
    // EVENTOS DEL MODAL DE DETALLE DE OFERTA
    const modalDetalleOferta = document.getElementById('modalDetalleOferta');
    const btnCerrarDetalle = document.getElementById('modalCerrarDetalle');
    
    if (btnCerrarDetalle) {
        btnCerrarDetalle.addEventListener('click', () => {
            if (modalDetalleOferta) modalDetalleOferta.style.display = 'none';
        });
    }
    
    if (modalDetalleOferta) {
        // Cerrar al hacer clic fuera del modal
        modalDetalleOferta.addEventListener('click', (e) => {
            if (e.target === modalDetalleOferta) {
                modalDetalleOferta.style.display = 'none';
            }
        });
        
        // Asignar evento al botón de postular del modal de detalle
        const modalPostularBoton = document.getElementById('modalPostularBoton');
        if(modalPostularBoton) {
            modalPostularBoton.addEventListener('click', function() {
                const idOferta = this.getAttribute('data-id-oferta');
                if (idOferta) {
                    // Cerrar modal detalle antes de abrir postulación
                    if (modalDetalleOferta) modalDetalleOferta.style.display = 'none'; 
                    abrirModalPostulacion(idOferta); // Abrir modal de postulación
                }
            });
        }
    }
    // ===================================
}

// Cargar todas las ofertas
async function cargarOfertas() {
    const loader = document.getElementById('loader');
    const ofertasGrid = document.getElementById('ofertasGrid');
    
    try {
        loader.style.display = 'block';
        ofertasGrid.innerHTML = '';
        
        console.log('Cargando ofertas...');
        const response = await fetch(`${API_URL}/ofertas/todas`);
        
        if (!response.ok) {
            throw new Error('Error al cargar ofertas');
        }

        todasLasOfertas = await response.json();
        ofertasFiltradas = [...todasLasOfertas];
        
        console.log(`${todasLasOfertas.length} ofertas cargadas`);
        
        ordenarOfertas();
        mostrarOfertas();
        
    } catch (error) {
        console.error('Error al cargar ofertas:', error);
        ofertasGrid.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error al cargar ofertas</h3>
                <p>Por favor, intentá nuevamente más tarde.</p>
            </div>
        `;
        mostrarNotificacion('Error al cargar las ofertas', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

// Cargar empresas para el filtro
async function cargarEmpresas() {
    try {
        const response = await fetch(`${API_URL}/empresas/todas`);
        if (!response.ok) return;

        const empresas = await response.json();
        const selectEmpresa = document.getElementById('filtroEmpresa');
        
        if (selectEmpresa) {
            empresas.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.nombre;
                option.textContent = empresa.nombre;
                selectEmpresa.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar empresas:', error);
    }
}

// Aplicar filtros
function aplicarFiltros() {
    const busqueda = document.getElementById('inputBusqueda').value.toLowerCase();
    const ubicacion = document.getElementById('filtroUbicacion').value;
    const jornada = document.getElementById('filtroJornada').value;
    const empresa = document.getElementById('filtroEmpresa').value;
    const salarioMin = parseFloat(document.getElementById('salarioMin').value) || 0;
    const salarioMax = parseFloat(document.getElementById('salarioMax').value) || Infinity;
    
    // Filtro de fecha
    const fechaSeleccionada = document.querySelector('input[name="fecha"]:checked')?.value;
    
    ofertasFiltradas = todasLasOfertas.filter(oferta => {
        // Filtro de búsqueda
        const matchBusqueda = !busqueda || 
            oferta.nombre_puesto.toLowerCase().includes(busqueda) ||
            (oferta.nombre_empresa && oferta.nombre_empresa.toLowerCase().includes(busqueda)) ||
            (oferta.descripcion_puesto && oferta.descripcion_puesto.toLowerCase().includes(busqueda));
        
        // Filtro de ubicación
        const matchUbicacion = !ubicacion || oferta.ubicacion === ubicacion;
        
        // Filtro de jornada
        const matchJornada = !jornada || oferta.jornada === jornada;
        
        // Filtro de empresa
        const matchEmpresa = !empresa || oferta.nombre_empresa === empresa;
        
        // Filtro de salario
        const salarioOfertaMin = oferta.rango_salarial_min || 0;
        const salarioOfertaMax = oferta.rango_salarial_max || Infinity;
        const matchSalario = salarioOfertaMax >= salarioMin && salarioOfertaMin <= salarioMax;
        
        // Filtro de fecha
        let matchFecha = true;
        if (fechaSeleccionada && oferta.fecha_publicacion) {
            const fechaOferta = new Date(oferta.fecha_publicacion);
            const ahora = new Date();
            const diffDias = Math.floor((ahora - fechaOferta) / (1000 * 60 * 60 * 24));
            
            switch(fechaSeleccionada) {
                case 'hoy':
                    matchFecha = diffDias <= 1;
                    break;
                case 'semana':
                    matchFecha = diffDias <= 7;
                    break;
                case 'mes':
                    matchFecha = diffDias <= 30;
                    break;
            }
        }
        
        return matchBusqueda && matchUbicacion && matchJornada && 
               matchEmpresa && matchSalario && matchFecha;
    });
    
    paginaActual = 1;
    ordenarOfertas();
    mostrarOfertas();
    
    // Scroll suave a resultados
    document.querySelector('.ofertas-seccion').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('inputBusqueda').value = '';
    document.getElementById('filtroUbicacion').value = '';
    document.getElementById('filtroJornada').value = '';
    document.getElementById('filtroEmpresa').value = '';
    document.getElementById('salarioMin').value = '';
    document.getElementById('salarioMax').value = '';
    document.getElementById('ordenarPor').value = 'reciente';
    
    // Limpiar radio buttons
    const radioTodas = document.querySelector('input[name="fecha"][value=""]');
    if (radioTodas) radioTodas.checked = true;
    
    ofertasFiltradas = [...todasLasOfertas];
    paginaActual = 1;
    ordenarOfertas();
    mostrarOfertas();
    
    mostrarNotificacion('Filtros limpiados', 'info');
}

// Ordenar ofertas
function ordenarOfertas() {
    const ordenarPor = document.getElementById('ordenarPor').value;
    
    switch(ordenarPor) {
        case 'reciente':
            ofertasFiltradas.sort((a, b) => {
                const fechaA = a.fecha_publicacion ? new Date(a.fecha_publicacion) : new Date(0);
                const fechaB = b.fecha_publicacion ? new Date(b.fecha_publicacion) : new Date(0);
                return fechaB - fechaA;
            });
            break;
        case 'salario':
            ofertasFiltradas.sort((a, b) => 
                (b.rango_salarial_max || 0) - (a.rango_salarial_max || 0)
            );
            break;
        case 'alfabetico':
            ofertasFiltradas.sort((a, b) => 
                a.nombre_puesto.localeCompare(b.nombre_puesto)
            );
            break;
    }
}

// Mostrar ofertas con paginación
function mostrarOfertas() {
    const ofertasGrid = document.getElementById('ofertasGrid');
    const contadorResultados = document.getElementById('contadorResultados');
    const paginacion = document.getElementById('paginacion');
    const paginaActualSpan = document.getElementById('paginaActual');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    // Actualizar contador
    contadorResultados.innerHTML = `<strong>${ofertasFiltradas.length}</strong> ofertas encontradas`;
    
    // Si no hay ofertas
    if (ofertasFiltradas.length === 0) {
        ofertasGrid.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fas fa-search"></i>
                <h3>No se encontraron ofertas</h3>
                <p>Intentá con otros criterios de búsqueda</p>
            </div>
        `;
        paginacion.style.display = 'none';
        return;
    }
    
    // Calcular paginación
    const inicio = (paginaActual - 1) * ofertasPorPagina;
    const fin = inicio + ofertasPorPagina;
    const ofertasPagina = ofertasFiltradas.slice(inicio, fin);
    const totalPaginas = Math.ceil(ofertasFiltradas.length / ofertasPorPagina);
    
    // Mostrar ofertas
    ofertasGrid.innerHTML = ofertasPagina.map(oferta => crearCardOferta(oferta)).join('');
    
    // Agregar eventos a botones y cards
    document.querySelectorAll('.btn-postular').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evita que se dispare el evento de 'Ver Oferta' si estuviera en la card
            const idOferta = this.getAttribute('data-id-oferta');
            abrirModalPostulacion(idOferta);
        });
    });
    
    document.querySelectorAll('.btn-ver-oferta').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const idOferta = this.getAttribute('data-id-oferta');
            const oferta = ofertasFiltradas.find(o => String(o.id_oferta) === idOferta);
            if (oferta) {
                abrirModalDetalleOferta(oferta);
            }
        });
    });
    
    // Actualizar paginación
    if (totalPaginas > 1) {
        paginacion.style.display = 'flex';
        paginaActualSpan.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        btnAnterior.disabled = paginaActual === 1;
        btnSiguiente.disabled = paginaActual === totalPaginas;
    } else {
        paginacion.style.display = 'none';
    }
    
    // Scroll al inicio de resultados
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Crear card de oferta (ACTUALIZADA)
function crearCardOferta(oferta) {
    const salarioHtml = oferta.rango_salarial_min && oferta.rango_salarial_max 
        ? `<p class="oferta-salario">$${formatearNumero(oferta.rango_salarial_min)} - $${formatearNumero(oferta.rango_salarial_max)}</p>`
        : '<p class="oferta-salario">Salario a convenir</p>';
        
    return `
        <div class="oferta-card" data-id-oferta="${oferta.id_oferta}">
            <p class="oferta-empresa">${oferta.nombre_empresa || 'Empresa'}</p>
            <h3 class="oferta-titulo">${oferta.nombre_puesto}</h3>
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
                    <i class="fas fa-calendar"></i>
                    ${calcularDiasPublicacion(oferta.fecha_publicacion)}
                </span>
            </div>
            ${salarioHtml}
            <div class="oferta-card-botones">
                <button class="btn-ver-oferta" data-id-oferta="${oferta.id_oferta}">
                    <i class="fas fa-eye"></i> Ver Oferta
                </button>
                <button class="btn-postular" data-id-oferta="${oferta.id_oferta}">
                    Postularme
                </button>
            </div>
        </div>
    `;
}

// ===================================
// FUNCIÓN: Abrir modal de detalle de oferta
// USANDO SOLO descripcion_puesto
// ===================================
function abrirModalDetalleOferta(oferta) {
    // debugger; // Opcional: Descomenta esto para ver qué variables tienen 'null'

    const modalDetalleOferta = document.getElementById('modalDetalleOferta');
    
    // 🛑 CRÍTICO: Si el modal principal no existe, no sigas.
    if (!modalDetalleOferta) {
        console.error("CRÍTICO: El elemento '#modalDetalleOferta' no se encontró.");
        return; 
    }
    
    // Función auxiliar para poblar contenido y manejar elementos que pueden ser null
    const mapTextContent = (id, content, defaultValue = 'No especificado') => {
        const element = document.getElementById(id); // <--- Búsqueda de ID
        if (element) {
            // Se utiliza textContent, que funciona para la mayoría de elementos
            element.textContent = content || defaultValue;
        } else {
            // Advertencia si el ID no existe en el HTML
            console.warn(`Elemento HTML no encontrado: #${id}.`);
        }
    };

    const modalPostularBoton = document.getElementById('modalPostularBoton');
    if (modalPostularBoton) {
        modalPostularBoton.setAttribute('data-id-oferta', oferta.id_oferta);
    }
    
    // 1. Llenar los campos básicos
    mapTextContent('modalTitulo', oferta.nombre_puesto, 'Título no disponible');
    mapTextContent('modalEmpresa', oferta.nombre_empresa, 'Empresa Privada');
    mapTextContent('modalJornada', oferta.jornada, 'Full-time');
    mapTextContent('modalUbicacion', oferta.ubicacion, 'No especificado');

    // Salario
    const salarioTexto = oferta.rango_salarial_min && oferta.rango_salarial_max
        ? `$${formatearNumero(oferta.rango_salarial_min)} - $${formatearNumero(oferta.rango_salarial_max)}`
        : 'Salario a convenir';
    mapTextContent('modalSalario', salarioTexto);

    // 2. Descripción (usando descripcion_puesto)
    // El elemento puede ser un DIV, por lo que textContent funciona bien aquí.
    const descripcion = oferta.descripcion_puesto || 'No se proporcionó una descripción detallada para este puesto.';
    mapTextContent('modalDescripcion', descripcion);
    
    // 3. Listas dinámicas (Requisitos y Beneficios)
    const renderLista = (id, items) => {
        const ul = document.getElementById(id);
        const titulo = document.getElementById(id + 'Titulo'); // Ej: modalRequisitosTitulo
        
        if (!ul) {
            console.warn(`Contenedor de lista UL no encontrado: #${id}`);
            if (titulo) titulo.style.display = 'none';
            return;
        }
        
        ul.innerHTML = '';
        
        // Asume que los ítems ya son un array gracias al backend (Python)
        const itemsToRender = Array.isArray(items) ? items : [];
        
        if (itemsToRender.length > 0) {
            itemsToRender.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item; 
                ul.appendChild(li);
            });
            // Mostrar título si existe
            if (titulo) titulo.style.display = 'block'; 
        } else {
            // Ocultar título si está vacío
            if (titulo) titulo.style.display = 'none'; 
        }
    };
    
    // Llama a la función de renderizado
    renderLista('modalRequisitos', oferta.requisitos);
    renderLista('modalBeneficios', oferta.beneficios);

    // 4. Abrir el modal
    modalDetalleOferta.style.display = 'flex';
}

// Abrir modal de postulación (código existente, se mantiene para la postulación)
function abrirModalPostulacion(idOferta) {
    const usuarioEmail = sessionStorage.getItem('usuario_email');
    
    // Código para construir y mostrar el modal de postulación (se mantiene igual)
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-postulacion">
            <button class="modal-cerrar">&times;</button>
            <h2><i class="fas fa-file-alt"></i> Postulación</h2>
            <form id="formPostulacion">
                <div class="campo-grupo">
                    <label for="nombre">Nombre completo *</label>
                    <input type="text" id="nombre" required>
                </div>
                
                <div class="campo-grupo">
                    <label for="email">Email *</label>
                    <input type="email" id="email" value="${usuarioEmail}" required>
                </div>
                
                <div class="campo-grupo">
                    <label for="telefono">Teléfono *</label>
                    <input type="tel" id="telefono" required placeholder="+54 9 11 1234-5678">
                </div>
                
                <div class="campo-grupo">
                    <label for="salario">Salario mínimo esperado ($) *</label>
                    <input type="number" id="salario" required placeholder="500000">
                </div>
                
                <div class="campo-grupo">
                    <label for="jornada">Jornada disponible *</label>
                    <select id="jornada" required>
                        <option value="">Seleccionar...</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                    </select>
                </div>
                
                <div class="campo-grupo">
                    <label for="titulos">Títulos (separados por coma)</label>
                    <input type="text" id="titulos" placeholder="Ej: Lic. en Sistemas, MBA">
                </div>
                
                <div class="campo-grupo">
                    <label>Habilidades</label>
                    <div id="habilidadesContainer">
                        <div class="habilidad-item">
                            <input type="text" placeholder="Nombre habilidad" class="habilidad-nombre">
                            <select class="habilidad-nivel">
                                <option value="1">1 - Básico</option>
                                <option value="2">2 - Intermedio bajo</option>
                                <option value="3" selected>3 - Intermedio</option>
                                <option value="4">4 - Avanzado</option>
                                <option value="5">5 - Experto</option>
                            </select>
                        </div>
                    </div>
                    <button type="button" class="btn-agregar-habilidad">+ Agregar habilidad</button>
                </div>
                
                <div class="modal-botones">
                    <button type="button" class="btn-cancelar">Cancelar</button>
                    <button type="submit" class="btn-enviar-postulacion">
                        <i class="fas fa-paper-plane"></i> Enviar postulación
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Eventos del modal
    const btnCerrar = modal.querySelector('.modal-cerrar');
    const btnCancelar = modal.querySelector('.btn-cancelar');
    const btnAgregarHabilidad = modal.querySelector('.btn-agregar-habilidad');
    const formPostulacion = modal.querySelector('#formPostulacion');

    btnCerrar.addEventListener('click', () => modal.remove());
    btnCancelar.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    btnAgregarHabilidad.addEventListener('click', function() {
        const container = modal.querySelector('#habilidadesContainer');
        const nuevaHabilidad = document.createElement('div');
        nuevaHabilidad.className = 'habilidad-item';
        nuevaHabilidad.innerHTML = `
            <input type="text" placeholder="Nombre habilidad" class="habilidad-nombre">
            <select class="habilidad-nivel">
                <option value="1">1 - Básico</option>
                <option value="2">2 - Intermedio bajo</option>
                <option value="3" selected>3 - Intermedio</option>
                <option value="4">4 - Avanzado</option>
                <option value="5">5 - Experto</option>
            </select>
            <button type="button" class="btn-eliminar-habilidad">×</button>
        `;
        container.appendChild(nuevaHabilidad);

        nuevaHabilidad.querySelector('.btn-eliminar-habilidad').addEventListener('click', function() {
            nuevaHabilidad.remove();
        });
    });

    formPostulacion.addEventListener('submit', async function(e) {
        e.preventDefault();
        await enviarPostulacion(idOferta, modal);
    });
}

// Enviar postulación (se mantiene igual)
// buscar_empleos.js (Función para enviar la postulación)
async function enviarPostulacion(idOferta, modal) {
    // 1. Recopilación de Datos del Formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const salario = parseFloat(document.getElementById('salario').value);
    const jornada = document.getElementById('jornada').value;
    const titulosInput = document.getElementById('titulos').value;
    
    // 2. Procesamiento de Títulos (List[str])
    const titulos = titulosInput 
        ? titulosInput.split(',').map(t => t.trim()).filter(t => t)
        : [];

    // 3. Procesamiento de Habilidades (List[HabilidadInput])
    // CRÍTICO: Debe ser una lista de OBJETOS con claves "nombre" y "nivel" (int)
    const habilidadesItems = modal.querySelectorAll('.habilidad-item');
    const habilidades = Array.from(habilidadesItems)
        .map(item => {
            const nombreHab = item.querySelector('.habilidad-nombre').value.trim();
            const nivel = parseInt(item.querySelector('.habilidad-nivel').value);
            
            // Verificación: Solo incluir si el nombre existe
            return nombreHab ? { nombre: nombreHab, nivel: nivel } : null;
        })
        .filter(h => h !== null);

    // Verificación de campos obligatorios (opcional, pero buena práctica)
    if (!nombre || !email || !telefono || !salario || !jornada) {
        mostrarNotificacion('Por favor, complete todos los campos obligatorios.', 'error');
        return;
    }

    // 4. Construcción del Cuerpo de la Solicitud (Request Body)
    const datos = {
        nombre,
        email,
        telefono,
        salario_minimo: salario,
        jornada_disponible: jornada,
        titulos,
        habilidades // Esta es la lista de objetos procesada
    };

    // 5. Llamada a la API
    try {
        const btnEnviar = modal.querySelector('.btn-enviar-postulacion');
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        const response = await fetch(`${API_URL}/postulacion/oferta/${idOferta}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            // Intenta leer el detalle del error si no es un 404 simple
            const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
            console.error('Error al enviar postulación:', errorData);
            
            // 🛑 CRÍTICO: El backend devuelve status_code=404 si la oferta no existe.
            if (response.status === 404) {
                 throw new Error('La oferta de empleo no fue encontrada o ya no está disponible.');
            }
            throw new Error(errorData.detail || 'Error desconocido del servidor.');
        }

        const resultado = await response.json();
        console.log('Postulación exitosa:', resultado);

        mostrarNotificacion('¡Postulación enviada exitosamente!', 'success');
        modal.remove();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(`Error: ${error.message || 'Error al enviar la postulación. Intentá nuevamente.'}`, 'error');
        
        // Vuelve a habilitar el botón y restablece el texto
        const btnEnviar = modal.querySelector('.btn-enviar-postulacion');
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar postulación';
    }
}

// Utilidades (se mantienen iguales)
function calcularDiasPublicacion(fecha) {
    if (!fecha) return 'Reciente';
    const hoy = new Date();
    const fechaPub = new Date(fecha);
    const diff = Math.floor((hoy - fechaPub) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'hoy';
    if (diff === 1) return '1 día';
    if (diff < 7) return `${diff} días`;
    if (diff < 30) return `${Math.floor(diff / 7)} semanas`;
    return `${Math.floor(diff / 30)} meses`;
}

function formatearNumero(numero) {
    return new Intl.NumberFormat('es-AR').format(numero);
}

function mostrarNotificacion(mensaje, tipo) {
    const notifAnterior = document.querySelector('.notificacion');
    if (notifAnterior) {
        notifAnterior.remove();
    }

    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    
    let icono = 'info-circle';
    if (tipo === 'success') icono = 'check-circle';
    if (tipo === 'error') icono = 'exclamation-circle';
    
    notificacion.innerHTML = `
        <i class="fas fa-${icono}"></i>
        <span>${mensaje}</span>
    `;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.classList.add('ocultar');
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}