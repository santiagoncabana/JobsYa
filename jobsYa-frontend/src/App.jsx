import React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Hero from './components/Hero/Hero';
import SectionCards from './components/Sections/SectionCards';
import TopCategories from './components/Sections/TopCategories';
import FeaturedCompanies from './components/Sections/FeaturedCompanies';
import CTABanner from './components/Sections/CTABanner';
import styles from './app.module.css';

export default function App() {
  return (
    <div className={styles.appWrapper}>
      <Header />
      <main className={styles.mainContent}>
        <Hero />
        <SectionCards />
        <TopCategories />
        <FeaturedCompanies />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}