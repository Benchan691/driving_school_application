import React from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiBookOpen, FiTarget, FiAward, FiCheck, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Packages = () => {
  const packages = [
    {
      id: 1,
      name: "Beginner Package",
      price: 299,
      originalPrice: 399,
      duration: "10 lessons",
      icon: FiTruck,
      popular: false,
      features: [
        "Basic vehicle controls",
        "Traffic rules and signs",
        "Safe driving practices",
        "Parking techniques",
        "Highway Code basics",
        "Progress tracking"
      ],
      description: "Perfect for new drivers starting their journey. Learn the fundamentals of driving safely and confidently."
    },
    {
      id: 2,
      name: "Complete Package",
      price: 499,
      originalPrice: 699,
      duration: "20 lessons",
      icon: FiBookOpen,
      popular: true,
      features: [
        "Everything in Beginner Package",
        "Advanced driving techniques",
        "Theory classes included",
        "Mock driving tests",
        "Test preparation",
        "Highway Code mastery",
        "Emergency procedures",
        "Free retest if needed"
      ],
      description: "Our most popular package! Comprehensive training covering all aspects of driving education."
    },
    {
      id: 3,
      name: "Premium Package",
      price: 799,
      originalPrice: 999,
      duration: "30 lessons",
      icon: FiAward,
      popular: false,
      features: [
        "Everything in Complete Package",
        "Intensive test preparation",
        "Personal instructor",
        "Flexible scheduling",
        "Home pickup service",
        "Theory test guarantee",
        "Practical test guarantee",
        "Post-license support",
        "Advanced driving skills"
      ],
      description: "Premium experience with guaranteed results. Perfect for those who want the best possible preparation."
    }
  ];

  return (
    <div className="packages-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Our Packages</h1>
          <p>Choose the perfect driving package tailored to your needs and budget</p>
        </motion.div>

        <div className="packages-grid">
          {packages.map((pkg, index) => {
            const IconComponent = pkg.icon;
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
                  <Link to="/register" className="btn btn-primary btn-full">
                    Choose Package
                  </Link>
                  <Link to="/contact" className="btn btn-outline btn-full">
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
          <h3>Need a Custom Package?</h3>
          <p>We understand every learner is different. Contact us to discuss a personalized package that fits your specific needs and schedule.</p>
          <Link to="/contact" className="btn btn-outline">
            Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Packages;
