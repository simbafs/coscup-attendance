package db

import (
	"errors"
	"fmt"
)

var ErrInvalidToken = errors.New("invalid token")

func VerifyToken(token string) error {
	// find token in DB token table
	// if token is found, return nil
	// if token is not found, return ErrInvalidToken
	rows, err := DB.Query("SELECT * FROM token WHERE token = ?", token)
	if err != nil {
		return fmt.Errorf("query token: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		return nil
	}

	return ErrInvalidToken
}
