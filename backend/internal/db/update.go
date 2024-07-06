package db

import (
	"fmt"
	"time"
)

type UpdateData struct {
	ID         string `json:"id" binding:"required"`
	Attendance int    `json:"attendance"`
}

func Update(data []UpdateData) error {
	stmt, err := DB.Prepare(`UPDATE attendance SET attendance = ? WHERE id = ?`)
	if err != nil {
		return fmt.Errorf("db.Prepare: %w", err)
	}

	for _, d := range data {
		_, err = stmt.Exec(d.Attendance, d.ID)
		if err != nil {
			return fmt.Errorf("attendance stmt.Exec: %w", err)
		}
	}

	stmt, err = DB.Prepare(`INSERT OR IGNORE INTO updates (time, id, attendance) VALUES (?, ?, ?);`)
	if err != nil {
		return fmt.Errorf("db.Prepare: %w", err)
	}

	for _, d := range data {
		_, err := stmt.Exec(time.Now(), d.ID, d.Attendance)
		if err != nil {
			return fmt.Errorf("upates stmt.Exec: %w", err)
		}
	}

	return nil
}
