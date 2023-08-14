package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func OpenDB(path string) error {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return err
	}
	DB = db
	return nil
}

func CloseDB() error {
	return DB.Close()
}
