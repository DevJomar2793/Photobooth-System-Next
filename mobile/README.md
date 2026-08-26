# SnapCapture Booth mobile

Expo/React Native client for the existing SnapCapture FastAPI backend.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `EXPO_PUBLIC_API_URL` to a backend URL reachable from the phone, not `localhost`.
3. Run `npm install` and `npm start`.

The app implements the backend's existing image API only. It does not provide authentication, reservations, payments, QR features, or settings because those APIs do not currently exist.

## Build environments

`eas.json` defines `development`, `preview`, and `production` profiles. Set `EXPO_PUBLIC_API_URL` as a plain-text variable in each matching EAS environment before building.
