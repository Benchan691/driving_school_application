import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiAward, FiClock, FiMapPin, FiMail, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { getSchoolInfo, getSchoolStats, getTeamInfo, getSchoolValues, getContactInfo } from '../../utils/schoolConfig';

const AboutUs = () => {
  const schoolInfo = getSchoolInfo();
  const schoolStats = getSchoolStats();
  const team = getTeamInfo();
  const values = getSchoolValues();
  const contactInfo = getContactInfo();

  const stats = [
    { icon: FiUsers, value: schoolStats.studentsTaught, label: 'Students Taught' },
    { icon: FiAward, value: schoolStats.passRate, label: 'Pass Rate' },
    { icon: FiClock, value: schoolStats.yearsExperience, label: 'Years Experience' },
    { icon: FiMapPin, value: schoolStats.serviceAreas, label: 'Service Areas' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>About Our Driving School</h1>
            <p className="hero-subtitle">
              {schoolInfo.description}
            </p>
            <div className="hero-buttons">
              <Link to="/packages" className="btn btn-primary btn-lg">
                View Our Packages
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <div className="stat-icon">
                    <Icon />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <motion.div
              className="mission-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Our Mission</h2>
              <p className="mission-text">
                At our driving school, we believe that learning to drive should be a positive, 
                confidence-building experience. Our mission is to provide comprehensive, 
                patient, and professional driving instruction that prepares students not just 
                to pass their driving test, but to become safe, responsible drivers for life.
              </p>
              <p className="mission-text">
                We're committed to using modern teaching techniques, maintaining the highest 
                safety standards, and providing personalized instruction that meets each 
                student's unique needs and learning style.
              </p>
            </motion.div>
            
            <motion.div
              className="mission-image"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="image-placeholder">
                <div className="instructor-demo">
                  <div className="instructor">
                    <div className="person">👨‍🏫</div>
                    <div className="instructor-info">
                      <h4>Professional Instructor</h4>
                      <p>Experienced & Certified</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Meet Our Team</h2>
            <p>Our certified instructors bring years of experience and a passion for teaching safe driving skills.</p>
          </motion.div>

          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <div className="team-avatar">
                  {member.avatar}
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-experience">{member.experience} experience</p>
                <div className="team-specialties">
                  {member.specialties.map((specialty, idx) => (
                    <span key={idx} className="specialty-tag">
                      {specialty}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Our Values</h2>
            <p>These core values guide everything we do at our driving school.</p>
          </motion.div>

          <div className="values-grid">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  className="value-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <div className="value-icon">
                    <Icon />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="contact-cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Start Your Driving Journey?</h2>
            <p>Join hundreds of successful students who chose our driving school for their driving education.</p>
            <div className="cta-buttons">
              <Link to="/packages" className="btn btn-primary btn-lg">
                View Packages
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                Get in Touch
              </Link>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <FiPhone />
                <span>Call us: {contactInfo.phone}</span>
              </div>
              <div className="contact-item">
                <FiMail />
                <span>Email: {contactInfo.email}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
