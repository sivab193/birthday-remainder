"""
Shared utilities for all Event Reminder workers.
Extracts common logic: age/duration computation, meet-date formatting, portal URL.
"""

import os
import datetime


def get_portal_url():
    """Return the portal URL from env or default."""
    return os.getenv("PORTAL_URL", "https://er.siv19.dev/dashboard")


def compute_age_text(birthdate, event_type, unknown_year=False):
    """
    Compute age/duration text based on birthdate and event type.
    Returns a string like 'Turning 32 🎂' or None if not applicable.
    """
    if unknown_year or not birthdate:
        return None
    try:
        b_year = int(birthdate.split('-')[0])
        if b_year < 1900:
            return None
        age = datetime.datetime.now().year - b_year
        if age <= 0:
            return None
        if event_type == 'anniversary':
            return f"{age} {'year' if age == 1 else 'years'} together 💍"
        elif event_type == 'birthday':
            return f"Turning {age} 🎂"
        else:
            return f"{age} {'year' if age == 1 else 'years'} ago"
    except Exception:
        return None


def format_meet_date(meet_date):
    """
    Format a meet date string (YYYY-MM-DD) to DD/MM/YYYY.
    Returns formatted string or None if not applicable.
    """
    if not meet_date:
        return None
    try:
        y, m, d = meet_date.split('-')
        if int(y) > 1900:
            return f"{d}/{m}/{y}"
    except Exception:
        pass
    return None


def get_event_label(event_type):
    """Return a human-readable label for the event type."""
    if event_type and event_type != 'birthday':
        return event_type.capitalize()
    return 'Birthday'
