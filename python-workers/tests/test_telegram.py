#!/usr/bin/env python3
"""
Telegram bot connection tester for Event Reminder.
Use this to verify Telegram bot configuration before deployment.

Usage:
    python tests/test_telegram.py --chat-id 870213478
    
Environment variables required:
    TELEGRAM_BOT_TOKEN
"""

import os
import sys
import argparse
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def test_telegram_connection(
    bot_token: str = None,
    chat_id: str = None,
    send_test_message: bool = False,
):
    """
    Test Telegram bot connection and optionally send a test message.
    
    Args:
        bot_token: Telegram bot token (default: env TELEGRAM_BOT_TOKEN)
        chat_id: Chat ID to test (required for message sending)
        send_test_message: Whether to send a test message
    
    Returns:
        dict with status, messages, and any errors
    """
    
    # Load from environment if not provided
    bot_token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
    
    results = {
        "status": "pending",
        "messages": [],
        "errors": [],
        "config": {
            "bot_token": bot_token[:10] + "..." if bot_token else "NOT SET",
            "chat_id": chat_id or "NOT PROVIDED",
        }
    }
    
    # Validation
    if not bot_token:
        results["status"] = "failed"
        results["errors"].append("❌ TELEGRAM_BOT_TOKEN not configured")
        return results
    
    # Get bot info
    results["messages"].append("🤖 Testing Telegram bot token...")
    
    try:
        url = f"https://api.telegram.org/bot{bot_token}/getMe"
        response = requests.get(url, timeout=10)
        bot_info = response.json()
        
        if not bot_info.get("ok"):
            results["status"] = "failed"
            results["errors"].append(f"❌ Bot token invalid: {bot_info.get('description', 'Unknown error')}")
            return results
        
        bot_data = bot_info.get("result", {})
        results["messages"].append(f"✓ Bot connected: @{bot_data.get('username', 'unknown')}")
        results["config"]["bot_username"] = bot_data.get("username", "unknown")
        results["config"]["bot_id"] = bot_data.get("id", "unknown")
        
        # Send test message if chat ID provided
        if chat_id and send_test_message:
            results["messages"].append(f"📮 Sending test message to chat {chat_id}...")
            
            msg_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            msg_response = requests.post(
                msg_url,
                json={
                    "chat_id": chat_id,
                    "text": "✅ Event Reminder Telegram bot test message\n\nIf you see this, your configuration is working!",
                    "parse_mode": "HTML",
                },
                timeout=10
            )
            msg_data = msg_response.json()
            
            if not msg_data.get("ok"):
                results["status"] = "failed"
                error_desc = msg_data.get("description", "Unknown error")
                results["errors"].append(f"❌ Failed to send message: {error_desc}")
                
                # Provide helpful advice
                if "chat not found" in error_desc.lower():
                    results["messages"].append("⚠️  Chat ID not found. Have you started a chat with the bot?")
                elif "not a member" in error_desc.lower():
                    results["messages"].append("⚠️  Bot not a member of the chat")
                elif "bad request" in error_desc.lower():
                    results["messages"].append("⚠️  Bad request - verify chat ID format (should be a number)")
                
                return results
            
            results["messages"].append(f"✓ Test message sent successfully (message_id: {msg_data['result']['message_id']})")
        elif chat_id:
            results["messages"].append(f"ℹ️  Chat ID provided but not sending message (use --send-test-message to send)")
        
        results["status"] = "success"
        results["messages"].append("✅ Telegram bot configuration is valid!")
        
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
    print(f"Telegram Test Results: {results['status'].upper()}")
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
        description="Test Telegram bot configuration for Event Reminder"
    )
    parser.add_argument(
        "--token",
        help="Telegram bot token (default: env TELEGRAM_BOT_TOKEN)"
    )
    parser.add_argument(
        "--chat-id",
        help="Chat ID to test with"
    )
    parser.add_argument(
        "--send-test-message",
        action="store_true",
        help="Send a test message to the chat ID"
    )
    
    args = parser.parse_args()
    
    results = test_telegram_connection(
        bot_token=args.token,
        chat_id=args.chat_id,
        send_test_message=args.send_test_message,
    )
    
    print_results(results)
    
    # Exit with appropriate code
    sys.exit(0 if results["status"] == "success" else 1)
