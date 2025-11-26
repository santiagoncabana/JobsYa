// register.js
console.log('Script de registro cargado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando...');
    
    // Elementos del DOM
    const form = document.querySelector('form');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const emailInput = document.getElementById('email');
    const contrasenaInput = document.getElementById('contrasena');
    const confirmarContrasenaInput = document.getElementById('confirmar-contrasena');
    const terminosCheckbox = document.getElementById('terminos');
    const botonRegistro = document.querySelector('.boton-registro');
    const tipoOpciones = document.querySelectorAll('.tipo-opcion');

    // Verificar que todos los elementos existen
    console.log('Elementos encontrados:', {
        form: !!form,
        nombreInput: !!nombreInput,
        apellidoInput: !!apellidoInput,
        emailInput: !!emailInput,
        contrasenaInput: !!contrasenaInput,
        confirmarContrasenaInput: !!confirmarContrasenaInput,
        terminosCheckbox: !!terminosCheckbox,
        botonRegistro: !!botonRegistro
    });

    if (!form) {
        console.error('No se encontró el formulario');
        return;
    }

    let tipoUsuario = 'candidato'; // Por defecto

    // Manejo del selector de tipo de usuario
    tipoOpciones.forEach(opcion => {
        opcion.addEventListener('click', function() {
            console.log('Tipo de usuario seleccionado');
            tipoOpciones.forEach(o => o.classList.remove('activo'));
            this.classList.add('activo');
            
            const texto = this.querySelector('span').textContent;
            tipoUsuario = texto === 'Busco empleo' ? 'candidato' : 'empresa';
            console.log('Tipo usuario:', tipoUsuario);
        });
    });

    // Validación en tiempo real
    nombreInput?.addEventListener('blur', () => validarCampo(nombreInput, validarNombre));
    apellidoInput?.addEventListener('blur', () => validarCampo(apellidoInput, validarNombre));
    emailInput?.addEventListener('blur', () => validarCampo(emailInput, validarEmail));
    contrasenaInput?.addEventListener('input', validarContrasena);
    confirmarContrasenaInput?.addEventListener('input', validarConfirmacion);

    // Funciones de validación
    function validarNombre(valor) {
        if (valor.trim().length < 2) {
            return 'Debe tener al menos 2 caracteres';
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
            return 'Solo se permiten letras';
        }
        return null;
    }

    function validarEmail(valor) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(valor)) {
            return 'Ingresá un email válido';
        }
        return null;
    }

    function validarContrasena() {
        const valor = contrasenaInput.value;
        const errors = [];
        
        if (valor.length < 8) {
            errors.push('mínimo 8 caracteres');
        }
        if (!/[A-Z]/.test(valor)) {
            errors.push('una mayúscula');
        }
        if (!/[a-z]/.test(valor)) {
            errors.push('una minúscula');
        }
        if (!/[0-9]/.test(valor)) {
            errors.push('un número');
        }

        mostrarError(contrasenaInput, errors.length > 0 ? `Falta: ${errors.join(', ')}` : null);
        
        // Validar confirmación si ya tiene valor
        if (confirmarContrasenaInput.value) {
            validarConfirmacion();
        }
    }

    function validarConfirmacion() {
        const valor = confirmarContrasenaInput.value;
        const error = valor !== contrasenaInput.value ? 'Las contraseñas no coinciden' : null;
        mostrarError(confirmarContrasenaInput, error);
    }

    function validarCampo(input, validador) {
        const error = validador(input.value);
        mostrarError(input, error);
    }

    function mostrarError(input, mensaje) {
        const grupo = input.closest('.campo-grupo');
        const errorExistente = grupo.querySelector('.error-mensaje');
        
        if (errorExistente) {
            errorExistente.remove();
        }

        if (mensaje) {
            input.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-mensaje';
            errorDiv.textContent = mensaje;
            grupo.appendChild(errorDiv);
        } else {
            input.classList.remove('error');
        }
    }

    // Validación completa del formulario
    function validarFormulario() {
        console.log('Validando formulario...');
        let esValido = true;

        // Validar nombre
        const errorNombre = validarNombre(nombreInput.value);
        if (errorNombre) {
            console.log('Error en nombre:', errorNombre);
            mostrarError(nombreInput, errorNombre);
            esValido = false;
        }

        // Validar apellido
        const errorApellido = validarNombre(apellidoInput.value);
        if (errorApellido) {
            console.log('Error en apellido:', errorApellido);
            mostrarError(apellidoInput, errorApellido);
            esValido = false;
        }

        // Validar email
        const errorEmail = validarEmail(emailInput.value);
        if (errorEmail) {
            console.log('Error en email:', errorEmail);
            mostrarError(emailInput, errorEmail);
            esValido = false;
        }

        // Validar contraseña
        const contrasena = contrasenaInput.value;
        if (contrasena.length < 8 || !/[A-Z]/.test(contrasena) || 
            !/[a-z]/.test(contrasena) || !/[0-9]/.test(contrasena)) {
            console.log('Error en contraseña');
            mostrarError(contrasenaInput, 'La contraseña no cumple los requisitos');
            esValido = false;
        }

        // Validar confirmación
        if (confirmarContrasenaInput.value !== contrasena) {
            console.log('Error en confirmación');
            mostrarError(confirmarContrasenaInput, 'Las contraseñas no coinciden');
            esValido = false;
        }

        // Validar términos
        if (!terminosCheckbox.checked) {
            console.log('Términos no aceptados');
            mostrarNotificacion('Debes aceptar los términos y condiciones', 'error');
            esValido = false;
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

        console.log('Formulario válido, procediendo con el registro...');

        // Deshabilitar botón mientras se procesa
        botonRegistro.disabled = true;
        botonRegistro.textContent = 'Creando cuenta...';

        const datos = {
            email: emailInput.value.trim(),
            contrasena: contrasenaInput.value,
            nombre: nombreInput.value.trim(),
            apellido: apellidoInput.value.trim()
        };

        console.log('Datos a enviar:', { ...datos, contrasena: '***' });

        try {
            console.log('Enviando petición a la API...');
            // Cambiá el puerto si tu backend usa otro (ej: 8080, 3000, etc.)
            const response = await fetch('http://127.0.0.1:8000/auth/register', {
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
                mostrarNotificacion('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
                
                // Guardar el nombre del usuario en sessionStorage
                const nombreCompleto = `${nombreInput.value.trim()} ${apellidoInput.value.trim()}`;
                sessionStorage.setItem('usuario_nombre', nombreCompleto);
                sessionStorage.setItem('usuario_email', emailInput.value.trim());
                
                // Redirigir según el tipo de usuario
                setTimeout(() => {
                    if (tipoUsuario === 'candidato') {
                        window.location.href = './login_candidato.html';
                    } else {
                        window.location.href = './login_empresa.html';
                    }
                }, 1500);
            } else {
                // Manejar errores específicos
                if (response.status === 400) {
                    mostrarNotificacion('El email ya está registrado', 'error');
                } else {
                    mostrarNotificacion(resultado.detail || 'Error al crear la cuenta', 'error');
                }
                botonRegistro.disabled = false;
                botonRegistro.textContent = 'Crear mi cuenta';
            }
        } catch (error) {
            console.error('Error al enviar:', error);
            mostrarNotificacion('Error de conexión. Intentá nuevamente.', 'error');
            botonRegistro.disabled = false;
            botonRegistro.textContent = 'Crear mi cuenta';
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
        notificacion.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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

    console.log('Inicialización completa');
});