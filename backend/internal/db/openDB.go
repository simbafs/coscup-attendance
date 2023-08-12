package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func OpenDB() error {
	db, err := sql.Open("sqlite", "./data.db")
	if err != nil {
		return err
	}
	DB = db
	return nil
}

func CloseDB() error {
	return DB.Close()
}
