import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiDatabase, FiMail } from 'react-icons/fi';
import '../../styles/pages/legal.scss';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <motion.div
          className="legal-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FiShield className="legal-icon" />
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </motion.div>

        <motion.div
          className="legal-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to The Truth Driving School ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p>
              By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2><FiDatabase /> 2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li><strong>Name and Contact Information:</strong> Your full name, email address, phone number, and mailing address</li>
              <li><strong>Account Information:</strong> Username, password, and account preferences</li>
              <li><strong>Payment Information:</strong> Credit card details, billing address, and transaction history (processed securely through third-party payment processors)</li>
              <li><strong>Booking Information:</strong> Lesson dates, times, instructor preferences, and special requests</li>
              <li><strong>Driver's License Information:</strong> License number and expiration date (when required for course registration)</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect certain information:</p>
            <ul>
              <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, and navigation paths</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your experience and analyze website traffic</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>We may receive information about you from third-party services, such as:</p>
            <ul>
              <li>Payment processors (Stripe, PayPal, etc.)</li>
              <li>Social media platforms (if you connect your account)</li>
              <li>Analytics providers (Google Analytics)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2><FiEye /> 3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li><strong>Service Delivery:</strong> To process bookings, manage lessons, and provide driving instruction services</li>
              <li><strong>Communication:</strong> To send booking confirmations, reminders, updates, and respond to your inquiries</li>
              <li><strong>Account Management:</strong> To create and manage your account, process payments, and maintain your profile</li>
              <li><strong>Improvement:</strong> To analyze usage patterns, improve our services, and develop new features</li>
              <li><strong>Marketing:</strong> To send promotional materials, special offers, and newsletters (with your consent)</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations, resolve disputes, and enforce our terms</li>
              <li><strong>Safety:</strong> To ensure the safety of our instructors, students, and the general public</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2><FiLock /> 4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            
            <h3>4.1 Service Providers</h3>
            <p>We may share information with third-party service providers who perform services on our behalf, such as:</p>
            <ul>
              <li>Payment processing</li>
              <li>Email delivery services</li>
              <li>Cloud hosting and data storage</li>
              <li>Analytics and marketing services</li>
            </ul>

            <h3>4.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to:</p>
            <ul>
              <li>Court orders or legal processes</li>
              <li>Government requests or regulatory requirements</li>
              <li>Protection of rights, property, or safety</li>
            </ul>

            <h3>4.3 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>

            <h3>4.4 With Your Consent</h3>
            <p>We may share your information with third parties when you explicitly consent to such sharing.</p>
          </section>

          <section className="legal-section">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure password storage using industry-standard hashing algorithms</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure payment processing through PCI-compliant providers</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
              <li><strong>Portability:</strong> Request transfer of your information to another service provider</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
            <p>Types of cookies we use:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate safeguards to ensure your information receives adequate protection.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="legal-section">
            <h2><FiMail /> 12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> thetruthdrivingschool@gmail.com</p>
              <p><strong>Phone:</strong> (604) 123-4567</p>
              <p><strong>Address:</strong> Vancouver, BC, Canada</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

