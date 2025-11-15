module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de Colores Propuesta (Única y Distintiva):
        primary: '#1A535C',   // Azul Profundo/Verde Azulado Oscuro
        accent: '#4ECDC4',    // Verde Menta/Aguamarina
        background: '#F7FFF7', // Gris Claro Cálido
        textDark: '#3B3B3B',  // Gris Oscuro Suave
        success: '#FFE66D',   // Amarillo Suave (Éxito/Notificación)
      },
      fontFamily: {
        // Usando Inter como fuente moderna (debes instalarla o importarla)
        sans: ['Inter', 'sans-serif'], 
      },
      boxShadow: {
        // Sombra más profunda para el efecto moderno
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}