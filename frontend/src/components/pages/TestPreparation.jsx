import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiFileText, 
  FiDownload,
  FiArrowRight,
  FiCheck,
  FiX
} from 'react-icons/fi';
import '../../styles/pages/test-preparation.scss';

const TestPreparation = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Practice Questions
  const practiceQuestions = [
    {
      id: 1,
      question: "What should you do when approaching a yellow traffic light?",
      options: [
        "Speed up to beat the red light",
        "Stop if safe to do so",
        "Continue at the same speed",
        "Slow down but don't stop"
      ],
      correct: 1,
      explanation: "You should stop at a yellow light if it's safe to do so. Only proceed if you're too close to stop safely."
    },
    {
      id: 2,
      question: "What is the speed limit in a school zone during school hours?",
      options: [
        "30 km/h",
        "40 km/h",
        "50 km/h",
        "60 km/h"
      ],
      correct: 0,
      explanation: "School zones typically have a speed limit of 30 km/h during school hours to ensure children's safety."
    },
    {
      id: 3,
      question: "When parallel parking, how far should you be from the curb?",
      options: [
        "Less than 15 cm",
        "15-30 cm",
        "30-50 cm",
        "More than 50 cm"
      ],
      correct: 1,
      explanation: "When parallel parking, your vehicle should be 15-30 cm from the curb. This is the standard requirement."
    },
    {
      id: 4,
      question: "What should you do when you see a pedestrian at a crosswalk?",
      options: [
        "Slow down and proceed if they're not moving",
        "Stop and wait for them to cross",
        "Honk to alert them",
        "Speed up to pass quickly"
      ],
      correct: 1,
      explanation: "You must stop and yield to pedestrians at crosswalks. This is a legal requirement and ensures safety."
    },
    {
      id: 5,
      question: "How far ahead should you signal before turning?",
      options: [
        "At least 10 meters",
        "At least 30 meters",
        "At least 50 meters",
        "Just before turning"
      ],
      correct: 1,
      explanation: "You should signal at least 30 meters before turning to give other drivers adequate warning."
    }
  ];

  const handleQuizAnswer = (questionId, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answerIndex
    });
  };

  const calculateQuizScore = () => {
    let correct = 0;
    practiceQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    return { correct, total: practiceQuestions.length };
  };

  const testPrepServices = [
    {
      icon: FiBookOpen,
      title: "Comprehensive Theory Training",
      description: "Learn all road signs, rules, and regulations with our structured theory classes."
    },
    {
      icon: FiClock,
      title: "Mock Driving Tests",
      description: "Practice with simulated driving tests that mirror the actual exam format."
    },
    {
      icon: FiCheckCircle,
      title: "Personalized Feedback",
      description: "Receive detailed feedback on your performance and areas for improvement."
    },
    {
      icon: FiFileText,
      title: "Study Materials",
      description: "Access comprehensive study guides, checklists, and practice questions."
    }
  ];

  const whatToExpect = [
    {
      title: "Test Duration",
      content: "The practical driving test typically lasts 30-45 minutes, including vehicle inspection and on-road driving."
    },
    {
      title: "Test Format",
      content: "You'll be tested on basic maneuvers, parking, lane changes, turns, and following traffic rules."
    },
    {
      title: "Requirements",
      content: "Bring valid ID, learner's permit, and ensure your vehicle is in good working condition."
    },
    {
      title: "Scoring",
      content: "You'll be evaluated on observation, vehicle control, decision-making, and following road rules."
    }
  ];

  const tips = [
    "Practice regularly in different weather conditions and times of day",
    "Familiarize yourself with the test route area if possible",
    "Get a good night's sleep before your test",
    "Arrive early to avoid rushing and reduce anxiety",
    "Listen carefully to the examiner's instructions",
    "Check mirrors frequently and make it obvious",
    "Stay calm and don't panic if you make a minor mistake",
    "Practice parallel parking until it becomes second nature",
    "Know your vehicle's controls and features well",
    "Take deep breaths and stay focused throughout the test"
  ];

  const preTestChecklist = [
    "Valid driver's license or learner's permit",
    "Vehicle registration and insurance documents",
    "Vehicle in good working condition (lights, brakes, tires)",
    "Clean vehicle (inside and out)",
    "Practice driving in the test area",
    "Review road signs and traffic rules",
    "Get adequate rest the night before",
    "Eat a good meal before the test",
    "Arrive 15 minutes early",
    "Bring any required forms or documentation"
  ];

  const testDayChecklist = [
    "Double-check all required documents",
    "Inspect vehicle before leaving home",
    "Ensure fuel tank is at least half full",
    "Remove any distractions from the vehicle",
    "Wear comfortable clothing and appropriate footwear",
    "Bring water and stay hydrated",
    "Have a backup plan for transportation if needed",
    "Stay positive and confident",
    "Review key driving points mentally",
    "Remember: examiners want you to pass!"
  ];

  const roadSigns = [
    { name: "Stop Sign", description: "Come to a complete stop. Yield to all traffic." },
    { name: "Yield Sign", description: "Slow down and give way to traffic on the main road." },
    { name: "Speed Limit", description: "Maximum speed allowed. Adjust for conditions." },
    { name: "No Entry", description: "Do not enter this road or area." },
    { name: "One Way", description: "Traffic flows in one direction only." },
    { name: "School Zone", description: "Reduce speed. Watch for children crossing." }
  ];

  return (
    <div className="test-preparation-page">
      {/* Hero Section */}
      <section className="test-prep-hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Test Preparation</h1>
            <p className="hero-subtitle">
              Comprehensive resources and guidance to help you pass your driving test with confidence
            </p>
            <div className="hero-buttons">
              <Link to="/book" className="btn btn-primary btn-lg" onClick={scrollToTop}>
                Book a Test Prep Lesson
              </Link>
              <Link to="/packages" className="btn btn-outline btn-lg" onClick={scrollToTop}>
                View Packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Our Test Preparation Services</h2>
            <p>Everything you need to succeed on your driving test</p>
          </motion.div>

          <div className="services-grid">
            {testPrepServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  className="service-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="service-icon">
                    <Icon />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="expect-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>What to Expect</h2>
            <p>Understanding the test format and requirements</p>
          </motion.div>

          <div className="expect-grid">
            {whatToExpect.map((item, index) => (
              <motion.div
                key={index}
                className="expect-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="tips-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Top Tips for Passing Your Test</h2>
            <p>Expert advice to help you succeed</p>
          </motion.div>

          <div className="tips-grid">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                className="tip-item"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <FiCheckCircle className="tip-icon" />
                <span>{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Questions */}
      <section className="practice-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Practice Questions</h2>
            <p>Test your knowledge with these common driving test questions</p>
          </motion.div>

          <div className="quiz-container">
            {practiceQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                className="question-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  {quizAnswers[question.id] !== undefined && (
                    <span className={`answer-status ${quizAnswers[question.id] === question.correct ? 'correct' : 'incorrect'}`}>
                      {quizAnswers[question.id] === question.correct ? (
                        <><FiCheck /> Correct</>
                      ) : (
                        <><FiX /> Incorrect</>
                      )}
                    </span>
                  )}
                </div>
                <h3>{question.question}</h3>
                <div className="options-list">
                  {question.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      className={`option-btn ${quizAnswers[question.id] === optIndex ? 'selected' : ''} ${quizAnswers[question.id] !== undefined && optIndex === question.correct ? 'correct-answer' : ''}`}
                      onClick={() => handleQuizAnswer(question.id, optIndex)}
                      disabled={quizAnswers[question.id] !== undefined}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </button>
                  ))}
                </div>
                {quizAnswers[question.id] !== undefined && (
                  <div className={`explanation ${quizAnswers[question.id] === question.correct ? 'correct' : 'incorrect'}`}>
                    <p><strong>Explanation:</strong> {question.explanation}</p>
                  </div>
                )}
              </motion.div>
            ))}

            {Object.keys(quizAnswers).length === practiceQuestions.length && (
              <motion.div
                className="quiz-results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3>Quiz Results</h3>
                <div className="score-display">
                  <span className="score-number">{calculateQuizScore().correct}</span>
                  <span className="score-separator">/</span>
                  <span className="score-total">{calculateQuizScore().total}</span>
                </div>
                <p className="score-message">
                  {calculateQuizScore().correct === calculateQuizScore().total
                    ? "Perfect! You're ready for your test!"
                    : calculateQuizScore().correct >= calculateQuizScore().total * 0.7
                    ? "Good job! Keep practicing to improve."
                    : "Keep studying! Review the explanations and try again."}
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setQuizAnswers({});
                    setShowQuizResults(false);
                  }}
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Study Guides */}
      <section className="guides-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Study Guides</h2>
            <p>Essential information for your driving test</p>
          </motion.div>

          <div className="guides-content">
            <div className="road-signs-guide">
              <h3>Common Road Signs</h3>
              <div className="signs-grid">
                {roadSigns.map((sign, index) => (
                  <motion.div
                    key={index}
                    className="sign-card"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h4>{sign.name}</h4>
                    <p>{sign.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="parking-guide">
              <h3>Parking Techniques</h3>
              <div className="parking-tips">
                <div className="parking-tip">
                  <h4>Parallel Parking</h4>
                  <ol>
                    <li>Signal and position your vehicle parallel to the car in front</li>
                    <li>Reverse slowly while turning the wheel</li>
                    <li>Straighten the wheel when your vehicle is at a 45-degree angle</li>
                    <li>Continue reversing and turn the wheel the opposite direction</li>
                    <li>Adjust position to be 15-30 cm from the curb</li>
                  </ol>
                </div>
                <div className="parking-tip">
                  <h4>Perpendicular Parking</h4>
                  <ol>
                    <li>Approach the space at a 90-degree angle</li>
                    <li>Signal your intention</li>
                    <li>Slow down and check for obstacles</li>
                    <li>Turn into the space when your front bumper clears the adjacent vehicle</li>
                    <li>Center your vehicle in the space</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checklists */}
      <section className="checklists-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Preparation Checklists</h2>
            <p>Use these checklists to ensure you're fully prepared</p>
          </motion.div>

          <div className="checklists-grid">
            <motion.div
              className="checklist-card"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>Pre-Test Checklist</h3>
              <ul className="checklist">
                {preTestChecklist.map((item, index) => (
                  <li key={index}>
                    <FiCheckCircle />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="checklist-card"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>Test Day Checklist</h3>
              <ul className="checklist">
                {testDayChecklist.map((item, index) => (
                  <li key={index}>
                    <FiCheckCircle />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Pass Your Driving Test?</h2>
            <p>Book a test preparation lesson with our experienced instructors</p>
            <div className="cta-buttons">
              <Link to="/book" className="btn btn-primary btn-lg" onClick={scrollToTop}>
                Book a Lesson
                <FiArrowRight />
              </Link>
              <Link to="/packages" className="btn btn-outline btn-lg" onClick={scrollToTop}>
                View Packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TestPreparation;

