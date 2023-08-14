npm=pnpm

dev: 
	tmux split-window -h make frontendDev
	make backendDev

install: installBackend installFrontend

installBackend:
	cd ./backend/ && go get
	mkdir -p ./backend/static/ 
	touch ./backend/static/.gitkeep

installFrontend:
	cd ./frontend/ && $(npm) install

backendDev: 
	cd ./backend/ && nodemon -e go --watch './**/*.go' --signal SIGTERM --exec 'go' run . --db ../data.db

frontendDev:
	cd ./frontend/ && $(npm) run dev

build: buildFrontend buildBackend

buildFrontend:
	cd ./frontend/ && NODE_ENV=production $(npm) run build

buildBackend:
	rm -rf ./backend/static/
	mv ./frontend/out/ ./backend/static/
	cd ./backend/ && ./build.sh

clear:
	rm -rf ./main
	rm -rf ./backend/static/
	rm -rf ./frontend/out/ ./frontend/node_modules/ ./frontend/.next/
	mkdir ./backend/static/

.PHONY: backendDev frontendDev build buildBackend buildFrontend clear install installFrontend installBackend
