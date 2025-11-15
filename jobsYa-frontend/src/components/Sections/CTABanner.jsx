import React from 'react';
import Button from '../UI/Button';
import styles from './ctaBanner.module.css';

const CTABanner = () => (
    <section className={styles.section}>
        <div className={styles.container}>
            <h2 className={styles.title}>
                ¿Listo para dar el siguiente paso?
            </h2>
            <p className={styles.subtitle}>
                Únete a nuestra plataforma y accede a las mejores ofertas del mercado. Es rápido y gratuito.
            </p>
            <Button primary={true} className={styles.ctaButton}>
                Crea tu Perfil Ahora
            </Button>
        </div>
    </section>
);

export default CTABanner;