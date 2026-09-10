# User Relation API

## Get Contacts

Returns the authenticated user's contacts.

### Request

```
GET /users/me/contacts
```

### Response

#### `200 OK`

```json
[
  {
    "userId": 12,
    "username": "alice"
  },
  {
    "userId": 37,
    "username": "bob"
  }
]
```

#### `401 Unauthorized`

The request does not contain a valid authenticated session.


## Add Contact

### Request

```
POST /users/me/contacts/{targetId}
```
### Response

#### `204 No Content`

The user was successfully added as a contact, or already existed.

#### `400 Bad Request`

User tried to add self as a contact.

#### `404 Not Found`

The target user does not exist.

#### `409 Conflict`

The authenticated user has blocked the target user.

#### `401 Unauthorized`

The request does not contain a valid authenticated session.


## Remove Contact

Removes another user from the authenticated user's contacts.

### Request

```
DELETE /users/me/contacts/{targetId}
```

### Response

#### `204 No Content`

The contact was removed successfully.

Same behavior when the relationship does not exist, making it idempotent.

#### `401 Unauthorized`

The request does not contain a valid authenticated session.


## Get Blocked Users

Returns users blocked by the authenticated user.

### Request

```
GET /users/me/blocks
```

### Response

#### `200 OK`

```json
[
  {
    "userId": 12,
    "username": "alice"
  }
]
```


#### `401 Unauthorized`

The request does not contain a valid authenticated session.

## Block User

Blocks another user.

Blocking a user also removes the user from the contacts list if exists 

### Request

```
POST /users/me/blocks/{targetId}
```

### Response

#### `204 No Content`

The user was successfully blocked, or was already blocked.

#### `400 Bad Request`

User tried to block self.

#### `404 Not Found`

The target user does not exist.

#### `401 Unauthorized`

The request does not contain a valid authenticated session.


## Unblock User

Removes an existing block.

### Request

```
DELETE /users/me/blocks/{targetId}
```

### Response

#### `204 No Content`

The block was removed successfully, or block didn't exist

#### `401 Unauthorized`

The request does not contain a valid authenticated session.
