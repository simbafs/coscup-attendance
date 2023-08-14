dev: 
	tmux split-window -h make frontendDev
	make backendDev

install:
	cd ./frontend/ && pnpm install
	cd ./backend/ && go get
	mkdir -p ./backend/static/ 
	touch ./backend/static/.gitkeep

backendDev: 
	cd ./backend/ && nodemon -e go --watch './**/*.go' --signal SIGTERM --exec 'go' run . --db ../data.db

frontendDev:
	cd ./frontend/ && npm run dev

build: buildFrontend buildBackend

buildFrontend:
	cd ./frontend/ && NODE_ENV=production npm run build
	rm -rf ./backend/static/
	mv ./frontend/out/ ./backend/static/

buildBackend:
	cd ./backend/ && ./build.sh

clear:
	rm -rf ./main
	rm -rf ./backend/static/
	rm -rf ./frontend/out/ ./frontend/node_modules/ ./frontend/.next/
	mkdir ./backend/static/

.PHONY: backendDev frontendDev build buildBackend buildFrontend clear
