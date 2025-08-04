import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Toast,
  ToastContainer,
  InputGroup,
} from 'react-bootstrap';

export default function UsersTable({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: '' });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: '', variant: '' }), 3000);
  };

  const fetchUsers = () => {
    setLoading(true);
    fetch('https://user-management-production-d5d1.up.railway.app/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 403) {
          showToast('Вы были заблокированы', 'danger');
          setTimeout(() => onLogout(), 1500);
          return;
        }
        if (!res.ok) throw new Error(await res.text() || 'Ошибка загрузки');
        return res.json();
      })
      .then((data) => {
        if (data) {
          const visibleUsers = data.filter((u) => u.status !== 'deleted');
          setUsers(visibleUsers);
          setError(null);
          setSelectedIds([]);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const performAction = async (action) => {
    if (!selectedIds.length) return;
    setActionLoading(true);
    let url = '';
    if (action === 'block') url = '/api/users/block';
    else if (action === 'unblock') url = '/api/users/unblock';
    else if (action === 'delete') url = '/api/users/delete';
    else return;

    try {
      const res = await fetch(`https://user-management-production-d5d1.up.railway.app${url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.status === 403) {
        showToast('Вы были заблокированы', 'danger');
        setTimeout(() => onLogout(), 1500);
        return;
      }

      if (!res.ok) throw new Error(await res.text());

      showToast(`Действие "${action}" выполнено`, 'success');
      fetchUsers();

      if (action === 'block') {
        const allIds = users.map((u) => u.id);
        const blockedAll = selectedIds.length === allIds.length;
        if (blockedAll) {
          showToast('Все пользователи заблокированы. Выход из системы.', 'warning');
          setTimeout(() => onLogout(), 1500);
        }
      }
    } catch (err) {
      showToast(err.message || 'Ошибка', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const blockSelected = () => performAction('block');
  const unblockSelected = () => performAction('unblock');
  const deleteSelected = () => {
    if (window.confirm('Вы действительно хотите удалить выбранных пользователей?')) {
      performAction('delete');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map((u) => u.id));
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((sid) => sid !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const filtered = users
    .filter((u) => {
      const matchStatus =
        statusFilter === 'all' || u.status === statusFilter;
      return (
        matchStatus &&
        (u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()))
      );
    })
    .sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      return sortOrder === 'asc'
        ? valA.localeCompare?.(valB) ?? 0
        : valB.localeCompare?.(valA) ?? 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'active':
        return <span className="text-success"><i className="bi bi-check-circle me-1" />Активен</span>;
      case 'blocked':
        return <span className="text-warning"><i className="bi bi-lock-fill me-1" />Заблокирован</span>;
      default:
        return status;
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h2>Пользователи</h2>
        <Button variant="outline-danger" onClick={onLogout} className="mt-2 mt-md-0">
          <i className="bi bi-box-arrow-right me-1"></i> Выйти
        </Button>
      </div>

      <InputGroup className="mb-3">
        <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
        <Form.Control
          placeholder="Поиск по имени или email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <div className="mb-3">
        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="blocked">Заблокированные</option>
        </Form.Select>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2">
        <Button variant="warning" disabled={!selectedIds.length || actionLoading} onClick={blockSelected}>
          <i className="bi bi-lock-fill me-1"></i> Заблокировать
        </Button>
        <Button variant="success" disabled={!selectedIds.length || actionLoading} onClick={unblockSelected}>
          <i className="bi bi-unlock-fill me-1"></i> Разблокировать
        </Button>
        <Button variant="danger" disabled={!selectedIds.length || actionLoading} onClick={deleteSelected}>
          <i className="bi bi-trash-fill me-1"></i> Удалить
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.length === users.length && users.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
              <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>Имя</th>
              <th onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
              <th onClick={() => toggleSort('status')} style={{ cursor: 'pointer' }}>Статус</th>
              <th onClick={() => toggleSort('last_login')} style={{ cursor: 'pointer' }}>Последний вход</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <Form.Check
                    checked={selectedIds.includes(u.id)}
                    onChange={() => toggleSelectOne(u.id)}
                  />
                </td>
                <td>{u.id}</td>
                <td>{u.name || '—'}</td>
                <td>{u.email}</td>
                <td>{renderStatus(u.status)}</td>
                <td>{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ToastContainer position="bottom-end" className="p-3">
        <Toast show={toast.show} bg={toast.variant} onClose={() => setToast({ show: false })} delay={3000} autohide>
          <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}







