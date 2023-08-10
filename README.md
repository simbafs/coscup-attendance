<<<<<<< HEAD
# COSCUP Attendance

製播組點人數系統

# TODO

* 驗證
* ~~websocket 即時共編~~完成
* 想想資料存哪，現在是 JSON，有點醜
* 顯示儲存狀態
* CI/CD

# Docker

https://github.com/simbafs/coscup-attendance/pkgs/container/coscup-attendance

# Release Note:
## v0.1.0
正式支援即時共編

## v0.1.1
加入 stage build，縮小 docker image 體積
345MB -> 175MB

## v0.1.15
搞定 CI/CD

## v0.2.0
新增驗證，需要 token 才能進入，以後可能會有 RBAC（？
=======
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
>>>>>>> golang-next/main
