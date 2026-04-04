# Health Check Tests

Test utilities to verify notification service configuration before deployment.

## SMTP Test

### Quick test (check connection only)
```bash
cd python-workers
python tests/test_smtp.py
```

### Send test email
```bash
python tests/test_smtp.py --send-to your-email@gmail.com
```

### Custom server
```bash
python tests/test_smtp.py \
  --host smtp.sendgrid.net \
  --port 465 \
  --user apikey \
  --password "SG.xxxxx" \
  --from noreply@example.com
```

### With environment variables
```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your-email@gmail.com
export SMTP_PASSWORD="your-app-password"
export SMTP_FROM="no-reply@example.com"

python tests/test_smtp.py --send-to test@example.com
```

## Telegram Test

### Quick test (verify bot token only)
```bash
export TELEGRAM_BOT_TOKEN="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
python tests/test_telegram.py
```

### Send test message
```bash
python tests/test_telegram.py --chat-id 870213478 --send-test-message
```

### Get your Chat ID
```bash
# Message the bot first, then:
python tests/test_telegram.py --chat-id YOUR_CHAT_ID --send-test-message
```

## Discord Test

### Quick test (verify webhook URL)
```bash
python tests/test_discord.py --webhook-url "https://discord.com/api/webhooks/123456789/ABCdefGHIjklMNOpqrstuVWxyz"
```

### With environment variable
```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
python tests/test_discord.py
```

## Exit Codes

- `0` — Success
- `1` — Failed

## Docker Usage

### Test SMTP inside container
```bash
docker-compose exec email_worker python tests/test_smtp.py
docker-compose exec email_worker python tests/test_smtp.py --send-to test@example.com
```

### Test Telegram inside container
```bash
docker-compose exec telegram_worker python tests/test_telegram.py
docker-compose exec telegram_worker python tests/test_telegram.py --chat-id 870213478 --send-test-message
```

### Test Discord inside container
```bash
docker-compose exec discord_worker python tests/test_discord.py --webhook-url "https://discord.com/api/webhooks/..."
```

## Common Errors

| Error | Solution |
|-------|----------|
| **SMTP: Authentication failed** | Use App Password for Gmail, not your regular password |
| **SMTP: Connection timeout** | Check SMTP_HOST and SMTP_PORT are correct |
| **Telegram: Chat not found** | Have you started a chat with the bot first? Click the "Start chat with Event Reminder Bot" link in the UI |
| **Telegram: Bad request** | Chat ID must be numeric (e.g., 870213478) |
| **Discord: 404 Not Found** | Webhook URL is invalid or has been deleted |
| **Discord: 401 Unauthorized** | Webhook token has expired, create a new one |

## Telegram Bot Setup

**Important:** Telegram bots can only send messages to users who have first initiated contact. The UI now includes a clickable link to start the conversation with the bot before verification.
