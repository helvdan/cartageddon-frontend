// src/components/DataTable.jsx
import React from 'react';
import styles from './DataTable.module.css';

export default function DataTable({ data }) {
  // Заглушка, если данные еще не выбраны
  if (!data) {
    return (
      <div className="table-fallback">
        <p>💡 Выберите файл из списка слева, чтобы просмотреть его содержимое</p>
      </div>
    );
  }

  const { headers = [], rows = [] } = data;

  return (
    <div className={styles.tableScrollContainer}>
      <table className={styles.etlDataTable}>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>
                <div className={styles.headerCellContent}>
                  <span className={styles.etlHeaderName}>{header[0]}</span>
                  <span className={styles.etlDataType}>{header[1]}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
        {rows.length === 0 ? (
          <tr>
          <td colSpan={headers.length || 1} style={{ textAlign: 'center', color: '#64748b' }}>
                Таблица пустая
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {Array.isArray(row)
                  ? row.map((val, cellIdx) => <td key={cellIdx}>{String(val)}</td>)
                  : headers.map((header, cellIdx) => <td key={cellIdx}>{String(row[header] ?? '')}</td>)
                }
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
