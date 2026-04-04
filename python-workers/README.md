# Python Workers

Dockerized background workers for the Event Reminder notification system. Uses Redis as a message broker with a scheduler that scans Firestore for events and dispatches jobs to channel-specific workers.

## Architecture

```
┌────────────┐     ┌───────┐     ┌────────────────┐
│  Scheduler │────▶│ Redis │────▶│ Email Worker   │
│ (Firestore)│     │       │────▶│ Telegram Worker│
└────────────┘     │       │────▶│ Discord Worker │
                   └───────┘     └────────────────┘
```

## Quick Start (using Makefile)

```bash
# 1. Edit your .env with actual values
# 2. Place your serviceAccountKey.json in this directory if you want Firestore mode

# Build and start all services
make build

# View real-time logs
make logs

# Stop everything
make down
```

> If `serviceAccountKey.json` is missing, the scheduler will start in mock mode and push dummy notifications to Redis for local testing.

*See `Makefile` for more commands (`make ps`, `make restart`, `make prune`).*

## Environment Variables

Create a `.env` file in this directory:

```env
# Redis (auto-configured in Docker, set for local dev)
REDIS_HOST=localhost

# Firebase (required by scheduler)
# Mount your serviceAccountKey.json as a volume (see docker-compose.yml)
FIREBASE_CREDENTIALS=/app/serviceAccountKey.json

# Email Worker (SMTP / Google Workspace)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com

# Telegram Worker
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

## Testing Integration

Test your notification configurations before deployment:

```bash
# Test all services at once
python run_tests.py

# Test individual services
python tests/test_smtp.py --email "your-email@example.com" --send-test-message
python tests/test_telegram.py --chat-id "123456789" --send-test-message
python tests/test_discord.py --webhook-url "https://discord.com/api/webhooks/..." --send-test-message

# On Linux/Mac with make
make test-all

# On Windows
run_tests.bat
```

**Test Results:**
- ✅ **SMTP**: Connection and authentication successful
- ✅ **Telegram**: Bot token valid, can send messages to provided chat ID
- ✅ **Discord**: Webhook URL valid, can post messages

> **Note:** Telegram requires users to start a conversation with your bot first. Discord webhooks need valid URLs from your server settings.
```

## Workers

| Worker | Queue | Dependency | Description |
|---|---|---|---|
| **Scheduler** | — | Firebase, Redis | Scans Firestore for today's events, pushes to Redis queues |
| **Email** | `email_queue` | SMTP (smtplib) | Sends HTML emails with age/duration, portal link |
| **Telegram** | `telegram_queue` | Bot API | Sends Markdown messages via Telegram bot |
| **Discord** | `discord_queue` | Webhook | Sends rich embeds to Discord channels |
| **Bulk Importer** | — | Firebase, CSV | One-time import of events from CSV file |

## Bulk Import

Import events from a CSV file into Firestore. Useful for migrating from other systems.

### CSV Format

Create `events.csv` in this directory with columns:
- `First Name`: Person's name
- `Birthday`: Date in DD/MM/YYYY, DD-MMM-YY, or YYYY-MM-DD format
- `Anniversary`: Date in same formats (optional)

Example:
```csv
First Name,Birthday,Anniversary
John Doe,15/08/1990,10/05/2015
Jane Smith,1992-03-24,
Bob Johnson,5-Jan-74,2018-06-15
```

### Running Bulk Import

```bash
# Set your user ID (get from Firebase Auth)
export USER_UID="your-firebase-user-id"

# Run the import
make bulk-import

# Or manually:
docker compose --profile import run --rm bulk_import
```

> **Note:** The bulk importer runs once and exits. It uses the `import` Docker profile to avoid running with regular services.

The scheduler needs a Firebase service account key:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json` in this directory
4. The `docker-compose.yml` mounts it as a read-only volume

> ⚠️ Never commit `serviceAccountKey.json` to git. It's already in `.gitignore`.
