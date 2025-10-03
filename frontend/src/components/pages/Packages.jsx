import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiBookOpen, FiAward, FiCheck, FiStar, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../payment/PaymentModal';
import toast from 'react-hot-toast';
import content from '../../content/packages.json';

const Packages = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const iconMap = { FiTruck, FiBookOpen, FiAward };
  const packages = content.packages.map(p => ({ ...p, IconComponent: iconMap[p.icon] || FiTruck }));

  const handlePurchaseClick = (packageData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase a package');
      return;
    }
    
    console.log('Opening payment modal for package:', packageData);
    setSelectedPackage(packageData);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    toast.success('Payment successful! Your package has been purchased.');
    // You can redirect to dashboard or show success message
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPackage(null);
  };

  return (
    <div className="packages-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>{content.page.title}</h1>
          <p>{content.page.subtitle}</p>
        </motion.div>

        <div className="packages-grid">
          {packages.map((pkg, index) => {
            const IconComponent = pkg.IconComponent;
            return (
              <motion.div
                key={pkg.id}
                className={`package-card ${pkg.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {pkg.popular && (
                  <div className="popular-badge">
                    <FiStar />
                    Most Popular
                  </div>
                )}
                
                <div className="package-header">
                  <div className="package-icon">
                    <IconComponent />
                  </div>
                  <h3>{pkg.name}</h3>
                  <p className="package-description">{pkg.description}</p>
                </div>

                <div className="package-pricing">
                  <div className="price-container">
                    <span className="current-price">${pkg.price}</span>
                    <span className="original-price">${pkg.originalPrice}</span>
                  </div>
                  <p className="duration">{pkg.duration}</p>
                  <div className="savings">
                    Save ${pkg.originalPrice - pkg.price}
                  </div>
                </div>

                <div className="package-features">
                  <h4>What's included:</h4>
                  <ul>
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>
                        <FiCheck />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="package-actions">
                  <button
                    onClick={() => handlePurchaseClick(pkg)}
                    className="btn btn-primary btn-full"
                  >
                    <FiCreditCard />
                    Purchase Now - ${pkg.price}
                  </button>
                  <Link to="/contact" className="btn btn-outline btn-full" onClick={scrollToTop}>
                    Ask Questions
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="packages-footer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
                  <h3>{content.footer.title}</h3>
                  <p>{content.footer.text}</p>
          <Link to="/contact" className="btn btn-outline" onClick={scrollToTop}>
            {content.footer.buttonText}
          </Link>
        </motion.div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        packageData={selectedPackage}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Packages;

