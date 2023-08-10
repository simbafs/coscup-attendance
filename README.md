# go-next-monorepo

Use golang as backend, nextjs SSG for frontend, both in a monorepo. Build all file including static frontend into a single executable file

# frontend

**Notice** For SSG, do not use next api route

-   nextjs
-   ts
-   eslint
-   tailwindcss

# backend

-   gin
-   go embed

# Usage

```
$ make backend # start backend dev server(hotreload with nodemon, you need install in global)
$ make frontend # start frontend dev server
$ make build # build frontend, embed into backend server and build into a single executable file
```

# TODO

-   add Action to build automatically
-   docker image ?
