import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram } from 'react-icons/fi';
import { 
  getSchoolInfo, 
  getContactInfo, 
  getSocialMedia, 
  getServices, 
  getFullCopyrightText 
} from '../../utils/schoolConfig';
import './Footer.scss';

const Footer = () => {
  const schoolInfo = getSchoolInfo();
  const contactInfo = getContactInfo();
  const socialMedia = getSocialMedia();
  const services = getServices();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{schoolInfo.name}</h3>
            <p>{schoolInfo.tagline}</p>
            <div className="social-links">
              <a href={socialMedia.facebook.url} target="_blank" rel="noopener noreferrer" className="social-link"><FiFacebook /></a>
              <a href={socialMedia.instagram.url} target="_blank" rel="noopener noreferrer" className="social-link"><FiInstagram /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about" onClick={scrollToTop}>About Us</Link></li>
              <li><Link to="/packages" onClick={scrollToTop}>Packages</Link></li>
              <li><Link to="/contact" onClick={scrollToTop}>Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              {services.map((service, index) => (
                <li key={index}>
                  <a href={`#${service.id}`}>{service.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FiMapPin />
                <span>{contactInfo.address.full}</span>
              </div>
              <div className="contact-item">
                <FiPhone />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="contact-item">
                <FiMail />
                <span>{contactInfo.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p dangerouslySetInnerHTML={{ __html: getFullCopyrightText() }}></p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
