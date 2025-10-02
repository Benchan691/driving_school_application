import React, { useState } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheck, FiUser, FiMessageSquare } from 'react-icons/fi';
import { getContactInfo, getBusinessHours, getContactFormConfig } from '../../utils/schoolConfig';
import toast from 'react-hot-toast';

const Contact = () => {
  const contactInfo = getContactInfo();
  const businessHours = getBusinessHours();
  const contactFormConfig = getContactFormConfig();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to submit');
      }
      setIsSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Contact Us</h1>
          <p>Get in touch with our team for any questions or inquiries</p>
        </motion.div>

        <div className="contact-content grid grid-2">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="contact-info-header">
              <h3>Get In Touch</h3>
              <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>
            
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">
                  <FiMapPin />
                </div>
                <div className="contact-content">
                  <h4>Visit Our Office</h4>
                  <p>{contactInfo.address.full}</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <FiPhone />
                </div>
                <div className="contact-content">
                  <h4>Call Us</h4>
                  <p><a href={contactInfo.phoneLink}>{contactInfo.phone}</a></p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <FiMail />
                </div>
                <div className="contact-content">
                  <h4>Email Us</h4>
                  <p><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <FiClock />
                </div>
                <div className="contact-content">
                  <h4>Business Hours</h4>
                  <p dangerouslySetInnerHTML={{ __html: businessHours.formatted }}></p>
                </div>
              </div>
            </div>

            <div className="contact-cta">
              <h4>Need Immediate Help?</h4>
              <p>For urgent inquiries, please call us directly during business hours.</p>
              <a href={contactInfo.phoneLink} className="btn btn-outline">
                <FiPhone />
                Call Now
              </a>
            </div>
          </motion.div>

          <motion.div
            className="contact-form-container"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="form-header">
              <h3>Send us a Message</h3>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            {isSubmitted ? (
              <motion.div
                className="success-message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="success-icon">
                  <FiCheck />
                </div>
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="btn btn-outline"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <FiUser />
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">
                      <FiMail />
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">
                      <FiPhone />
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">
                      <FiMessageSquare />
                      Subject *
                    </label>
                    <select 
                      id="subject" 
                      name="subject" 
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      {contactFormConfig.subjects.map((subject, index) => (
                        <option key={index} value={subject.value}>{subject.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">
                    <FiMessageSquare />
                    Message *
                  </label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="6" 
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                  <div className="char-count">
                    {formData.message.length}/{contactFormConfig.maxMessageLength} characters
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className={`btn btn-primary btn-block ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Message
                    </>
                  )}
                </button>

                <div className="form-footer">
                  <p>
                    <small>
                      * Required fields. By submitting this form, you agree to our privacy policy.
                    </small>
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
