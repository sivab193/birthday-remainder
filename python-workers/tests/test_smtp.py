#!/usr/bin/env python3
"""
SMTP connection tester for Event Reminder.
Use this to verify mail server connectivity before deployment.

Usage:
    python tests/test_smtp.py --email user@example.com --send-test-message
    
Environment variables required:
    SMTP_HOST (default: smtp.gmail.com)
    SMTP_PORT (default: 587)
    SMTP_USER
    SMTP_PASSWORD
    SMTP_FROM (optional)
"""

import os
import sys
import smtplib
import argparse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def test_smtp_connection(
    host: str = None,
    port: int = None,
    user: str = None,
    password: str = None,
    from_email: str = None,
    email: str = None,
    send_test_message: bool = False,
):
    """
    Test SMTP connection and optionally send a test email.
    
    Args:
        host: SMTP server host (default: env SMTP_HOST or smtp.gmail.com)
        port: SMTP port (default: env SMTP_PORT or 587)
        user: SMTP username (default: env SMTP_USER)
        password: SMTP password (default: env SMTP_PASSWORD)
        from_email: Sender email (default: env SMTP_FROM or SMTP_USER)
        email: Email address to send test message to
        send_test_message: Whether to send a test message
    
    Returns:
        dict with status, messages, and any errors
    """
    
    # Load from environment if not provided
    host = host or os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = port or int(os.getenv("SMTP_PORT", "587"))
    user = user or os.getenv("SMTP_USER")
    password = password or os.getenv("SMTP_PASSWORD")
    from_email = from_email or os.getenv("SMTP_FROM", user)
    
    results = {
        "status": "pending",
        "messages": [],
        "errors": [],
        "config": {
            "host": host,
            "port": port,
            "user": user or "NOT SET",
            "from": from_email or "NOT SET",
        }
    }
    
    # Validation
    if not user or not password:
        results["status"] = "failed"
        results["errors"].append("❌ SMTP_USER or SMTP_PASSWORD not configured")
        return results
    
    results["messages"].append(f"📧 Testing SMTP connection to {host}:{port}...")
    
    try:
        # Test connection
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=10)
            results["messages"].append("✓ Connected with SSL")
        else:
            server = smtplib.SMTP(host, port, timeout=10)
            server.starttls()
            results["messages"].append("✓ Connected and upgraded to TLS")
        
        # Test authentication
        server.login(user, password)
        results["messages"].append("✓ Authentication successful")
        
        # Send test email if requested
        if email and send_test_message:
            results["messages"].append(f"📮 Sending test email to {email}...")
            
            msg = MIMEMultipart()
            msg["From"] = from_email
            msg["To"] = email
            msg["Subject"] = "Event Reminder SMTP Test"
            
            body = """
            <html>
              <body>
                <h2>SMTP Configuration Test</h2>
                <p>This is a test email from Event Reminder SMTP configuration.</p>
                <p>If you received this, your mail server is working correctly!</p>
                <hr>
                <p><small>Sent from Event Reminder Workers</small></p>
              </body>
            </html>
            """
            msg.attach(MIMEText(body, "html"))
            
            server.send_message(msg)
            results["messages"].append(f"✓ Test email sent to {email}")
        
        elif email:
            results["messages"].append(f"ℹ️  Email address provided but not sending message (use --send-test-message to send)")
        
        server.quit()
        results["status"] = "success"
        results["messages"].append("✅ SMTP configuration is valid!")
        
    except smtplib.SMTPAuthenticationError as e:
        results["status"] = "failed"
        results["errors"].append(f"❌ Authentication failed: {str(e)}")
        results["messages"].append("⚠️  Username/password may be incorrect or App Password needs to be used for Gmail")
        
    except smtplib.SMTPException as e:
        results["status"] = "failed"
        results["errors"].append(f"❌ SMTP error: {str(e)}")
        
    except TimeoutError:
        results["status"] = "failed"
        results["errors"].append(f"❌ Connection timeout. Check host ({host}) and port ({port})")
        
    except Exception as e:
        results["status"] = "failed"
        results["errors"].append(f"❌ Error: {str(e)}")
    
    return results


def print_results(results: dict):
    """Pretty print test results."""
    print("\n" + "="*60)
    print(f"SMTP Test Results: {results['status'].upper()}")
    print("="*60)
    
    print("\n📋 Configuration:")
    for key, value in results["config"].items():
        print(f"  {key:12} = {value}")
    
    if results["messages"]:
        print("\n✓ Messages:")
        for msg in results["messages"]:
            print(f"  {msg}")
    
    if results["errors"]:
        print("\n✗ Errors:")
        for err in results["errors"]:
            print(f"  {err}")
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Test SMTP connection for Event Reminder"
    )
    parser.add_argument(
        "--host",
        help="SMTP host (default: env SMTP_HOST or smtp.gmail.com)"
    )
    parser.add_argument(
        "--port",
        type=int,
        help="SMTP port (default: env SMTP_PORT or 587)"
    )
    parser.add_argument(
        "--user",
        help="SMTP username (default: env SMTP_USER)"
    )
    parser.add_argument(
        "--password",
        help="SMTP password (default: env SMTP_PASSWORD)"
    )
    parser.add_argument(
        "--from",
        dest="from_email",
        help="From email address (default: env SMTP_FROM or SMTP_USER)"
    )
    parser.add_argument(
        "--email",
        help="Email address to send test message to"
    )
    parser.add_argument(
        "--send-test-message",
        action="store_true",
        help="Send a test message to the email address"
    )
    
    args = parser.parse_args()
    
    results = test_smtp_connection(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        from_email=args.from_email,
        email=args.email,
        send_test_message=args.send_test_message,
    )
    
    print_results(results)
    
    # Exit with appropriate code
    sys.exit(0 if results["status"] == "success" else 1)
