backend: 
	cd ./backend/ && nodemon -e go --watch './**/*.go' --signal SIGTERM --exec 'go' run .

frontend:
	cd ./frontend/ && npm run dev

build: 
	cd ./frontend/ && npm run build
	rm -rf ./backend/static/
	mv ./frontend/out/ ./backend/static/
	cd ./backend/ && go build -o ../main .

.PHONY: backend frontend build
