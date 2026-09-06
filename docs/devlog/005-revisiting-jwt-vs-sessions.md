# 005 - Revisiting JWT vs Sessions

Dear god

So, let me just make a very oversimplified dumb conclusion. Talking about pros against the other.

JWT: Stateless.

Session Cookies: Revocation easy as fuck. Smaller loads. 

In terms of security, nothing much to be said because that would be transport talk (cookie vs localstorage bs).

# I THINK WE LANDED ON A CONCLUSION

>
> JWT = stateless verification, but revocation/control is harder.
> 
> Sessions = centralized state, but revocation/control is easy.
>
> Security is not primarily “JWT vs session”; it is heavily shaped by storage + transport, with some credential-model differences still mattering.

# Do sessions have a TTL?

same story as jwts.

- Long lived sessions → shitty security
- Short lived → safer but poopass UX

The common answer is **sliding expiration**. Which is kinda like refresh token rotation but not exactly\
-> because rotation means creating a new one and discarding the old one

As long as the user keeps using the app, the expiry window keeps sliding forward.

If they fuck off for long enough, the session dies

This is natural with sessions because every authenticated request already requires session -> user_id lookup anyway

Since we're consulting server-side session state anyway, we can also extend its expiry while we're at it

### Absolute timeout

What if it's stolen man, it can be used indefinitely

So sessions can also have an **absolute lifetime**:

```
idle timeout:       30 minutes
absolute lifetime:  30 days
```

Activity can keep pushing the idle timeout forward, but **never beyond the absolute deadline**.

Eventually:

```
30 days since authentication
→ session dead
→ actual login required again
```

# But bro
that doesn't sound very good for a realtime messenger app. Most people just let it sit in the background while they do whatever until they get a message which can be very long before that happens.

Having a short renewal would basically be like those bank apps that boot you out after 30 mintues

Also having an absolute expiry at all, i feel would be quite annoying. I mean  I know it's for security, but lets be real, have you ever been asked to log in again while using a messenger application? That like literally never happens bro

So I'm leaning more towards NO ABSOLUTE TIMEOUT, and long renewals - like 7 days. Meaning if you use the app regularly enough, you never see the login screen. If you take like a 7 day hiatus from the app? Login again. I think that is absolutely fair. 

# Of course then there's the glaring issue of "what if the session gets stolen".

Shut up.

Firstly, the session itself will be as guarded as a refresh token - in JS-unreadable session. So if you want to make that argument, you also should recognize the AT+RT design doesn't solve that either. That's a whole nother security issue. I guess you could say RTs are somewhat safer because they are only sent out when the access token dies which would be like, idk, 30 min ~1 hour, whereas the session id is sent out every api hit, but storagewise, it can't get better than this. HttpOnly, Secure, SameSite, all that good stuff.

Secondly we still gain the benefit of easy instant revocation

Thirdly, I think UX wise this is the absolute best.

# DECISION - GOING WITH SESSIONS.

I think what I wrote already justifies it, but there's even more... 

## Multiple Devices.

I'm talking about the nature of this app itself. A realtime messenger. 

I already need session info for things like 

- realtime notification fanout from the server
- Multiple device support
- Potentially later, online presence. 

It just... fits perfectly imo. Especially the first part about notif fan out.

Decision has been made.

# REVISION after writing [006](./006-octopus-orgy.md)


Yeah so some of the shit above was based on an assumption that turned out to be wrong.

I was assuming the backend would have to manually keep track of all the WebSockets for a user and fan stuff out itself.

Turns out nope Spring/STOMP can already handle subscription-based fanout for me.

So the whole "well I need connection state anyway, so sessions fit perfectly" argument kinda goes out the window.

Also I was making session expiry UX sound more cursed than it actually has to be. Heartbeats could be used to keep sliding the session expiry forward and an absolute expiry won't fuck the UX

So yeah

I still think sessions make sense, but a couple of my earlier arguments were built on shit I hadn't understood yet.

fantastic