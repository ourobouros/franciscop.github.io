---
layout: post.hbs
title: A Javascript of two worlds
description: an exploration on how Javascript world is dividing more and more
date: 2018-09-27 23:00:00+09:00
---

I was quietly going on my things when the thought invaded me. It is *so nice* to write and publish small Javascript libraries in 2018. Or to explore other developer's amazing tools like [Sindre Sorhus'](https://github.com/sindresorhus/).

But it's also a very nice concept that I can pick up fully working environments to start a large application from scratch. With hundreds of tutorials about how to use them.

However, and this is what this whole article is about, these are two fairly separated, well defined narratives. I believe they are growing further apart, making new developers very confused.



## The forces at play

My take of how we got here is that there are **two forces** pushing and enriching Javascript world:

- **Makers**: hundreds of efficient packagers that build things at a rate that many consider impossible. Highly motivated, there are many individuals that contribute to Javascript. These are the crafters, the developers that make small and well-rounded utilities.
- **Companies**: dozens of large companies make large tools to improve their workflow, deployments, etc. They initially came from the holes that the initial makers left, but now they change the way you even think about building applications.

> SMB and startups normally (but not always!) are too busy trying to make money and survive to be able to dedicate large resources for OSS.

The main problem is that these two forces have wildly divergent motivations and goals, so the things they want or even expect from Javascript ecosystem varies a lot. But don't forget:

- **Hype train**: Hacker News, Reddit, Blog posts (like this one), etc. You could probably find a softer name, but for me this is a great equalizer since everyone can get exposure.

This is important because it makes small and large projects appear at the same level. A hacky, 3-hour project might get side by side with a mature, 1000-hour project.



### Companies goals

Large companies like Facebook, Google, etc have very measurable primary goals when building software, normally marked by the economy:

- **Stability:** since every error means from lost sales to lost customers, the code should be highly resilient. It must also support as many environments as possible and be well tested.
- **Scalability:** there are several developers working on any given feature at once. This implies that both the people and the software must be able to grow and not overlap with each other.
- **Hype:** being able to make the top of your class software is probably a very good strategy for hiring great developers. Adoption also helps with stability.
- **Security:** A hole on any of these companies might mean millions are lost. The companies might need to review every dependency and license before using a library.

While there are many more goals, I think these are the ones that are vastly more important for large companies than for individual makers.



### Makers goals

Individual makers are normally more concern about using the tool than the tool itself, so understandably these are common goals:

- **Small:** being individuals, the scope and complexity is fairly limited. Those rare larger tools become either the main focus or unmaintained at some point.
- **Low overhead:** a single developer does not have time for expensive maintenance, testing, building, etc. Specially when the tools are the means to an end.
- **Experimental:** many tools will come for the sake of trying a technology or while learning a new concept but stay there. That's cool, next one will be better.
- **Unsupported:** issues pile up and there's nothing you can do about it. The main target of the code is yourself. While you try to help others it's not your responsibility as explained with the MIT.




## Divergence

**Github going down** or the whole **leftpad** ordeal is a catastrophe for a large corporation where hundreds of developer hours might get wasted. For a maker? Take a cup of tea, work on some long-needed docs, continue reading a book or have a stroll on the beach. It's not a big deal.

Suddenly **the back button stops working**? Add a library that introduces more subtle bugs or reinvent the whole back button manually. There's no time for either from a maker perspective.

The **node_modules size** is ridiculous for compliance and it gets specially bad when installing several large tools. But well-picked crafted tools will save hundreds of hours for the makers.

Every time someone complains about Javascript, they are on one side looking at the other. I have very rarely seen a complain about modern Javascript that *really* takes into account these two sides. Javascript is not only enterprise software, but it is also not only hand-crafted sites. It is **both**.



## Reconciliation

So how can these two worlds get closer together? How can large companies help proactive makers to make better software, and how can makers help companies make more approachable software?

I don't even know if these are the right questions to be asking. But I will keep asking it, since it is important when considering what you want to do and Javascript's future. Please let me know your opinion on Hacker News:
