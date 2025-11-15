import React from 'react';
import styles from './footer.module.css';

const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.container}>
            <div className={styles.grid}>
                {/* Columna 1 */}
                <div>
                    <h4 className={styles.colTitle}>BolsaEmpleo</h4>
                    <ul className={styles.colList}>
                        <li><a href="#" className={styles.link}>Sobre Nosotros</a></li>
                        <li><a href="#" className={styles.link}>Prensa</a></li>
                        <li><a href="#" className={styles.link}>Contacto</a></li>
                    </ul>
                </div>
                {/* Columna 2 */}
                <div>
                    <h4 className={styles.colTitle}>Candidatos</h4>
                    <ul className={styles.colList}>
                        <li><a href="#" className={styles.link}>Buscar Empleo</a></li>
                        <li><a href="#" className={styles.link}>Subir CV</a></li>
                        <li><a href="#" className={styles.link}>Alertas de Empleo</a></li>
                    </ul>
                </div>
                {/* Columna 3 */}
                <div>
                    <h4 className={styles.colTitle}>Empresas</h4>
                    <ul className={styles.colList}>
                        <li><a href="#" className={styles.link}>Publicar Ofertas</a></li>
                        <li><a href="#" className={styles.link}>Tarifas</a></li>
                        <li><a href="#" className={styles.link}>Soluciones RRHH</a></li>
                    </ul>
                </div>
                {/* Columna 4 */}
                <div>
                    <h4 className={styles.colTitle}>Legal</h4>
                    <ul className={styles.colList}>
                        <li><a href="#" className={styles.link}>Términos y Condiciones</a></li>
                        <li><a href="#" className={styles.link}>Política de Privacidad</a></li>
                    </ul>
                </div>
            </div>

            <div className={styles.copyright}>
                &copy; {new Date().getFullYear()} BolsaEmpleo.pro. Todos los derechos reservados.
            </div>
        </div>
    </footer>
);

export default Footer;