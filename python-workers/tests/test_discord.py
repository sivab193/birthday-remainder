#!/usr/bin/env python3
"""
Discord webhook tester for Event Reminder.
Use this to verify Discord webhook configuration before deployment.

Usage:
    python tests/test_discord.py --webhook-url "https://discord.com/api/webhooks/..." --send-test-message
    
Environment variables:
    DISCORD_WEBHOOK_URL (optional, can be passed via --webhook-url)
"""

import os
import sys
import argparse
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def test_discord_webhook(
    webhook_url: str = None,
    send_test_message: bool = False,
):
    """
    Test Discord webhook connection and optionally send a test message.
    
    Args:
        webhook_url: Discord webhook URL (default: env DISCORD_WEBHOOK_URL)
        send_test_message: Whether to send a test message
    
    Returns:
        dict with status, messages, and any errors
    """
    
    # Load from environment if not provided
    webhook_url = webhook_url or os.getenv("DISCORD_WEBHOOK_URL")
    
    results = {
        "status": "pending",
        "messages": [],
        "errors": [],
        "config": {
            "webhook_url": (webhook_url[:50] + "..." if webhook_url else "NOT SET"),
        }
    }
    
    # Validation
    if not webhook_url:
        results["status"] = "failed"
        results["errors"].append("❌ DISCORD_WEBHOOK_URL not provided or configured")
        return results
    
    if not webhook_url.startswith("https://discord.com/api/webhooks/"):
        results["status"] = "failed"
        results["errors"].append("❌ Invalid webhook URL format. Must start with: https://discord.com/api/webhooks/")
        return results
    
    # Test webhook
    results["messages"].append("🔗 Testing Discord webhook...")
    
    try:
        # Send test message if requested
        if send_test_message:
            payload = {
                "content": "✅ Event Reminder Discord webhook test",
                "embeds": [
                    {
                        "title": "Configuration Test",
                        "description": "If you see this message, your Discord webhook is configured correctly!",
                        "color": 0x667eea,
                        "footer": {"text": "Event Reminder Health Check"},
                    }
                ],
            }
            
            response = requests.post(
                webhook_url,
                json=payload,
                timeout=10,
                headers={"Content-Type": "application/json"},
            )
            
            if response.status_code == 204:
                results["messages"].append("✓ Webhook URL is valid and message sent successfully")
                results["status"] = "success"
                results["messages"].append("✅ Discord webhook configuration is valid!")
                
            elif response.status_code == 404:
                results["status"] = "failed"
                results["errors"].append("❌ Webhook URL not found (404). The webhook may have been deleted or the URL is incorrect.")
                
            elif response.status_code == 401:
                results["status"] = "failed"
                results["errors"].append("❌ Unauthorized (401). The webhook token may have expired.")
                
            elif response.status_code == 429:
                results["status"] = "failed"
                results["errors"].append("❌ Rate limited (429). Too many requests sent to this webhook. Try again later.")
                
            else:
                error_text = response.text
                results["status"] = "failed"
                results["errors"].append(f"❌ HTTP {response.status_code}: {error_text}")
        else:
            # Just validate the URL format without sending
            results["messages"].append("✓ Webhook URL format is valid (not sending test message)")
            results["status"] = "success"
            results["messages"].append("✅ Discord webhook URL format is valid!")
        
    except requests.Timeout:
        results["status"] = "failed"
        results["errors"].append("❌ Connection timeout - check your internet connection")
        
    except requests.RequestException as e:
        results["status"] = "failed"
        results["errors"].append(f"❌ Network error: {str(e)}")
        
    except Exception as e:
        results["status"] = "failed"
        results["errors"].append(f"❌ Error: {str(e)}")
    
    return results


def print_results(results: dict):
    """Pretty print test results."""
    print("\n" + "="*60)
    print(f"Discord Webhook Test Results: {results['status'].upper()}")
    print("="*60)
    
    print("\n🔧 Configuration:")
    for key, value in results["config"].items():
        print(f"  {key:20} = {value}")
    
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
        description="Test Discord webhook configuration for Event Reminder"
    )
    parser.add_argument(
        "--webhook-url",
        help="Discord webhook URL (default: env DISCORD_WEBHOOK_URL)"
    )
    parser.add_argument(
        "--send-test-message",
        action="store_true",
        help="Send a test message to the webhook"
    )
    
    args = parser.parse_args()
    
    results = test_discord_webhook(
        webhook_url=args.webhook_url,
        send_test_message=args.send_test_message,
    )
    
    print_results(results)
    
    # Exit with appropriate code
    sys.exit(0 if results["status"] == "success" else 1)
