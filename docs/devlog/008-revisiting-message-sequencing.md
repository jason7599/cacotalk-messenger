# 008 - Message Sequencing Strategy Revisited

So yeah I changed my mind.

Originally I went with global ids because i decided per-conversation sequencing was wayy too mcuh headache for basically just easier unread count logic.

And also some of the earlier concerns still stand, namely a conversation row being a bottleneck for a hot path.

And yes not to mention much more complexity in message insertions.

So, why?

# Pagination

While implementing pagination. See pagination is probably the biggest reason why I changed my mind.

I mean it's not impossible to do it with global ids... But it's quite nasty. 

And i think this is where the semantic argument becomes more than jsut "this is a pleasant design". 

Like, think about trying to fetch the initial messages page for when a user opens a conversation.

We have to fetch the context before the lastReadMessageId AND all the messages after it, all the while keeping a hard limit on the total query result. 

The query itself isn't much a headache, using 2 subqueries and a union.

But then trying to figure out whether there's more older messages or not, it got tricky.

Not impossible to pull off, but I couldn't help but think all this extra logic shouldn't be here in the first place.

With per-convo seqs, the query can be boiled down to just a simple ass range query.

So it's not just semantics.. It is... just NICE and easy.
