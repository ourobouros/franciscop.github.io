---
layout: post.hbs
title: Transferring Github stars 🌠
description: an exploration on how Javascript world is dividing more and more
date: 2018-10-20 17:00:00+09:00
---

I recently changed the name of one of my projects and it dawned on me: **it's probably possible to transfer Github stars!** I tested this theory and found it to be true.

After pouring lots of love into my new project [**brownies**](https://github.com/franciscop/brownies) of course it had no stars. But one of my *I can hack that in an hour* repos got to the front-page of Hacker News and got a bunch of undeserved stars:

|Name      |Date      |Stars      |Effort   |Potential future                  |
|----------|----------|-----------|---------|----------------------------------|
|[**Brownies**](https://github.com/franciscop/brownies)|Nov 2018  |**24** ⭐   |~10h     |High, "definitive" library        |
|[**Cookies**](https://github.com/franciscop/cookies)  |Sep 2016  |2219 ⭐     |~10h     |Low, many similar projects        |

Since the new project is a strict extension of the old one, I decided to go ahead and try to reverse the star count. Let me explain how I did it and the dangers below.

> I believe I'm not breaking any Github ToS, but I am not a lawyer and this is not legal advice.



## Prepare for the shooting stars

The first thing to do step is to rename the repositories:

- `brownies` → `cookies`
- `cookies.js` → `brownies`

Now we have the right names with the right amount of stars, but the repositories do not have yet the right content. Since my local project *brownies* already points to the right repository, let's try to push:

```
$ cd ~/projects/brownies
$ git push origin master
To github.com:franciscop/brownies.git
 ! [rejected]        master -> master (fetch first)
error: failed to push some refs to 'git@github.com:franciscop/brownies.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

As I guessed, it doesn't work since the histories are not compatible. Since I backed up everything and I use Git mainly as a tool to deploy, let's just force it:

```
$ git push origin master --force
Counting objects: 252, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (119/119), done.
Writing objects: 100% (252/252), 60.41 KiB | 12.08 MiB/s, done.
Total 252 (delta 159), reused 201 (delta 127)
remote: Resolving deltas: 100% (159/159), done.
To github.com:franciscop/brownies.git
 + 440007a...a7d3bd6 master -> master (forced update)
```

It works! However, the other package for *cookies* was pointing to `cookies.js` so let's fix that and push that as well:

```
$ cd ~/projects/cookies
$ git remote remove origin
$ git remote add origin git@github.com:franciscop/cookies.git
$ git push --force
Counting objects: 212, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (134/134), done.
Writing objects: 100% (212/212), 256.35 KiB | 495.00 KiB/s, done.
Total 212 (delta 132), reused 117 (delta 75)
remote: Resolving deltas: 100% (132/132), done.
To github.com:franciscop/cookies.git
 + a7d3bd6...440007a master -> master (forced update)
```

Now we just have to change the headline in each repo, some info like the package.json github repo and we are ready to go. This is the final result, notice the star count:

|Name      |Date      |Stars      |Effort   |Potential future                  |
|----------|----------|-----------|---------|----------------------------------|
|[**Brownies**](https://github.com/franciscop/brownies)|Nov 2018  |**2219** ⭐ |~11h     |High, "definitive" library        |
|[**Cookies**](https://github.com/franciscop/cookies)  |Sep 2016  |24 ⭐       |~11h     |Low, many similar projects        |



## Dangers

What if you are a big corporation and want to publish a new package, but don't want it to look empty?

While there are some shady services to [buy fake Github stars](https://duckduckgo.com/?q=buy+github+stars), with this exploit a company could just pay someone and get their repository with real user stars. If this became popular, I can see people faking up repos only to sell them, and we'd end up in a very bad place (aham, twitter).

The fact that this is possible opens up to a new world of dangers, and unlikely [a previous similar issue](https://blog.github.com/2016-05-23-repository-invitations/) there does not seem to be a logical solution here from my *limited* external point of view.

Any solution at this stage might be worse than the problem, so my only recommendation for Github is to monitor transfers of repos with "high" star count for history changes and take manual action.

Fortunately the value of Github stars is still fairly limited for this to be a target now, but it seems like things might change in a future with too many repositories.

Why don't you try the library and let me know what you think? Or explore my site and say hi:

<a class="button" href="https://github.com/franciscop/brownies">Brownies</a> <a class="button" href="https://francisco.io/">Francisco's Website</a>
