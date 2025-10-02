import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiBookOpen, FiMessageCircle, FiTag, FiHeart, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import homeContent from '../../content/home.json';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user?.user_type === 'admin' ? '/dashboard/admin' : '/dashboard';
  
  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideshowImages = [
    '/pictures/result/1.jpg',
    '/pictures/result/2.jpg',
    '/pictures/result/3.jpg',
    '/pictures/result/4.jpg'
  ];

  // Reviews slider state
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const reviews = homeContent.reviews.items;

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slideshowImages.length]);

  // Auto-advance reviews slider with resettable timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 30000); // Change review every 30 seconds

    return () => clearInterval(timer);
  }, [reviews.length, currentReviewIndex]); // Add currentReviewIndex to dependencies to reset timer

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToReview = (index) => {
    setCurrentReviewIndex(index);
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar 
        key={index} 
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      />
    ));
  };
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1>{homeContent.hero.title}</h1>
              <p className="hero-subtitle">{homeContent.hero.subtitle}</p>
              <div className="hero-buttons">
                <Link to={isAuthenticated ? dashboardPath : '/register'} className="btn btn-primary btn-lg">
                  {homeContent.hero.primaryCtaText}
                </Link>
                <Link to="/packages" className="btn btn-outline btn-lg">
                  {homeContent.hero.secondaryCtaText}
                </Link>
              </div>
              <div className="hero-highlights">
                {homeContent.hero.highlights.map((highlight, index) => (
                  <div key={index} className="highlight-item">
                    <FiHeart className="highlight-icon" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="hero-image"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="slideshow-container">
                <div className="slideshow-wrapper">
                  {slideshowImages.map((image, index) => (
                    <div
                      key={index}
                      className={`slide ${index === currentSlide ? 'active' : ''}`}
                      style={{ display: index === currentSlide ? 'block' : 'none' }}
                    >
                      <img 
                        src={image} 
                        alt={`Driving lesson ${index + 1}`}
                        className="slideshow-image"
                        onError={(e) => {
                          console.error(`Failed to load image: ${image}`);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => console.log(`Image loaded: ${image}`)}
                      />
                    </div>
                  ))}
                  
                  {/* Navigation Arrows */}
                  <button 
                    className="slideshow-nav prev" 
                    onClick={prevSlide}
                    aria-label="Previous slide"
                  >
                    <FiChevronLeft />
                  </button>
                  <button 
                    className="slideshow-nav next" 
                    onClick={nextSlide}
                    aria-label="Next slide"
                  >
                    <FiChevronRight />
                  </button>
                </div>
                
                {/* Pagination Dots */}
                <div className="slideshow-pagination">
                  {slideshowImages.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>{homeContent.features.heading}</h2>
            <p>{homeContent.features.subheading}</p>
          </motion.div>

          <div className="features-grid grid grid-3">
            {homeContent.features.items.map((item, idx) => {
              const Icon = { FiBookOpen, FiMessageCircle, FiTag }[item.icon] || FiBookOpen;
              return (
                <motion.div
                  key={idx}
                  className="feature-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
                  viewport={{ once: true }}
                >
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews-section" className="reviews-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>{homeContent.reviews.heading}</h2>
            <p>{homeContent.reviews.subheading}</p>
          </motion.div>

          <motion.div
            className="reviews-slider"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="reviews-container">
              <button 
                className="reviews-nav prev" 
                onClick={prevReview}
                aria-label="Previous review"
              >
                <FiChevronLeft />
              </button>
              
              <div className="reviews-content">
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    className={`review-card ${index === currentReviewIndex ? 'active' : ''}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ 
                      opacity: index === currentReviewIndex ? 1 : 0,
                      x: index === currentReviewIndex ? 0 : 50
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="avatar">{review.avatar}</div>
                        <div className="reviewer-details">
                          <h4>{review.name}</h4>
                          <span className="review-date">{review.date}</span>
                        </div>
                      </div>
                      <div className="google-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Google</span>
                      </div>
                    </div>
                    
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    
                    <blockquote className="review-text">
                      "{review.text}"
                    </blockquote>
                  </motion.div>
                ))}
              </div>
              
              <button 
                className="reviews-nav next" 
                onClick={nextReview}
                aria-label="Next review"
              >
                <FiChevronRight />
              </button>
            </div>
            
            <div className="reviews-pagination">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  className={`review-dot ${index === currentReviewIndex ? 'active' : ''}`}
                  onClick={() => goToReview(index)}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Cards Section */}
      <section className="services-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>{homeContent.services.heading}</h2>
            <p>{homeContent.services.subheading}</p>
          </motion.div>

          <div className="services-grid grid grid-3">
            {homeContent.services.cards.map((card, idx) => {
              const Icon = { FiUsers, FiMessageCircle, FiTag }[card.icon] || FiUsers;
              let linkPath = '/packages';
              if (card.title === 'About Us') {
                linkPath = '/about';
              } else if (card.title === 'Testimonials') {
                linkPath = '#reviews-section';
              }
              
              return (
                <motion.div
                  key={idx}
                  className="service-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
                  viewport={{ once: true }}
                >
                  <div className="service-icon">
                    <Icon />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  {card.title === 'Testimonials' ? (
                    <a href="#reviews-section" className="btn btn-primary" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('reviews-section')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}>
                      {card.buttonText}
                    </a>
                  ) : (
                    <Link to={linkPath} className="btn btn-primary">
                      {card.buttonText}
                    </Link>
                  )}
                  <div className="service-bg-shape"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
