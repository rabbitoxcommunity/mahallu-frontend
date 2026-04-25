import React from 'react';
import Header from '../components/website/Header';
import Hero from '../components/website/Hero';
import Features from '../components/website/Features';
import HowItWorks from '../components/website/HowItWorks';
import Benefits from '../components/website/Benefits';
import CTA from '../components/website/CTA';
import Footer from '../components/website/Footer';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <Hero />
                <Features />
                <HowItWorks />
                <Benefits />
                <CTA />
            </main>
            <Footer />
        </div>
    );
};

export default Landing;
