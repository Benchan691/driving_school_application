import React from 'react';
import '../../styles/components/google-calendar-embed.scss';

const GoogleCalendarEmbed = () => {
  const configuredUrl = process.env.REACT_APP_GOOGLE_CALENDAR_EMBED_URL || '';
  let calendarUrl = null;

  try {
    const parsedUrl = new URL(configuredUrl);
    if (
      parsedUrl.protocol === 'https:' &&
      parsedUrl.hostname === 'calendar.google.com' &&
      parsedUrl.pathname === '/calendar/embed' &&
      parsedUrl.searchParams.has('src')
    ) {
      calendarUrl = parsedUrl.toString();
    }
  } catch (_) {
    // Show the configuration message below when the build-time URL is missing or invalid.
  }

  return (
    <section className="google-calendar-embed" aria-labelledby="google-calendar-title">
      <header className="google-calendar-embed__header">
        <div>
          <h2 id="google-calendar-title">School Calendar</h2>
          <p>
            View the school calendar. Website bookings are managed separately and do not sync to Google Calendar.
          </p>
          <p className="google-calendar-embed__access-note">
            Sign in with a Google account that has been given access to this calendar.
          </p>
        </div>
        {calendarUrl && (
          <a href={calendarUrl} target="_blank" rel="noreferrer">
            Open in Google Calendar
          </a>
        )}
      </header>

      {calendarUrl ? (
        <div className="google-calendar-embed__frame-wrap">
          <iframe
            title="Driving school Google Calendar"
            src={calendarUrl}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="google-calendar-embed__message" role="alert">
          Google Calendar is not configured for this build.
        </p>
      )}
    </section>
  );
};

export default GoogleCalendarEmbed;
