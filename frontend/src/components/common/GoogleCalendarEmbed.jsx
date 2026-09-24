import React from 'react';
import { FiCalendar, FiExternalLink } from 'react-icons/fi';
import '../../styles/components/google-calendar-embed.scss';

const GoogleCalendarEmbed = () => {
  const embedUrl = process.env.REACT_APP_GOOGLE_CALENDAR_EMBED_URL?.trim();
  let isValidEmbedUrl = false;

  try {
    const parsedUrl = new URL(embedUrl);
    isValidEmbedUrl = parsedUrl.protocol === 'https:'
      && parsedUrl.hostname === 'calendar.google.com'
      && parsedUrl.pathname === '/calendar/embed';
  } catch (_) {
    // Render the configuration message below when the build-time setting is absent or invalid.
  }

  return (
    <section className="google-calendar" aria-labelledby="google-calendar-title">
      <header className="google-calendar__header">
        <div className="google-calendar__heading">
          <span className="google-calendar__icon" aria-hidden="true"><FiCalendar /></span>
          <div>
            <h2 id="google-calendar-title">School Calendar</h2>
            <p>View the school calendar. Website bookings are managed separately.</p>
          </div>
        </div>
        {isValidEmbedUrl && (
          <a
            className="google-calendar__open-link"
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiExternalLink aria-hidden="true" /> Open calendar
          </a>
        )}
      </header>

      {isValidEmbedUrl ? (
        <div className="google-calendar__frame-wrap">
          <iframe
            className="google-calendar__frame"
            src={embedUrl}
            title="The Truth Driving School Google Calendar"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="google-calendar__unavailable" role="status">
          The Google Calendar embed is not configured. Set the production calendar URL and rebuild the website.
        </div>
      )}

      <p className="google-calendar__privacy-note">
        Sign in to a Google account that has been granted access to this private calendar. Calendar access is controlled by Google.
      </p>
    </section>
  );
};

export default GoogleCalendarEmbed;
