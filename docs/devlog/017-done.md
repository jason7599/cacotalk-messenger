# 017 - Done???

I think it's finished now?? ..

Is it? It feels so weird. Took about a month.

All along the way there were just so many things to do.

Feature after feature, bug fix afer bug fix, and so on.

But now.. I think I'm done.

It feels weird because I don't think I feel thrilled exactly.

Not that I'm not happy with how this turned out, I think it was a great journey with lots of new things learned.

But just weird.

Ok, leaving feelings behind, let's just take a big overview on this whole project.

## The Docs.

I did implement everything I said in the SDD, of course minus the "Possible Later Features".

In fact, if anything, my docs are lagging behind.

I gotta admit at some point I became pretty negligent when it came to keeping the docs up to date.

A bunch of DTO shapes and error flows that I changed aren't reflected in the docs.

Some APIs I didn't even bother writing lol.

I guess this is just what happens when you don't fully flesh the design out properly, before you start implementing stuff.

I would find myself changing the details (like DTO shape and API url etc) all the time because only after writing some code I realized the design needed to change.

And it's funny and sad because that was the exact thing I tried to avoid by writing many docs.

On the other hand the devlogs have been great. It was more like a diary really. It never had to stay true forever, it just had to properly log what I was thinking at the time I made certain decisions.

And I'm glad I left them because I learned the hard way from Cocatalk and pretty much most of my previous projects, that there comes a time where I myself forget the design choices I made.

I would look at the code and think "wait, this is dumb, why is this field in this dto?" and then I'd trace the steps of implementing an alternative design, just to find out that was the exact same thought process old me had.

So yeah. Overall, when it comes to implementation docs, it would've been great if I were experienced and just good enough to come up with robust designs beforehand, but it just didn't happen.

## What more could be done

Well, it's not a great chatting app, nor did I intend it to be. 

It doesn't have image support, online status, typing status, avatars, ... etc.

But honestly, I think this is how it should've been.

I mean literally, this is one of my very few projects that I can actually call finished.

I would've never finished it had I turned overzealous and kept adding feature after feature.

So, I'm happy with it.

Just a bare-bones real-time messenger app, as is what I intended from the start.

## Testing

One clear regret is not having a proper testing system. 

Most tests were just me manual interacting with the FE and validating them manually in the BE.

Which, tbf, I did find a decent amount of bugs that way.

Although I do think my code is pretty robust in terms of ensuring correctness, I can't say for sure because I haven't had it under busy traffic and stress.


# So?

I guess this is it. 

I'll update some docs, and then try to actually distribute it.