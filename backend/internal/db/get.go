package db

import (
	"encoding/csv"
	"fmt"
	"io"
)

type AttendanceData map[string]int

func GetAttendanceData() (AttendanceData, error) {
	rows, err := DB.Query("SELECT * FROM attendance")
	if err != nil {
		return nil, fmt.Errorf("query attendance: %w", err)
	}
	defer rows.Close()

	data := make(AttendanceData)
	for rows.Next() {
		var id string
		var attendance int
		if err := rows.Scan(&id, &attendance); err != nil {
			return nil, fmt.Errorf("scan attendance: %w", err)
		}
		data[id] = attendance
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return data, nil
}

func GetSessionJSON() ([]byte, error) {
	var data []byte
	err := DB.QueryRow(`SELECT text FROM data WHERE name = 'session.json';`).Scan(&data)
	if err != nil {
		return nil, fmt.Errorf("query session: %w", err)
	}
	return data, nil
}

func Export(w io.Writer) error {
	output := csv.NewWriter(w)
	keys := []string{"日期", "教室", "議程id", "社群id", "議程名稱", "人數"}
	if err := output.Write(keys); err != nil {
		return err
	}

	rawData, err := getRawData("", false)
	if err != nil {
		return err
	}
	if rawData == nil {
		return fmt.Errorf("rawData is nil")
	}

	rows, err := DB.Query("SELECT * FROM attendance")
	if err != nil {
		return err
	}
	defer rows.Close()

	data := make(AttendanceData)
	for rows.Next() {
		var id string
		var attendance int
		if err := rows.Scan(&id, &attendance); err != nil {
			return fmt.Errorf("scan attendance: %w", err)
		}
		data[id] = attendance
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("rows error: %w", err)
	}

	result := [][]string{}
	for _, session := range rawData.Sessions {
		result = append(result, []string{
			session.Start.Format("01/02"),
			session.Room,
			session.ID,
			session.Type,
			session.Zh.Title,
			fmt.Sprintf("%d", data[session.ID]),
		})
	}

	if err := output.WriteAll(result); err != nil {
		return err
	}

	return nil
}
