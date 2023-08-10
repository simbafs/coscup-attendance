dev: 
	tmux split-window -h make frontend
	make backend

install:
	cd ./frontend/ && pnpm install
	cd ./backend/ && go get
	mkdir -p ./backend/static/ 
	touch ./backend/static/.gitkeep

backend: 
	cd ./backend/ && nodemon -e go --watch './**/*.go' --signal SIGTERM --exec 'go' run .

frontend:
	cd ./frontend/ && npm run dev

build: buildFrontend buildBackend

buildFrontend:
	cd ./frontend/ && npm run build
	rm -rf ./backend/static/
	mv ./frontend/out/ ./backend/static/

buildBackend:
	cd ./backend/ && ./build.sh

clear:
	rm -rf ./main
	rm -rf ./backend/static/
	rm -rf ./frontend/out/ ./frontend/node_modules/ ./frontend/.next/
	mkdir ./backend/static/

.PHONY: backend frontend build buildBackend buildFrontend clear
