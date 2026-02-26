import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from icalendar import Calendar, Event
from datetime import datetime, timedelta
import os
import sqlite3

def get_employee_email_map():
    """
    Dynamically load employee name -> email from the DB.
    Returns dict like {"ezhil": "ezhil@example.com", ...}
    Also includes partials/first-name matches.
    """
    try:
        conn = sqlite3.connect("tracker.db", check_same_thread=False)
        cur = conn.cursor()
        rows = cur.execute("SELECT name, email FROM employees").fetchall()
        conn.close()
        mapping = {}
        for name, email in rows:
            if name and email:
                # Full name lowercase
                mapping[name.lower().strip()] = email.strip()
                # First word (first name)
                first = name.strip().split()[0].lower()
                mapping[first] = email.strip()
        return mapping
    except Exception as e:
        print(f"Warning: Could not load employees from DB: {e}")
        return {}


def create_calendar_invite(subject, start_time, duration_minutes=60, location="Online", description=""):
    cal = Calendar()
    cal.add('prodid', '-//My Meeting Scheduler//mxm.dk//')
    cal.add('version', '2.0')

    event = Event()
    event.add('summary', subject)
    event.add('dtstart', start_time)
    event.add('dtend', start_time + timedelta(minutes=duration_minutes))
    event.add('dtstamp', datetime.now())
    event.add('location', location)
    if description:
        event.add('description', description)
    
    cal.add_component(event)
    return cal.to_ical()


def send_meeting_invite(attendee_names, subject, start_time_str, sender_email, sender_password, meeting_link=None):
    """
    Sends a meeting invite to the specified attendees.
    attendee_names: List of strings (names like 'ezhil', 'rithan')
    subject: Meeting subject
    start_time_str: Start time in format 'YYYY-MM-DD HH:MM'
    sender_email: SMTP email address
    sender_password: SMTP app password
    meeting_link: Optional URL for the meeting
    """
    
    # Parse start time
    try:
        start_time = datetime.strptime(start_time_str, "%Y-%m-%d %H:%M")
    except ValueError:
        print(f"Error parsing date: {start_time_str}. Defaulting to tomorrow 10am.")
        start_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)

    # Load employees dynamically from DB
    employee_map = get_employee_email_map()

    attendee_emails = []
    not_found = []
    for name in attendee_names:
        clean_name = name.lower().strip()
        if clean_name in employee_map:
            attendee_emails.append(employee_map[clean_name])
        elif "@" in clean_name:
            attendee_emails.append(clean_name)
        else:
            not_found.append(name)
            print(f"Warning: Unknown attendee '{name}'. Skipping.")

    if not attendee_emails:
        return f"No valid emails found for: {', '.join(attendee_names)}. Make sure employees are added by admin."

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = ", ".join(attendee_emails)
    msg['Subject'] = f"Invitation: {subject}"

    link_text = f"\nMeeting Link: {meeting_link}" if meeting_link else ""
    location_text = meeting_link if meeting_link else "Online"

    body = f"""You are invited to a meeting.

Subject: {subject}
Time: {start_time.strftime('%B %d, %Y at %I:%M %p')}{link_text}
Location: {location_text}

Please add this to your calendar using the attached .ics file.

Regards,
Project Management System"""
    msg.attach(MIMEText(body, 'plain'))

    # Attach Calendar Invite
    ical_content = create_calendar_invite(subject, start_time, location=location_text, description=f"Link: {meeting_link}" if meeting_link else "")
    part = MIMEBase('text', 'calendar', method='REQUEST', name='invite.ics')
    part.set_payload(ical_content)
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', 'attachment; filename="invite.ics"')
    msg.attach(part)

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, attendee_emails, text)
        server.quit()
        result = f"Meeting invite sent to {', '.join(attendee_emails)}"
        if not_found:
            result += f". (Could not find: {', '.join(not_found)})"
        return result
    except Exception as e:
        return f"Failed to send email: {str(e)}"

