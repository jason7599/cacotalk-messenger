# 003 - Understanding Refresh Tokens

I gotta document this because I really am struggling here.

## OK let's start from the beginning - Access Tokens.

They're nice but what if they get stolen, huh? 

OK so we put a short expiry. So that if one gets stolen, the attacker doesn't have infinite time to muck around.

Minimize the damage that kind of stuff.

Ok so short expiry. But now. HORRIBLE UX. You gotta re-login every 30 minutes? RANCID.

So we need 2 things at once:

1. A stolen token should die quickly
2. Legit users should be able to stay authed for a long time

## Introducing Refresh Tokens..........

So there's no debate access tokens should die quickly. Duh.

So let access tokens be short lived, while refresh tokens long lived.

Soo.... If a refrehs token gets stolen.. Or if it's stealable at all... Wouldn't that be a worse access token?

## I think I kinda understand what my problem is

I've been like "if RTs don't make it absolutely secure and if it's not absolutely unstealalbe it makes no sense"

But i guess the whole point is that "ofc there's no fairytale wonderland where nothing is unstealable, but RTs are much harder to steal because of how it's used and how often and etc"

OK then. Yeah if that's it, OK.

This really helped me out
> **Stolen refresh tokens are BAD. Like really bad. Nothing is holy**

Gotcha fam

## What makes RTs harder to steal

### 1. Coverage: they go to fewer API points.

Unlike access tokens that pretty much go everywhere for eveyr endpoint. 

Refresh tokens are pretty much sent only for issuing new access tokens.

### 2. Frequency: sent much less often

Same argument as coverage.

### 3. Storage: much less exposed.

Btw Javascript can read from localStorage. 

And XSS means: an attacker somehow managing to get THEIR javascript code executed in your website

OK I'll not dive too much into XSS, I'll just know that localStorage aint exactly the safest place to be

But I do gotta detour a bit

Why store access tokens in localStorage anyway? Why not give it the same secure treatment as RTs?

GPT says:
```
TL;DR:
* You **do not have to store access tokens in `localStorage`**.
* `localStorage` is popular mostly because it is easy for frontend JS to use.
* Safer options exist:

  * **Access token in memory**: JS can use it, but it disappears on reload.
  * **HttpOnly cookie / BFF setup**: browser JS never sees the token at all.

So the rule is basically:

> **If JS doesn’t need to read the token, don’t give it to JS.**

And yes, access tokens can absolutely get similar protection to refresh tokens. `localStorage` is convenience, not destiny.
```

## What the fuck
## QnA sesh with GPT

**Q**: If you give refresh tokens a special security treatment like httponly but not access tokens? ... That's just like, not doing your best on purpose??? Like why not extend that effort for access tokens? Which now you told me is possible, so it makes no sense to not do that.

**A**: Yes: if your architecture allows you to protect the access token too, then doing so can be better. There is no prize for intentionally leaving the AT in localStorage.
The reason people often protect RTs more is pragmatic: **some SPA designs want JavaScript to directly call APIs, so JS needs the access token**. The RT does not need to be exposed to JS, so it gets stronger storage.

---

**Q**: OK so now that if you do that for ATs too, that just kinda weakens the argument of "RTs are much guarded than ATs". I mean I guess there's still the argument of frequency and coverage but still it weakens it.

**A**: Also yes. The argument becomes less about storage and more about role separation.
It becomes:

“The credential that touches lots of APIs dies quickly, while the long-lived credential has a much narrower job and attack surface.”

---

**Q**: Ok I think this might be the most intriguing line: "some SPA designs want JavaScript to directly call APIs, so JS needs the access token". If that really is the case, I can get behind this whole thing

**A**: Now the asymmetry suddenly has a reason. We are not going:

“Eh, let's protect the important token and leave the other one lying on the kitchen counter for character development.”

We are saying:

“The AT must cross the JS boundary because the SPA needs it. The RT does not, so keep the RT behind that boundary.”

And then the short AT lifetime is compensating for that extra exposure:

AT:
"I have to be exposed to JS, unfortunately."
→ make me expire quickly

RT:
"I don't have to be exposed to JS."
→ keep me HttpOnly and long-lived

That is a much more coherent story.

Because of **who the SPA is talking to, and how that API expects authentication**.

If your React app talks directly to an API like this:

```text
Browser React app
    |
    | GET https://api.example.com/messages
    | Authorization: Bearer <access token>
    v
API
```

then the browser-side JavaScript must somehow obtain the access token so it can attach that `Authorization` header.

That is what people mean by:

> “The SPA needs the access token.”

The API is basically saying:

> “Every request must bring me a bearer token.”

And the SPA is the thing making those requests.

Contrast that with cookie-based auth:

```text
Browser React app
    |
    | GET /messages
    | Cookie attached automatically by browser
    v
Backend
```

Here, React does **not** need to know the credential value. The browser handles the cookie automatically.

So the real distinction is:

```text
Bearer-token API
→ JavaScript usually needs access to the AT
→ JS manually sends Authorization: Bearer ...

Cookie-authenticated backend
→ JavaScript doesn't need the credential
→ browser automatically sends cookie
```

Why would you choose the first architecture? Usually because your API is designed as a more independent **resource server** that may serve multiple kinds of clients:

```text
React SPA ─────┐
iOS app ───────┤
Android app ───┼──► API
CLI tool ──────┤
Other service ─┘
```

A bearer access token is convenient there. Every client just presents:

```http
Authorization: Bearer <token>
```

The API doesn't particularly care whether the caller is React, iOS, Android, or a toaster with ambitions.

But if your architecture is simply:

```text
your React app
       ↓
your Spring backend
```

then you have much more freedom. You can absolutely say:

> “Why should React know about bearer tokens at all? Let the browser send an HttpOnly session cookie.”

And **that** is why the “SPA needs the AT” statement isn't inherent to SPAs.

More accurately:

> **Some SPAs need JavaScript-readable access tokens because they directly call bearer-token-protected APIs.**

The architecture creates the need. Being a SPA by itself does not.

# Cookies are browser-specialized. Bearer tokens are client-agnostic.

# This subject clearly outgrew "understanding refresh tokens". Continuing on in [the next page](./004-understanding-auth-architecture.md)