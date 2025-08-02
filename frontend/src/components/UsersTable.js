import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Toast,
  ToastContainer,
} from 'react-bootstrap';

export default function UsersTable({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState('email');
  const [sortOrder, setSortOrder] = useState('asc');
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map((u) => u.id));
    }
  };

  const performBulkAction = async (action) => {
    if (selected.length === 0) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ids: selected }),
      });
      if (!res.ok) throw new Error();
      setToast({ show: true, message: `Успешно: ${action}` });
      setSelected([]);
      fetchUsers();
    } catch (err) {
      setToast({ show: true, message: `Ошибка при ${action}` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Пользователи</h3>
        <Button variant="outline-danger" onClick={onLogout}>
          Выйти
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table bordered hover>
            <thead>
              <tr>
                <th>
                  <Form.Check
                    checked={selected.length === users.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email {sortField === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Статус {sortField === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Form.Check
                      checked={selected.includes(user.id)}
                      onChange={() => handleSelect(user.id)}
                    />
                  </td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex gap-2">
            <Button
              variant="danger"
              onClick={() => performBulkAction('delete')}
              disabled={actionLoading}
            >
              Удалить
            </Button>
            <Button
              variant="warning"
              onClick={() => performBulkAction('block')}
              disabled={actionLoading}
            >
              Заблокировать
            </Button>
            <Button
              variant="success"
              onClick={() => performBulkAction('unblock')}
              disabled={actionLoading}
            >
              Разблокировать
            </Button>
          </div>
        </>
      )}

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}








