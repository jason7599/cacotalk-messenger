# 016 - Web Security

OK quickly gonna log this because I really kinda glossed over these.

Two big things: CORS and CSRF

## CORS

Cross Origin Resource Sharing

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

    config.setAllowedOrigins(List.of(frontendOrigin));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return source;
}
```

CORS say **which frontend origins a browser is allowed to let JavaScript read responses from**.

So huge mental shift for me:
- It's not about who can make requests
- It's about who can read the response

That's very interesting. So it's more of the browser's job.

Example: you are logged into bank,com. Then you visit evil,com

evil,com does pulls a prank and does `fetch("https://bank.com/account")`

It's not that the BE fails, the browser just doesn't let evil,com read the response. ok good

So it's more about user protection than server protection

## CSRF

Cross Site Request Forgery

So CORS is abt who can read the response right, and that was very interesting

So yeah CORS doesn't prevent the request being sent in the first place.

But what if evil,com did `post("https://bank.com/transfer")`?

CORS will stop evil,com from reading the resposne but in this case the action itself is what matters right

And bcuz session cookies are automatically attached on request, the server cant tell this is an invalid one

Damn bro

### SameSite

SameSite is a cookie setting that helps against CSRF

SameSite says "attach this cooki only if the pate that's initiating the request is the same site as the endpoint"

So `https://cacotalk.com` can send requests to `https://api.cacotalk.com` because it's the same eTLD+1 (effective top-level domain + 1 label)

But `https://evilfucker.com` wont be able to. Sounds good to me

No that really sounds like enough to me???

- `SameSite=Strict`: Disallow everything.
- `SameSite=Lax`: Allow only top-level navigation via GET (clicking a link, the address bar changing)

Why allow GET at all?

Take the flow of opening my app.

Say I sent my friend the link to my app on discord and they click it

The browser cant distinguish whether discord tried a get request on my app.

So the browser doesn't attach the cookie, so the user is left unauthed.

Darn!

Minor problem but bad UX I guess. 

#### Where it can fall apart:

I guess is when SameSite=Lax and if i have get endpoints that change state?

Damn, I guess this is why the REST API semantics matter!!!

THIS IS WHY GET SHOULD BE SAFE!!! I GET IT NOW

#### CSRF tokens

Im not gonna do this but just gonna log it briefly

The server generates a random token and gives it to the FE

And every request is checked with not only the session cookie but also this CSRF token

So evil,com can send the request but it has no way of reading the real CSRF token so it gets rejected.

cool

## Verdict

Relying on SameSite=Lax and CORS.

Checked all my GET endpoints are safe and not state changing.

Apparently this could all fall apart on old browsers or just browser glitches where samesite wont get enforced properly.

but yeah im just going with this