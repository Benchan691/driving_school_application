import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiRotateCcw, FiLayers, FiFileText, FiCheck, FiStar, FiCreditCard } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../payment/PaymentModal';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/apiBase';

const Packages = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    page: {
      title: "Driving Lesson Packages",
      subtitle: "Choose the perfect package for your driving journey. Flexible options designed to fit your learning needs and schedule."
    },
    footer: {
      title: "Need Help Choosing?",
      text: "Our experienced instructors can help you select the perfect package based on your driving experience and goals. Contact us for personalized recommendations.",
      buttonText: "Contact Us"
    }
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to map package names to icons
  const getIconForPackage = (name) => {
    const iconMap = {
      '1 Hour Driving Lesson': 'FiTruck',
      '1.5 Hours Driving Lessons': 'FiRotateCcw',
      'Package A': 'FiLayers',
      'Package B': 'FiLayers',
      'Package C': 'FiLayers',
      'Road Test': 'FiFileText'
    };
    return iconMap[name] || 'FiTruck';
  };

  // Fetch packages from database API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/packages`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform database packages to match expected frontend format
          const transformedPackages = data.data.map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: parseFloat(pkg.price),
            originalPrice: parseFloat(pkg.original_price || pkg.price),
            duration: pkg.duration_hours ? (() => {
              const hours = parseFloat(pkg.duration_hours);
              const formattedHours = hours % 1 === 0 ? hours.toFixed(0) : hours;
              return `${formattedHours} ${hours === 1 ? 'hour' : 'hours'} total`;
            })() : `${pkg.number_of_lessons} lessons`,
            lessons: pkg.number_of_lessons,
            icon: getIconForPackage(pkg.name),
            popular: pkg.is_popular || false,
            features: Array.isArray(pkg.features) ? pkg.features : []
          }));
          
          setPackages(transformedPackages);
        } else {
          toast.error('Failed to load packages');
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, []);
  
  const iconMap = { FiTruck, FiRotateCcw, FiLayers, FiFileText };
  const packagesWithIcons = packages.map(p => ({ ...p, IconComponent: iconMap[p.icon] || FiTruck }));

  const handlePurchaseClick = (packageData) => {
    setSelectedPackage(packageData);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (result) => {
    toast.success('Payment successful! Your package has been purchased.');
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPackage(null);
  };

  if (loading) {
    return (
      <div className="packages-page">
        <div className="container">
          <div className="loading-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h2>Loading packages...</h2>
          </div>
        </div>
      </div>
    );
  }

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
          {packagesWithIcons.map((pkg, index) => {
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
                  </div>
                  <p className="duration">{pkg.duration}</p>
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

