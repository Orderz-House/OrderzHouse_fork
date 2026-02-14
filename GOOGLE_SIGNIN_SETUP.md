# إعداد تسجيل الدخول عبر Google (يعمل على localhost)

## الخطأ الذي يظهر
- **The given origin is not allowed for the given client ID** → تحتاج إضافة عنوان موقعك (حتى localhost) في Google Cloud.
- **500 على /auth/google** → غالباً إما عدم وجود `GOOGLE_CLIENT_ID` في الباكند أو الـ Client ID غير مضبوط.

---

## 1) إعداد Google Cloud Console (مطلوب منك)

1. ادخل إلى [Google Cloud Console](https://console.cloud.google.com/).
2. اختر المشروع الذي فيه الـ OAuth Client (أو أنشئ مشروعاً).
3. من القائمة: **APIs & Services** → **Credentials**.
4. افتح الـ **OAuth 2.0 Client ID** من نوع **Web application** (نفس الـ Client ID المستخدم في الفرونت).

5. **Authorized JavaScript origins** – أضف **بالضبط** عنوان واجهة الموقع:
   - إذا الفرونت على Vite: `http://localhost:5173`
   - إذا على بورت آخر: `http://localhost:XXXX`
   - يمكن إضافة أيضاً: `http://127.0.0.1:5173`
   - لا تكتب `/` في النهاية ولا مسار (فقط الأصل، مثلاً `http://localhost:5173`).

6. **Authorized redirect URIs** (لزر جوجل العادي غالباً لا تحتاجها، لكن إن طُلبت أضف مثلاً):
   - `http://localhost:5173`

7. احفظ التغييرات وانتظر دقيقة ثم جرّب من جديد.

---

## 2) إعداد الباكند (.env)

في مجلد الباكند (مثلاً `backendEsModule`) في ملف `.env` أضف:

```env
# نفس الـ Client ID المستخدم في الفرونت (Web application)
GOOGLE_WEB_CLIENT_ID=308002675488-t2b7tf6ndhl5dg4u31hr7fcrm7l31gmp.apps.googleusercontent.com
```

أو:

```env
GOOGLE_CLIENT_ID=308002675488-t2b7tf6ndhl5dg4u31hr7fcrm7l31gmp.apps.googleusercontent.com
```

يجب أن يكون الـ Client ID **مطابقاً** للـ Client ID في الفرونت (في `main.jsx` داخل `GoogleOAuthProvider`).

ثم أعد تشغيل السيرفر.

---

## 3) ملخص

| المشكلة | الحل |
|--------|-----|
| Origin not allowed | إضافة `http://localhost:5173` (أو بورتك) في **Authorized JavaScript origins** في Google Console |
| 500 من /auth/google | التأكد من وجود `GOOGLE_WEB_CLIENT_ID` أو `GOOGLE_CLIENT_ID` في `.env` الباكند وأن قيمته نفس الـ Client ID في الفرونت |
| COOP / postMessage | عادة يختفي بعد ضبط الـ origins بشكل صحيح |

**لا تحتاج رفع الموقع على دومين** – Google يسمح بـ localhost في الـ origins.
