# API

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

### Response
```
Set-Cookie: session=<session-token>
```
`201 Created`

### Error Responses
- `400 Bad Request` — invalid username or password
- `409 Conflict` — username already exists


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
`200 OK`

### Error Responses
- `401 Unauthorized` — invalid username or password


## Logout

Logs out the current user by invalidating the active session and clearing the session cookie.

`POST /auth/logout`

### Request

### Response

`204 No Content`

The server deletes the corresponding session from Redis and clears the session cookie.

```http
Set-Cookie: session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/
```
