// login_candidato.js
console.log('Script de login cargado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando login...');
    
    // Elementos del DOM
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const contrasenaInput = document.getElementById('contrasena');
    const toggleContrasena = document.querySelector('.toggle-contrasena');
    const recordarmeCheckbox = document.querySelector('.recordarme input[type="checkbox"]');
    const botonLogin = document.querySelector('.boton-login');

    // Verificar elementos
    console.log('Elementos encontrados:', {
        form: !!form,
        emailInput: !!emailInput,
        contrasenaInput: !!contrasenaInput,
        botonLogin: !!botonLogin
    });

    if (!form) {
        console.error('No se encontró el formulario');
        return;
    }

    // Cargar email guardado si existe
    const emailGuardado = localStorage.getItem('email_recordado');
    if (emailGuardado) {
        emailInput.value = emailGuardado;
        recordarmeCheckbox.checked = true;
    }

    // Toggle mostrar/ocultar contraseña
    if (toggleContrasena) {
        toggleContrasena.addEventListener('click', function() {
            const tipo = contrasenaInput.type === 'password' ? 'text' : 'password';
            contrasenaInput.type = tipo;
            
            const icono = this.querySelector('i');
            icono.classList.toggle('fa-eye');
            icono.classList.toggle('fa-eye-slash');
        });
    }

    // Validación de email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Mostrar errores
    function mostrarError(input, mensaje) {
        const grupo = input.closest('.campo-grupo');
        let errorDiv = grupo.querySelector('.error-mensaje');
        
        // Remover error anterior
        if (errorDiv) {
            errorDiv.remove();
        }

        if (mensaje) {
            input.classList.add('error');
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-mensaje';
            errorDiv.textContent = mensaje;
            grupo.appendChild(errorDiv);
        } else {
            input.classList.remove('error');
        }
    }

    // Validar formulario
    function validarFormulario() {
        console.log('Validando formulario de login...');
        let esValido = true;

        // Validar email
        if (!emailInput.value.trim()) {
            mostrarError(emailInput, 'El email es requerido');
            esValido = false;
        } else if (!validarEmail(emailInput.value)) {
            mostrarError(emailInput, 'Ingresá un email válido');
            esValido = false;
        } else {
            mostrarError(emailInput, null);
        }

        // Validar contraseña
        if (!contrasenaInput.value) {
            mostrarError(contrasenaInput, 'La contraseña es requerida');
            esValido = false;
        } else {
            mostrarError(contrasenaInput, null);
        }

        console.log('Formulario válido:', esValido);
        return esValido;
    }

    // Manejo del envío del formulario
    form.addEventListener('submit', async function(e) {
        console.log('Submit event disparado');
        e.preventDefault();
        console.log('Prevención de envío por defecto aplicada');

        if (!validarFormulario()) {
            console.log('Validación falló, deteniendo envío');
            return;
        }

        console.log('Formulario válido, procediendo con el login...');

        // Deshabilitar botón mientras se procesa
        botonLogin.disabled = true;
        const textoOriginal = botonLogin.innerHTML;
        botonLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

        const datos = {
            email: emailInput.value.trim(),
            contrasena: contrasenaInput.value
        };

        console.log('Datos a enviar:', { email: datos.email, contrasena: '***' });

        try {
            console.log('Enviando petición a la API...');
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            console.log('Respuesta recibida:', response.status);
            const resultado = await response.json();
            console.log('Resultado:', resultado);

            if (response.ok) {
                // Login exitoso
                mostrarNotificacion('¡Inicio de sesión exitoso!', 'success');
                
                // Guardar email si está marcado "Recordarme"
                if (recordarmeCheckbox.checked) {
                    localStorage.setItem('email_recordado', datos.email);
                } else {
                    localStorage.removeItem('email_recordado');
                }

                // Guardar datos del usuario (token, email, nombre, etc.)
                sessionStorage.setItem('usuario_email', resultado.email || datos.email);
                sessionStorage.setItem('usuario_logueado', 'true');
                
                // 🔑 CRÍTICO: GUARDAR ID DE USUARIO
                // Esta línea es necesaria para que 'Mis Postulaciones' sepa qué datos cargar.
                // Ajusta 'resultado.id_usuario' o 'resultado.id' según el nombre del campo que devuelva tu backend.
                sessionStorage.setItem('usuario_id', resultado.id_usuario || resultado.id); 

                // Si el backend devuelve el nombre, guardarlo
                if (resultado.nombre) {
                    const nombreCompleto = resultado.apellido 
                        ? `${resultado.nombre} ${resultado.apellido}`
                        : resultado.nombre;
                    sessionStorage.setItem('usuario_nombre', nombreCompleto);
                }

                // Redirigir al dashboard después de 1 segundo
                setTimeout(() => {
                    window.location.href = '/Frontend/pages/pages_candidatos/dashboard-candidato.html';
                }, 1000);
                
            } else {
                // Manejar errores
                if (response.status === 401) {
                    mostrarNotificacion('Credenciales incorrectas. Verificá tu email y contraseña.', 'error');
                } else {
                    mostrarNotificacion(resultado.detail || 'Error al iniciar sesión', 'error');
                }
                botonLogin.disabled = false;
                botonLogin.innerHTML = textoOriginal;
            }
        } catch (error) {
            console.error('Error al enviar:', error);
            mostrarNotificacion('Error de conexión. Verificá que el servidor esté corriendo.', 'error');
            botonLogin.disabled = false;
            botonLogin.innerHTML = textoOriginal;
        }
    });

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo) {
        console.log('Mostrando notificación:', mensaje, tipo);
        
        // Eliminar notificación anterior si existe
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

        // Remover después de 4 segundos
        setTimeout(() => {
            notificacion.classList.add('ocultar');
            setTimeout(() => notificacion.remove(), 300);
        }, 4000);
    }

    // Manejo de botones sociales
    document.querySelectorAll('.boton-social').forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            const red = this.classList.contains('google') ? 'Google' : 'LinkedIn';
            mostrarNotificacion(`Función de ${red} próximamente disponible`, 'info');
        });
    });

    // Limpiar errores al escribir
    emailInput.addEventListener('input', () => mostrarError(emailInput, null));
    contrasenaInput.addEventListener('input', () => mostrarError(contrasenaInput, null));

    console.log('Inicialización de login completa');
});