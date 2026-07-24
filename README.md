# CMT — Colic Monitoring Tool

A Progressive Web App (PWA) designed for referral-hospital veterinary teams to monitor horses recovering from colic surgery (e.g., large colon volvulus/displacement) across the critical post-operative window.

## Features

- **Offline-First PWA:** Works on mobile and tablets without an internet connection. Data is saved locally to the device.
- **Clinical Flowsheet Grid:** Replaces paper/Excel flowsheets with a multi-round, timeline-based electronic record.
- **Decision Support:**
  - **"On Ice" Engine:** Automatically computes a 0–100% score recommending prophylactic digital cryotherapy based on SIRS criteria (Heart Rate, Temperature, Lactate, WBC) and primary lesion risk.
  - **"Call Surgeon" Alerts:** Automatically evaluates inputs against 11 clinical triggers (e.g., net reflux > 2L, fever, pain) and fires escalation alerts.
- **Surgeon Settings (Scheduling):** Allows the attending clinician to set parameter check intervals (e.g., q2h TPR, q4h Full Exam), which dynamically labels the flowsheet for interns and nurses.
- **Weight-Driven Dose Calculator:** An interactive calculator preloaded with typical post-operative equine medications (antibiotics, NSAIDs, fluids, CRIs).

## How to Install on Mobile

1. Open the [live link](https://ghcoutinho.github.io/colic-flowsheet-app/) in **Chrome** (Android) or **Safari** (iOS).
2. Tap the browser's share or menu button.
3. Select **Add to Home Screen** / **Install App**.
4. The app will now appear on your home screen with its icon and can be opened offline.

## Development

Built with React, TypeScript, and Vite.

```bash
npm install
npm run dev
```

To build and deploy to GitHub Pages:
```bash
npm run deploy
```

> **Disclaimer:** This application provides clinical decision support only. It is not an autonomous order system. The attending veterinarian is responsible for all clinical decisions. Verify all doses and thresholds against your formulary.
