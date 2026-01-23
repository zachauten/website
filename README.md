# Intro

This is the webpage for Triangle DSA (TDSA). It hosts information about what we believe (our program), what we're working on (our campaigns), a blog (Left Angles), future events, information about endorsed candidates and elected officials, and how people can get involved.

These requirements are pretty standard for a typical marketing page, and many tools and frameworks exist to build sites like this (static site generators or SSGs). Because TDSA is a volunteer organization with limited capacity, we wanted to build the site with widely available tools that don't require much expertise, and ideally don't cost much money either.

The tools and frameworks used to build this site are:

- [Astro](https://astro.build/), a React framework, to build the site. It's free and open source, [widely used](https://jamstack.org/generators/), and supports deploying to mulitple platform.
- Deploying to [Cloudflare Pages](https://pages.cloudflare.com/) because they have a generous free tier compared to other hosting, and a lot of features.

## Building the site

1. Clone the site: `git clone https://github.com/Triangle-DSA/website.git` or if [Github CLI](https://cli.github.com/) is installed, `gh repo clone Triangle-DSA/website`.
2. Install the [latest LTS version of Node.js](https://nodejs.org/en/download).
3. Install dependencies: `npm ci`.
4. Add the following values to a `.env` file in the root of the project:

```
PUBLIC_ICAL_FEED_URL="https://calendar.google.com/calendar/ical/c_c71b594a9687eb9a79c1af99198955bca0151c427145cfea73cb702c44660ddd%40group.calendar.google.com/public/basic.ics"
PUBLIC_SANITY_PROJECT_ID="v868rpdv"
PUBLIC_SANITY_DATASET="dev"
NODE_ENV="dev"
```

5. Run `npm run dev` to build and start the project.

## CMS

We're using Sanity as the [content management system](https://www.sanity.io/). The dashboard runs locally as an Astro plugin, at the `/admin` endpoint.
