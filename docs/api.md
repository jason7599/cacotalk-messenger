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
`201 Created`
```json
{
  "token": "<jwt>"
}
```

### Error Responses
* `400 Bad Request` — invalid username or password
* `409 Conflict` — username already exists

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
`200 OK`
```json
{
  "token": "<jwt>"
}
```

### Error Responses
* `401 Unauthorized` — invalid username or password
