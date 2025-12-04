import schoolConfig from '../content/school.json';

/**
 * Get the complete school configuration
 * @returns {Object} The complete school configuration object
 */
export const getSchoolConfig = () => {
  return schoolConfig;
};

/**
 * Get school basic information
 * @returns {Object} School name, tagline, and description
 */
export const getSchoolInfo = () => {
  return schoolConfig.school;
};

/**
 * Get contact information
 * @returns {Object} Contact details including email, phone, and address
 */
export const getContactInfo = () => {
  return schoolConfig.contact;
};

/**
 * Get business hours information
 * @returns {Object} Business hours and related information
 */
export const getBusinessHours = () => {
  return schoolConfig.businessHours;
};

/**
 * Get social media links
 * @returns {Object} Social media URLs and icons
 */
export const getSocialMedia = () => {
  return schoolConfig.socialMedia;
};

/**
 * Get school statistics
 * @returns {Object} School stats like pass rate, students taught, etc.
 */
export const getSchoolStats = () => {
  return schoolConfig.stats;
};

/**
 * Get team information
 * @returns {Array} Array of team members with their details
 */
export const getTeamInfo = () => {
  return schoolConfig.team;
};

/**
 * Get school values
 * @returns {Array} Array of school values and descriptions
 */
export const getSchoolValues = () => {
  return schoolConfig.values;
};

/**
 * Get services offered
 * @returns {Array} Array of services with descriptions
 */
export const getServices = () => {
  return schoolConfig.services;
};

/**
 * Get contact form configuration
 * @returns {Object} Contact form settings and options
 */
export const getContactFormConfig = () => {
  return schoolConfig.contactForm;
};

/**
 * Get copyright information
 * @returns {Object} Copyright year and text
 */
export const getCopyrightInfo = () => {
  return schoolConfig.copyright;
};

/**
 * Get formatted business hours for display
 * @returns {string} HTML formatted business hours
 */
export const getFormattedBusinessHours = () => {
  return schoolConfig.businessHours.formatted;
};

/**
 * Get full copyright text
 * @returns {string} Complete copyright notice
 */
export const getFullCopyrightText = () => {
  const { year, text } = schoolConfig.copyright;
  return `&copy; ${year} ${text}`;
};

/**
 * Generate time slots based on business hours and date
 * @param {Date} date - The date to generate slots for
 * @returns {Array} Array of time slot strings
 */
export const generateTimeSlots = (date) => {
  const businessHours = schoolConfig.businessHours;
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Sunday = 0, Monday-Saturday = 1-6
  if (dayOfWeek === 0) {
    // Weekend (Sunday)
    return businessHours.defaultWeekendSlots;
  } else {
    // Weekdays (Monday-Saturday)
    return businessHours.defaultWeekdaySlots;
  }
};

/**
 * Generate time slots dynamically based on start/end times and interval
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} intervalMinutes - Interval in minutes (default: 30)
 * @returns {Array} Array of time slot strings
 */
export const generateDynamicTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    slots.push(timeString);
  }
  
  return slots;
};

/**
 * Get time slots for a specific date
 * @param {Date} date - The date to get slots for
 * @returns {Array} Array of available time slots
 */
export const getTimeSlotsForDate = (date) => {
  const businessHours = schoolConfig.businessHours;
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0) {
    // Sunday - use weekend hours
    return generateDynamicTimeSlots(
      businessHours.weekend.start,
      businessHours.weekend.end,
      businessHours.timeSlotInterval
    );
  } else {
    // Monday-Saturday - use weekday hours
    return generateDynamicTimeSlots(
      businessHours.weekdays.start,
      businessHours.weekdays.end,
      businessHours.timeSlotInterval
    );
  }
};

// Default export for easy importing
export default schoolConfig;
