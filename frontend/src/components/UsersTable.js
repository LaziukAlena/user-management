import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Form, InputGroup, Row, Col, Alert } from 'react-bootstrap';

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      console.log('Сервер вернул пользователей:', res.data);
      setUsers(res.data); 
      setError(null);
      setSelectedIds([]);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей', err);
      setError('Ошибка при загрузке пользователей');
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const ids = filtered.map((u) => u.id);
    setSelectedIds(selectedIds.length === ids.length ? [] : ids);
  };

  const performAction = async (action) => {
    if (selectedIds.length === 0) return;

    try {
      let url = '';
      if (action === 'block') url = '/api/users/block';
      if (action === 'unblock') url = '/api/users/unblock';
      if (action === 'delete') url = '/api/users/delete';

      await axios.post(url, { ids: selectedIds });
      setInfo(`Успешно выполнено: ${action}`);
      fetchUsers();

      if (action === 'block') {
        const remaining = users.filter((u) => !selectedIds.includes(u.id) && u.status !== 'blocked');
        if (remaining.length === 0) {
          localStorage.removeItem('token');
          window.location.href = '/login?blocked=true';
        }
      }
    } catch (err) {
      console.error('Ошибка при выполнении действия', err);
      setError('Ошибка при выполнении действия');
    }
  };

  const filtered = users.filter((u) => {
    const matchStatus =
      statusFilter === 'all' || u.status === statusFilter;
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <>
      <Row className="mb-3">
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Поиск по имени или email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="blocked">Заблокированные</option>
          </Form.Select>
        </Col>
        <Col md={5} className="text-end">
          <Button
            variant="secondary"
            className="me-2"
            disabled={selectedIds.length === 0}
            onClick={() => performAction('block')}
          >
            Заблокировать
          </Button>
          <Button
            variant="success"
            className="me-2"
            disabled={selectedIds.length === 0}
            onClick={() => performAction('unblock')}
          >
            Разблокировать
          </Button>
          <Button
            variant="danger"
            disabled={selectedIds.length === 0}
            onClick={() => performAction('delete')}
          >
            Удалить
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {info && <Alert variant="success" onClose={() => setInfo(null)} dismissible>{info}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.length === filtered.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>Имя</th>
            <th>Email</th>
            <th>Статус</th>
            <th>Последний вход</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => handleSelect(user.id)}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.status === 'active' ? '🟢 Активный' : '🔴 Заблокирован'}</td>
              <td>{new Date(user.last_login).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default UsersTable;
