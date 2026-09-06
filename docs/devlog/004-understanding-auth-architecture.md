Continuing from the [last page](./003-understanding-refresh-tokens.md)

We first oughtta tackle why ATs has to live in localStorage for SPA

# So can we all agree putting anything credentialwise in localStorage is kinda a stinky? 

Yeah thanks to XSS

# But then ofc access token SPA doesn't necessarily mean localStorage, so saying using ATs itself is stinky too would itself be stinky?

Yeah

# So that question about "ATs have to live in localStorage for SPA" is wrong and I was stinky

Yeah sadly

# OK. Then I guess the question now is... what's wrong with sending ATs via cookie, like how we do with RTs?

Instead of 
```
Authorization: Bearer .....
```
Why not accept
```
Cookie: access_token=.....
```
With something like
```
Set-Cookie: access_token=....; HttpOnly; Secure; SameSite=Strict
```

Now the SPA never needs to read the access token. The browser carries it to the API automatically, while JavaScript can't extract it.

bro that sounds good

# So why isn't this SIMPLY THE ANSWER?

Because you've changed the credential-delivery model. Cookies are attached by the browser automatically, which creates CSRF concerns. With an Authorization header, an evil site can't ordinarily cause your browser to magically attach your bearer token. With cookies, the browser may send the credential without your JavaScript explicitly choosing to.

```
Authorization header
────────────────────────────
JS explicitly supplies credential

Authorization: Bearer AT

✓ not automatically sent cross-site
✓ natural OAuth/API semantics
✗ JS must possess the AT
✗ XSS may steal it


HttpOnly cookie
────────────────────────────
Browser supplies credential

Cookie: access_token=AT

✓ JS cannot read AT
✓ XSS can't simply exfiltrate it
✗ browser automatically sends cookie
✗ therefore CSRF needs attention
```