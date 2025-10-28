# Monitoring Setup Guide

This document provides instructions for setting up external monitoring services for the Magnus Compliance Dashboard.

## Table of Contents

- [Overview](#overview)
- [Uptime Robot Setup](#uptime-robot-setup)
- [BetterStack Setup](#betterstack-setup)
- [Sentry Error Monitoring](#sentry-error-monitoring)
- [Recommended Monitoring Strategy](#recommended-monitoring-strategy)

---

## Overview

External monitoring helps ensure your application is always available and performing well. This guide covers two popular uptime monitoring services:

1. **Uptime Robot** - Free tier available, simple setup
2. **BetterStack** - More advanced features, better integrations

Both services will ping your `/api/metrics` endpoint every 5 minutes to ensure the application is responding correctly.

---

## Uptime Robot Setup

Uptime Robot offers a generous free tier with monitoring checks every 5 minutes.

### Step 1: Create an Account

1. Go to [https://uptimerobot.com](https://uptimerobot.com)
2. Sign up for a free account
3. Confirm your email address

### Step 2: Add a New Monitor

1. Click **"+ Add New Monitor"**
2. Configure the monitor:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Magnus Compliance Dashboard - Metrics API`
   - **URL**: `https://your-domain.com/api/metrics`
   - **Monitoring Interval**: `5 minutes` (default for free tier)
   - **Monitor Timeout**: `30 seconds`

### Step 3: Configure Alert Contacts

1. Go to **"My Settings"** → **"Alert Contacts"**
2. Add notification methods:
   - **Email**: Add your email for alerts
   - **Slack** (optional): Integrate with your Slack workspace
   - **SMS** (optional): Available on paid plans

### Step 4: Set Up Status Page (Optional)

1. Go to **"Status Pages"**
2. Click **"+ Add New Status Page"**
3. Select the monitors you want to display
4. Customize the appearance
5. Publish and share the URL with stakeholders

### Advanced Configuration

For HTTP monitors, you can add:

```
POST Request Body (if needed):
{
  "healthcheck": true
}

Expected HTTP Status Codes:
200

Expected Keywords:
"success"
```

---

## BetterStack Setup

BetterStack (formerly Better Uptime) offers more advanced features including incident management and better integrations.

### Step 1: Create an Account

1. Go to [https://betterstack.com](https://betterstack.com)
2. Sign up for an account
3. Create a new project for your application

### Step 2: Add Uptime Monitor

1. Navigate to **"Uptime"** → **"Monitors"**
2. Click **"Create monitor"**
3. Configure the monitor:
   - **Monitor Type**: `HTTP`
   - **Name**: `Magnus Compliance Dashboard - Metrics`
   - **URL**: `https://your-domain.com/api/metrics`
   - **Check Frequency**: `5 minutes`
   - **Request Method**: `GET`
   - **Expected Status Code**: `200`

### Step 3: Add Response Validation

1. Under **"Response validation"**, add:
   - **Response contains**: `"success":true`
   - **Response time threshold**: `< 2000ms` (adjust based on your needs)

### Step 4: Configure Notifications

1. Go to **"On-call & Escalations"**
2. Set up your escalation policy:
   - **Level 1**: Email/SMS to primary contact (immediate)
   - **Level 2**: Call to secondary contact (after 5 minutes)
   - **Level 3**: Team notification (after 15 minutes)

### Step 5: Integrate with Slack/Teams

1. Go to **"Integrations"**
2. Select your preferred integration:
   - **Slack**: Connect workspace and select channel
   - **Microsoft Teams**: Add webhook URL
   - **PagerDuty**: Connect for advanced incident management

### Step 6: Set Up Status Page

1. Navigate to **"Status pages"**
2. Click **"Create status page"**
3. Configure:
   - Add your monitors
   - Customize branding (logo, colors)
   - Set up custom domain (optional)
   - Configure subscriber notifications

### Advanced Features

#### Heartbeat Monitoring

For background jobs or cron tasks:

```typescript
// Example: Send heartbeat after successful task
const heartbeatUrl = process.env.BETTERSTACK_HEARTBEAT_URL;

async function sendHeartbeat() {
  try {
    await fetch(heartbeatUrl, { method: 'GET' });
  } catch (error) {
    console.error('Failed to send heartbeat:', error);
  }
}

// Call after successful job completion
sendHeartbeat();
```

#### Custom Headers

Add authentication headers if your API requires them:

```
Header: Authorization
Value: Bearer YOUR_TOKEN
```

---

## Sentry Error Monitoring

Sentry is already configured in this project for runtime error capture.

### Step 1: Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (generous free tier available)
3. Create a new project and select **"Next.js"**

### Step 2: Configure Environment Variables

Add the following to your `.env.local`:

```bash
# Get this from Sentry project settings
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456

# For production builds with source maps (optional)
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

### Step 3: Deploy Configuration

1. Add environment variables to your hosting platform (Vercel, Railway, etc.)
2. Redeploy the application
3. Errors will automatically be sent to Sentry

### Step 4: Configure Alerts

1. In Sentry, go to **"Alerts"** → **"Create Alert"**
2. Set up rules:
   - **When**: An event is seen
   - **If**: Event level is equal to error
   - **Then**: Send notification to Slack/Email

### Step 5: Monitor Performance

Sentry also tracks performance metrics:

1. Go to **"Performance"** in Sentry
2. View transaction durations
3. Identify slow API routes
4. Set up performance alerts for degraded endpoints

---

## Recommended Monitoring Strategy

For comprehensive monitoring, use a combination of services:

### Free Tier Approach

```
┌─────────────────┐
│  Uptime Robot   │  → Monitor /api/metrics every 5 min
└─────────────────┘

┌─────────────────┐
│     Sentry      │  → Capture runtime errors & performance
└─────────────────┘
```

### Professional Approach

```
┌─────────────────┐
│  BetterStack    │  → Uptime monitoring + status page
└─────────────────┘

┌─────────────────┐
│     Sentry      │  → Error tracking + performance
└─────────────────┘

┌─────────────────┐
│   Vercel/CDN    │  → Edge analytics + logs
└─────────────────┘
```

### Monitor These Endpoints

Create monitors for the following endpoints:

1. **Health Check**: `GET /api/metrics`
   - **Expected Response**: `200 OK`
   - **Contains**: `"success":true`
   - **Frequency**: Every 5 minutes

2. **Homepage**: `GET /`
   - **Expected Response**: `200 OK`
   - **Frequency**: Every 10 minutes

3. **Organizations API**: `GET /api/orgs?limit=1`
   - **Expected Response**: `200 OK`
   - **Contains**: `"success":true`
   - **Frequency**: Every 15 minutes

### Alert Thresholds

Configure alerts for:

- **Downtime**: Any failed check
- **Response Time**: > 3 seconds
- **Error Rate**: > 1% in last hour
- **SSL Certificate**: Expiring in < 7 days

### Notification Channels

Set up multiple channels based on severity:

#### Critical (Immediate)
- SMS/Phone call
- PagerDuty
- Slack with @channel

#### Warning (5 min delay)
- Email
- Slack without mention
- Teams notification

#### Info (Daily digest)
- Email summary
- Performance reports
- SSL expiration reminders

---

## Testing Your Setup

After configuration, test your monitoring:

1. **Simulate Downtime**:
   ```bash
   # Temporarily break the API
   # Deploy a version that returns 500
   ```

2. **Verify Alerts**:
   - Check email notifications
   - Confirm Slack messages
   - Test escalation policies

3. **Check Status Page**:
   - Verify incident is displayed
   - Confirm subscriber notifications sent
   - Test status page updates

4. **Sentry Test**:
   ```typescript
   // Add to any page temporarily
   throw new Error('Test Sentry Integration');
   ```

---

## Dashboard Integration

You can display uptime status in your dashboard:

```typescript
// Example: Fetch Uptime Robot status
const response = await fetch(
  'https://api.uptimerobot.com/v2/getMonitors',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.UPTIME_ROBOT_API_KEY,
    }),
  }
);
```

---

## Best Practices

1. **Set Realistic Thresholds**: Don't alert on every small blip
2. **Use Escalation Policies**: Start with email, escalate to phone
3. **Monitor from Multiple Locations**: Catch regional issues
4. **Keep Status Page Updated**: Communicate with users during incidents
5. **Review Analytics Monthly**: Identify trends and improve reliability
6. **Test Your Alerts**: Ensure notifications reach the right people
7. **Document Runbooks**: Link to resolution steps in alerts

---

## Troubleshooting

### Alerts Not Received

1. Check notification settings in monitoring service
2. Verify email/phone number is correct
3. Check spam folder
4. Test integration manually

### False Positives

1. Increase timeout values
2. Check if API endpoint is consistently slow
3. Verify expected response criteria
4. Consider geolocation of monitoring checks

### Status Page Not Updating

1. Verify monitor is linked to status page
2. Check incident management settings
3. Ensure status page is published
4. Clear browser cache

---

## Support Resources

- **Uptime Robot**: [docs.uptimerobot.com](https://docs.uptimerobot.com)
- **BetterStack**: [docs.betterstack.com](https://docs.betterstack.com)
- **Sentry**: [docs.sentry.io](https://docs.sentry.io)

---

## Next Steps

After setting up monitoring:

1. ✅ Configure at least one uptime monitoring service
2. ✅ Set up Sentry for error tracking
3. ✅ Create a status page for stakeholders
4. ✅ Test your alerting system
5. ✅ Document your incident response process
6. ✅ Schedule monthly monitoring reviews

For questions or issues, consult the service documentation or contact your system administrator.
