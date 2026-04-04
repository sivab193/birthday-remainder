#!/usr/bin/env python3
"""
Run all integration tests for Event Reminder notification services.
This script runs SMTP, Telegram, and Discord tests in sequence.

Usage:
    python run_tests.py

Or with specific options:
    python run_tests.py --email user@example.com --send-test-message
    python run_tests.py --chat-id 123456789 --send-test-message
    python run_tests.py --webhook-url "https://discord.com/api/webhooks/..." --send-test-message
"""

import os
import sys
import argparse
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_test(script_name, args=None):
    """Run a test script and return the result."""
    cmd = [sys.executable, f"tests/{script_name}.py"]
    if args:
        cmd.extend(args)

    print(f"\n{'='*60}")
    print(f"Running {script_name} test...")
    print(f"Command: {' '.join(cmd)}")
    print('='*60)

    try:
        result = subprocess.run(cmd, cwd=os.path.dirname(__file__))
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running {script_name}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Run all Event Reminder integration tests"
    )
    parser.add_argument(
        "--email",
        help="Email address for SMTP test"
    )
    parser.add_argument(
        "--chat-id",
        help="Chat ID for Telegram test"
    )
    parser.add_argument(
        "--webhook-url",
        help="Webhook URL for Discord test"
    )
    parser.add_argument(
        "--send-test-message",
        action="store_true",
        help="Send test messages (requires --email, --chat-id, or --webhook-url)"
    )

    args = parser.parse_args()

    # Prepare test arguments
    smtp_args = []
    if args.email:
        smtp_args.extend(["--email", args.email])
    if args.send_test_message:
        smtp_args.append("--send-test-message")

    telegram_args = []
    if args.chat_id:
        telegram_args.extend(["--chat-id", args.chat_id])
    if args.send_test_message:
        telegram_args.append("--send-test-message")

    discord_args = []
    if args.webhook_url:
        discord_args.extend(["--webhook-url", args.webhook_url])
    if args.send_test_message:
        discord_args.append("--send-test-message")

    # Run tests
    results = []

    print("🚀 Starting Event Reminder Integration Tests")
    print("="*60)

    # Test SMTP
    smtp_success = run_test("test_smtp", smtp_args)
    results.append(("SMTP", smtp_success))

    # Test Telegram
    telegram_success = run_test("test_telegram", telegram_args)
    results.append(("Telegram", telegram_success))

    # Test Discord
    discord_success = run_test("test_discord", discord_args)
    results.append(("Discord", discord_success))

    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print('='*60)

    all_passed = True
    for service, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{service:10} {status}")
        if not success:
            all_passed = False

    print('='*60)
    if all_passed:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()