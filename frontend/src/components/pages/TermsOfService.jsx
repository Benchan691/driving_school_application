import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import '../../styles/pages/legal.scss';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <motion.div
          className="legal-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FiFileText className="legal-icon" />
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </motion.div>

        <motion.div
          className="legal-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using The Truth Driving School's website and services, you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Your continued use of our services after any changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Services</h2>
            <p>
              The Truth Driving School provides driving instruction services, including but not limited to:
            </p>
            <ul>
              <li>Behind-the-wheel driving lessons</li>
              <li>Theory and classroom instruction</li>
              <li>Test preparation courses</li>
              <li>Highway code education</li>
              <li>Package deals and lesson bundles</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Eligibility and Requirements</h2>
            <h3>3.1 Age Requirements</h3>
            <ul>
              <li>Students must meet the minimum age requirement for driving in their jurisdiction</li>
              <li>Students under 18 must have parental or guardian consent</li>
            </ul>

            <h3>3.2 License Requirements</h3>
            <ul>
              <li>Students must possess a valid learner's permit or driver's license as required by law</li>
              <li>Students must provide proof of valid insurance coverage (where applicable)</li>
              <li>Students must meet all medical and vision requirements for driving</li>
            </ul>

            <h3>3.3 Account Requirements</h3>
            <ul>
              <li>You must provide accurate, current, and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2><FiAlertCircle /> 4. Booking and Cancellation Policy</h2>
            
            <h3>4.1 Booking</h3>
            <ul>
              <li>All bookings are subject to instructor availability</li>
              <li>Bookings must be made at least 24 hours in advance</li>
              <li>We reserve the right to reschedule or cancel lessons due to unforeseen circumstances</li>
              <li>Time slots are allocated on a first-come, first-served basis</li>
            </ul>

            <h3>4.2 Cancellation by Student</h3>
            <ul>
              <li><strong>24+ hours notice:</strong> Full refund or rescheduling without penalty</li>
              <li><strong>Less than 24 hours notice:</strong> 50% cancellation fee applies</li>
              <li><strong>No-show:</strong> Full lesson fee charged, no refund</li>
              <li>Cancellations must be made through our website or by contacting us directly</li>
            </ul>

            <h3>4.3 Cancellation by School</h3>
            <ul>
              <li>We may cancel lessons due to weather, instructor unavailability, or safety concerns</li>
              <li>Full refund or rescheduling will be offered in such cases</li>
              <li>We will make reasonable efforts to notify you as soon as possible</li>
            </ul>

            <h3>4.4 Rescheduling</h3>
            <ul>
              <li>Rescheduling requests must be made at least 24 hours before the scheduled lesson</li>
              <li>Rescheduling is subject to instructor availability</li>
              <li>Multiple rescheduling requests may incur additional fees</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Payment Terms</h2>
            
            <h3>5.1 Payment Methods</h3>
            <ul>
              <li>We accept credit cards, debit cards, and cash payments</li>
              <li>Online payments are processed through secure third-party payment processors</li>
              <li>Payment is required at the time of booking or before the lesson begins</li>
            </ul>

            <h3>5.2 Pricing</h3>
            <ul>
              <li>All prices are in Canadian Dollars (CAD) unless otherwise stated</li>
              <li>Prices are subject to change without notice</li>
              <li>Package deals and promotions are subject to specific terms and conditions</li>
              <li>Refunds for packages are calculated on a per-lesson basis</li>
            </ul>

            <h3>5.3 Refunds</h3>
            <ul>
              <li>Refunds are processed according to our cancellation policy</li>
              <li>Refund requests must be submitted in writing</li>
              <li>Refunds may take 5-10 business days to process</li>
              <li>No refunds for completed lessons unless otherwise specified</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Student Conduct and Responsibilities</h2>
            
            <h3>6.1 During Lessons</h3>
            <ul>
              <li>Students must arrive on time for scheduled lessons</li>
              <li>Students must bring valid identification and required documents</li>
              <li>Students must follow all traffic laws and instructor directions</li>
              <li>Students must not be under the influence of alcohol or drugs</li>
              <li>Students must treat instructors and other road users with respect</li>
            </ul>

            <h3>6.2 Prohibited Behavior</h3>
            <ul>
              <li>Aggressive or dangerous driving</li>
              <li>Disrespectful behavior toward instructors</li>
              <li>Use of mobile devices during lessons (unless for navigation purposes)</li>
              <li>Smoking or consuming alcohol in the vehicle</li>
              <li>Any illegal activity</li>
            </ul>

            <h3>6.3 Consequences</h3>
            <p>
              Violation of conduct policies may result in immediate termination of the lesson, suspension of services, or permanent ban from our services. No refunds will be provided for terminated lessons due to misconduct.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Instructor Qualifications and Responsibilities</h2>
            <ul>
              <li>All instructors are licensed and certified according to provincial regulations</li>
              <li>Instructors are responsible for providing safe and effective instruction</li>
              <li>Instructors have the right to terminate a lesson if safety is compromised</li>
              <li>Instructors will provide constructive feedback and progress reports</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Liability and Insurance</h2>
            
            <h3>8.1 Insurance Coverage</h3>
            <ul>
              <li>Our vehicles are fully insured for instructional purposes</li>
              <li>Students are covered by our insurance policy during scheduled lessons</li>
              <li>Students must have valid insurance if using their own vehicle for lessons</li>
            </ul>

            <h3>8.2 Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, The Truth Driving School shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul>
              <li>Loss of profits or revenue</li>
              <li>Loss of data or information</li>
              <li>Personal injury or property damage (except as covered by insurance)</li>
              <li>Any damages resulting from student negligence or misconduct</li>
            </ul>

            <h3>8.3 Indemnification</h3>
            <p>
              You agree to indemnify and hold harmless The Truth Driving School, its instructors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our services or violation of these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Intellectual Property</h2>
            <p>
              All content on our website, including text, graphics, logos, images, and software, is the property of The Truth Driving School or its licensors and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Privacy</h2>
            <p>
              Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Prohibited Uses</h2>
            <p>You agree not to use our services:</p>
            <ul>
              <li>For any unlawful purpose or in violation of any laws</li>
              <li>To transmit any harmful code, viruses, or malicious software</li>
              <li>To impersonate any person or entity</li>
              <li>To interfere with or disrupt our services or servers</li>
              <li>To collect or harvest information about other users</li>
              <li>To spam or send unsolicited communications</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>12. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and access to our services immediately, without prior notice, for any reason, including but not limited to:
            </p>
            <ul>
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Misconduct or safety concerns</li>
            </ul>
            <p>
              Upon termination, your right to use our services will immediately cease, and we may delete your account and data.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Dispute Resolution</h2>
            <h3>13.1 Informal Resolution</h3>
            <p>
              We encourage you to contact us first to resolve any disputes informally. We will make reasonable efforts to address your concerns.
            </p>

            <h3>13.2 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of British Columbia, Canada, without regard to its conflict of law provisions.
            </p>

            <h3>13.3 Jurisdiction</h3>
            <p>
              Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts of British Columbia, Canada.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and The Truth Driving School regarding your use of our services and supersede all prior agreements and understandings.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> thetruthdrivingschool@gmail.com</p>
              <p><strong>Phone:</strong> (604) 123-4567</p>
              <p><strong>Address:</strong> Vancouver, BC, Canada</p>
            </div>
          </section>

          <section className="legal-section acknowledgment">
            <p>
              <strong>By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;

