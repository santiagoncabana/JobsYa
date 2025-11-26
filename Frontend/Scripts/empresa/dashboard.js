// ============================================
// DASHBOARD EMPRESA - JobsYa
// ============================================

// Verificar si hay una sesión activa al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    cargarDatosEmpresa();
});

// ============================================
// VERIFICAR SESIÓN
// ============================================
function verificarSesion() {
    const empresaData = localStorage.getItem('empresa');
    
    if (!empresaData) {
        // Si no hay datos de empresa, redirigir al login
        alert('Debes iniciar sesión primero');
        window.location.href = '../../pages/pages_empresas/login_empresa.html'; // Ajusta la ruta según tu estructura
        return;
    }
}

// ============================================
// CARGAR DATOS DE LA EMPRESA
// ============================================
function cargarDatosEmpresa() {
    const empresaData = localStorage.getItem('empresa');
    
    if (empresaData) {
        try {
            const empresa = JSON.parse(empresaData);
            
            // Mostrar el nombre de la empresa en el mensaje de bienvenida
            const nombreBienvenida = document.getElementById('nombreEmpresaBienvenida');
            if (nombreBienvenida) {
                nombreBienvenida.textContent = empresa.nombre || '[Nombre Empresa]';
            }
            
            // Mostrar el nombre en el nav (opcional)
            const navNombre = document.getElementById('navNombreEmpresa');
            if (navNombre) {
                navNombre.textContent = empresa.nombre || 'Mi Perfil';
            }
            
        } catch (error) {
            console.error('Error al cargar datos de la empresa:', error);
        }
    }
}

// ============================================
// CERRAR SESIÓN
// ============================================
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            // Limpiar localStorage
            localStorage.removeItem('empresa');
            
            // Redirigir al login o página principal
            window.location.href = '../../pages/pages_empresas/login_empresa.html'; // Ajusta la ruta según tu estructura
        }
    });
}