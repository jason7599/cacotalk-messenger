# Auth API

## Errors

See [API Errors](./errors.md) for the response shape and the full `ApiErrorCodes` table.

## Session Cookie

Both Register and Login set a `session` cookie: `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure`.

The session itself is a random 32-byte token, stored server-side in Redis as a SHA-256 hash -> userId mapping with a sliding TTL (`app.auth.session.ttl`, currently 7 days, renewed on every authenticated request). 


## Register

Creates a new user account and authenticates the newly registered user.

`POST /auth/register`

### Request
```json
{
  "username": "alice",
  "password": "secret"
}
```
- `username`: 3–32 characters, lowercase letters and digits only, at least one letter.
- `password`: 6–32 characters (whitespace allowed; username is trimmed, password is not).

### Response
```
Set-Cookie: session=<session-token>
```
`201 Created` (empty body)

### Error Responses
- `400 Bad Request` — `VALIDATION_ERROR` — invalid username or password per the rules above
- `409 Conflict` — `USERNAME_TAKEN` — username already exists


## Login

Authenticates an existing user.

`POST /auth/login`

### Request
```json
{
  "username": "alice",
  "password": "secret"
}
```

### Response
```
Set-Cookie: session=<session-token>
```
`204 No Content` (empty body)

### Error Responses
- `401 Unauthorized` — `BAD_CREDENTIALS` — username not found, or password doesn't match. The response does not distinguish which (avoids leaking which usernames exist).


## Logout

Logs out the current user by invalidating the active session and clearing the session cookie.

`POST /auth/logout`

### Request
None
### Response

`204 No Content`

The server deletes the corresponding session from Redis and clears the session cookie.

```http
Set-Cookie: session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/
```

## Get Authenticated User

Checks whether the current session is valid and returns the authenticated user's ID.

`GET /auth/me`

### Request
None
### Response

`200 OK`

```json
{
  "userId": 42,
  "username": "Alice"
}
```

### Error Responses

- `401 Unauthorized` — `UNAUTHORIZED` — no valid session exists
