import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './contentCard.module.css';

const ContentCard = ({ title, description, icon: Icon, bgColor, buttonText, link }) => (
    <div
        className={`${styles.card} ${styles[bgColor]}`}
        style={{ minHeight: '220px' }}
    >
        <div className={styles.iconContainer}>
            {Icon && <Icon className={styles.icon} />}
            <div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
        <a href={link} className={styles.linkWrapper}>
            <div className={styles.linkContent}>
                {buttonText} <ArrowRight className={styles.arrowIcon} />
            </div>
        </a>
    </div>
);

export default ContentCard;