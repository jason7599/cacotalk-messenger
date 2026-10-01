# 015 - Message Encryption

I think I'm literally done with the app in terms of functional requirements.

I think all that's left is just tweaking policy stuff... And storing messages as plain text is a horrible idea.

It's funny because I really didn't give it much thought when I first wrote the schema.

The thought of encrypting messages didn't enter my head AT ALL, while correctly storing the user password as a hash. Dumb.

I don't intend to go for anything fancy here. I know some apps go for E2EE, which is awesome, but that's too much for me right now. Maybe a fun project for later.

I'm just gonna settle with application-level encryption; the BE encrypts the raw content from the user's request before storing to the DB, and decrypts on read.

Obviously this won't guard against some malicious dude somehow managing to pull off a successful unauthorized request to the BE.
 
If the app server itself is compromised, it has the key too, so then we're fucked.

But I think it's reasonable enough given there's already application-level security like membership checks, session checks, etc.

So this is pretty much specifically about protecting against somehow getting raw access to the DB itself. Which is the same motivation for hashing passwords, just a different threat (can't hash this, since I obviously actually need the plaintext back).


## AES

AES (Advanced Encryption Standard) is a symmetric cipher, meaning same key encrypts and decrypts. 

Plaintext -> AES + secret key -> encrypted ciphertext\
Ciphertext -> AES + same key -> original plaintext

And it's extremely well-studied and widely used apparently.

It works on fixed 128 bit blocks. .. OK what does that mean

OK so it means it transforms one 16 byte block at a time. So for example 40 bytes of data -> Two 16 byte blocks and one 8 byte block.

So. AES itself is a 16 byte block cipher. 

So this is important;\
AES itself:
- only knows how to deal with exactly 16 bytes at a time
- it does **not** know how to handle arbitrary length messages safely 


### ECB mode

Electronic Codebook mode.

It's like the simplest way to use AES but also pretty vulnerable.

It just splits the data in 16 byte chunks, and encrypt each block independantly.

So the obvious problem is that since AES itself is deterministic, if P1 == P3, C1 == C3.

And everybody knows determinism leaks patterns and ooo scary


# ok

i am so tired after digging into this topic for like 4 hours now

im just gonna accept i dont understand everything about this topic

just gona write very roughly alright

### CTR mode

this introduces an IV (init vector) and a counter system, per data.

so a data(stream, sequence, wahtever) gets a unique IV, and each block in that gets a counter 

IV should be unique across the whole board to be safe

ok.

problem with ctr.

its malleable. so basically if the attacker fucks with the ciphertext, the change will appear on the decrypted plaintext without it loudly failing

ooo scary.

but lets be real if someone got write access to the db i think youre cooked anyway

### GCM

from what i gathered this is like the golden standard

on top of the IV stuff it also has its own auth system, something kinda like a checksum thingy.

so if someone fucks with the ciphertext, it will fail loudly on decrypt.

ok i'm done. this is just so much freagging math and shit i am proeprly overwhelemed

# Verdict

going with ctr

yes, gcm is better 

and i understand why

still not gonna do it tho

do i know why im intentionally going for the inferior design?

i think so but im not sure if i am sure that i know

ive been reading about ivs nonces counters auth tags malleability and all sorts of fucking crypto terminology and i am so done

the actual threat model i care about is simple:

guard against db reads

ctr solves that and thats good enough

i dont give a shit about tampering

if someone got write access to the db brother we have bigger problems.

im done. going with ctr.