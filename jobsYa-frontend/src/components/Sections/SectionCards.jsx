import React from 'react';
import { User, Briefcase } from 'lucide-react';
import ContentCard from '../UI/ContentCard';
import styles from './sectionCards.module.css';

const SectionCards = () => (
    <section className={styles.section}>
        <div className={styles.container}>
            <h2 className={styles.title}>
                Impulsa tu carrera profesional
            </h2>

            <div className={styles.cardGrid}>
                <ContentCard
                    title="Mejora tu CV"
                    description="Aprende a redactar un currículum que capture la atención de los reclutadores y destaca de la competencia."
                    icon={User}
                    bgColor="bgSuccess" // Mapeado a una clase de color de fondo en CSS Modules
                    buttonText="Ver Guía Completa"
                    link="#"
                />
                <ContentCard
                    title="Cursos Online Gratuitos"
                    description="Descubre formaciones y certificaciones en las áreas de mayor demanda laboral y haz crecer tu potencial."
                    icon={Briefcase}
                    bgColor="bgAccent" // Mapeado a una clase de color de fondo en CSS Modules
                    buttonText="Explorar Cursos"
                    link="#"
                />
            </div>
        </div>
    </section>
);

export default SectionCards;