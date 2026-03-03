# Referral visit tracking dedupe fix

## Why duplicates happened

1. **Multiple call sites** — `/referrals/visit` was triggered from both App.jsx (on route change) and Register.jsx (on mount). Opening `/register?ref=efe` could fire the effect in App and the effect in Register, causing 2+ requests.
2. **React StrictMode** — In development, React intentionally double-invokes effects. So a single "log visit" effect could run twice before the first request completed, so dedupe flags set only *after* the response were too late.
3. **Late dedupe** — The previous guard only set "already logged" in sessionStorage *after* a successful response. Concurrent calls (StrictMode or App + Register) all passed the guard and sent multiple POSTs, each getting a new `session_id` when the cookie wasn’t yet set or wasn’t sent cross-port, inflating unique visits.

## How the fix prevents duplicates

1. **Single call site** — Visit logging runs only in **App.jsx** (one `useEffect` on `location.search`). Register.jsx only stores attribution for signup; it does not call `/referrals/visit`.
2. **Pre-request in-flight lock** — In `partnerReferral.js` we use two sessionStorage keys per source:
   - **doneKey** (`oh_visit_done_${sourceLower}`): if set, we already logged this source this session → return without calling API.
   - **lockKey** (`oh_visit_lock_${sourceLower}`): set **before** the network call. If it’s already set, another request is in flight → return. Cleared in `finally` after the request completes. So at most one request per source is ever in flight.
3. **Stable session_id** — A client-side `session_id` is stored in localStorage (`oh_ref_sid_client`) and sent in the request body. Backend uses: cookie `oh_ref_sid` first, then `body.session_id`, then generates new. So even when the cookie isn’t sent (e.g. cross-port localhost), the same browser session gets the same `session_id`, and the DB stays idempotent.
4. **Backend idempotency** — Table `referral_visits` has `UNIQUE(source, session_id)`. Insert uses `ON CONFLICT (source, session_id) DO NOTHING`. So duplicate requests from the client still produce only one row. Cookie is set with `secure: false` in development so it’s sent on http://localhost.

## Migration

Run migration **017** to remove existing duplicate rows and add the unique constraint (idempotent):

```bash
psql -d your_database -f backendEsModule/migrations/017_referral_visits_unique_source_session.sql
```

## Verification

1. Clear test rows: `DELETE FROM referral_visits WHERE source = 'efe';`
2. Open `http://localhost:5173/register?ref=efe&utm_source=efe&utm_medium=referral&utm_campaign=test` in a new Incognito window.
3. DevTools → Network (Fetch/XHR): exactly **one** request to `/referrals/visit`.
4. DB: exactly **one** new row for `source = 'efe'` with a stable `session_id`.
5. Reload the page: no new row (doneKey prevents a second request).
6. Stats endpoint: `uniqueVisits` = count of distinct `session_id` for the source in the date range.

## Signup attribution

Unchanged: attribution (ref/UTM) is still stored in localStorage on landing and attached to signup via `getStoredAttribution()` in the register flow. Only the *visit* logging is deduped and moved to a single call site.
