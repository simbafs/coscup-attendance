# COSCUP Attendance

製播組點人數系統  

這個分支是要把後端抽出來用 golang 重寫，nextjs 只使用 SSG 的功能，詳情請見 https://github.com/simbafs/go-next-monorepo  

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
