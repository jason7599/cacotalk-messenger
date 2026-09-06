# 007 - Why I Still Went With Sessions Because JWTs Started Pissing Me Off

Alright

I have now spent an unreasonable amount of time mulling over this shit

and I am still going with sessions.

## THE BIG SEXY JWT THING: STATELESSNESS

The main **supposed** benefit is:
```
request comes in
→ verify JWT signature
→ read user_id
→ no session lookup
```

BRO I still have a database. My backend is not gonna receive user_id = 17 and then simply dance into business logic.

So congratulations, sessions save me a whole WHOPPING ONE AUTH LOOKUP

### Refresh Tokens make it even worse

If i want to do refresh tokens properly robust, i start hearing:
```
rotation
hashing
reuse detection
token families
revocation table
stolen token detection
```

HELLO????? I THOUGHT WE WERE STATELESS

# let's just get over this please

i'm going with sessions

i will mention i concede on that jwts work nicely with msa or massly distributed architecture. multiple workers being able to decode data on the spot and not having to look up one centralized table

i felt bad about not mentioning that in my rants so here you go

but 

that kinda helps my case if anything tbh

because my app is a monolith  design

also i'm sure the session table can be scaled well if need be

ok i'm done

no more octopus for today