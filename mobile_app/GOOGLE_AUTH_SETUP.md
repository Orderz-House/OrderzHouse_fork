# Google Sign-In Setup

## 1. Mobile app .env

Add to `mobile_app/.env`:

```
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Get this from [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID → **Web application**.

## 2. Backend .env

Add to `backendEsModule/.env`:

```
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

(Same Web Client ID as mobile. Backend verifies the idToken with Google.)

## 3. Backend endpoint

`POST /auth/google` is implemented. Body: `{ "idToken": "<google_id_token>" }`. Response same as `/users/login` (token, userInfo, must_accept_terms).

**Note:** Google login only works for **existing** users. If the Google email is not in the DB, the backend returns "No account found with this Google email. Please register first."

## 4. Android

- **SHA-1**: Add debug and release SHA-1 to the **Web application** OAuth client in Google Cloud Console (or create an Android OAuth client and add SHA-1 there).
- **Package name** must match `applicationId` in `build.gradle.kts`.
- **minSdk**: 21 (configured).

Get SHA-1:
```bash
# Debug (Windows: %USERPROFILE%\.android\debug.keystore)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
```

## 5. iOS

1. Create an **iOS** OAuth 2.0 client in Google Cloud Console.
2. In `ios/Runner/Info.plist`, replace the URL scheme:
   - Find: `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID`
   - Replace with your **Reversed Client ID** (e.g. `com.googleusercontent.apps.123456789012-abcdefghijklmnop`)

The Reversed Client ID is shown when you create the iOS OAuth client.
