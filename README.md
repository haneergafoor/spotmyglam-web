# SpotMyGlam Web App

Premium salon discovery and booking platform built with Next.js, OTP authentication, and Razorpay-ready payments.

## ✨ Features
- OTP login for customers, salon owners, and admins
- Location-aware salon discovery (20km radius)
- End-to-end booking flow with Razorpay checkout
- Booking history, owner dashboard, and admin analytics
- Monochrome UI system with SpotMyGlam branding

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## 🔐 Environment variables

Copy the template and fill in your credentials:

```bash
cp .env.example .env.local
```

Required:
- `AUTH_JWT_SECRET`
- `SMS_PROVIDER` (`twilio` or `msg91`)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (for Twilio)
- `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` (for MSG91)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` (for Razorpay webhooks)

## 👥 Demo access

Use the seeded demo accounts:
- Admin: **9990000000**
- Salon Owner: **9990001111**

## 📝 Scripts

```bash
npm run dev      # Start dev server
npm run lint     # Run ESLint
npm run build    # Build for production
npm run start    # Start production server
```

## 🌐 Deployment

Deployed on Vercel at: https://spotmyglam-web.vercel.app
