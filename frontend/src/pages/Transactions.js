import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { useModals } from '../components/layout/MainLayout';
import MetricCard from '../components/common/MetricCard';
import NoticeBanner from '../components/common/NoticeBanner';
import { formatINR } from '../utils/formatters';
import {
  Search,
  Plus,
  Trash2,
  Download
} from 'lucide-react';

export default function Transactions() {
  const { transactions, deleteTransaction } = useFinancialData();
  const { openAddTransaction } = useModals();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All categories');

  const totalInflow = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const totalOutflow = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const netCashFlow = totalInflow - totalOutflow;

  const categoriesList = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    return ['All categories', ...Array.from(set)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.id && t.id.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'All categories' || t.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  const handleExportCSV = () => {
    const headers = ['ID,Type,Category,Description,Amount,Date,Status\n'];
    const rows = transactions.map((t) =>
      `"${t.id}","${t.type}","${t.category}","${t.description}","${t.amount}","${t.date}","${t.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="transactions-page d-flex flex-column gap-3.5">
      <NoticeBanner message="Demo ledger. Cashflow credits and debits sync with your monthly surplus calculations and category breakdowns." />

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <MetricCard
            title="Total Inflow (Credits)"
            badgeText="Calculated"
            badgeType="calc"
            value={formatINR(totalInflow)}
            valueClass="text-success"
            subtext="Salary, dividends & consulting"
          />
        </div>

        <div className="col-12 col-md-4">
          <MetricCard
            title="Total Outflow (Debits)"
            badgeText="Calculated"
            badgeType="calc"
            value={formatINR(totalOutflow)}
            valueClass="text-danger"
            subtext="Investments, EMIs & expenses"
          />
        </div>

        <div className="col-12 col-md-4">
          <MetricCard
            title="Net Cashflow"
            badgeText="Calculated"
            badgeType="calc"
            value={formatINR(netCashFlow)}
            valueClass={netCashFlow >= 0 ? 'text-success' : 'text-danger'}
            subtext={netCashFlow >= 0 ? 'Positive savings accumulation' : 'Deficit spending alert'}
          />
        </div>
      </div>

      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <h5 className="card-section-title m-0">Transaction History</h5>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-fintech btn-sm d-flex align-items-center gap-1.5"
                onClick={handleExportCSV}
              >
                <Download size={15} />
                <span>Export CSV</span>
              </button>
              <button
                className="btn btn-dark-fintech btn-sm d-flex align-items-center gap-1.5"
                onClick={openAddTransaction}
              >
                <Plus size={16} />
                <span>Add transaction</span>
              </button>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by description, category or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${typeFilter === 'all' ? 'btn-primary-fintech' : 'btn-outline-secondary'}`}
                  onClick={() => setTypeFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${typeFilter === 'credit' ? 'btn-primary-fintech' : 'btn-outline-secondary'}`}
                  onClick={() => setTypeFilter('credit')}
                >
                  Inflow
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${typeFilter === 'debit' ? 'btn-primary-fintech' : 'btn-outline-secondary'}`}
                  onClick={() => setTypeFilter('debit')}
                >
                  Outflow
                </button>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categoriesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive fintech-table-wrapper">
            <table className="table table-hover align-middle fintech-table mb-0">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className="text-end">Amount</th>
                  <th>Status</th>
                  <th className="text-center" style={{ width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const isCredit = t.type === 'credit';
                    return (
                      <tr key={t.id}>
                        <td className="font-numeric text-muted small">{t.id}</td>
                        <td className="small">{t.date}</td>
                        <td>
                          <div className="fw-medium text-dark">{t.description}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border small">
                            {t.category}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${isCredit ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                            {isCredit ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                        <td className={`text-end font-numeric fw-semibold ${isCredit ? 'text-success' : 'text-danger'}`}>
                          {isCredit ? '+' : '-'}{formatINR(t.amount)}
                        </td>
                        <td>
                          <span className="badge-status badge-status-ontrack">
                            {t.status || 'completed'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-action-icon text-danger"
                            title="Delete transaction"
                            onClick={() => deleteTransaction(t.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
