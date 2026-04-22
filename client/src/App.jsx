import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:4000/api";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function App() {
  const [dashboard, setDashboard] = useState({ users: [], transactions: [] });
  const [form, setForm] = useState({
    senderId: "usr_1",
    receiverId: "usr_2",
    amount: "75"
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    const data = await response.json();
    setDashboard(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard().catch(() => {
      setStatusMessage("Could not connect to the API. Start the server first.");
      setLoading(false);
    });
  }, []);

  async function submitTransfer(event) {
    event.preventDefault();
    setStatusMessage("Submitting transfer...");

    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setStatusMessage(data.error || "Transfer failed.");
      return;
    }

    const { transaction } = data;
    if (transaction.status === "completed") {
      setStatusMessage("Transfer completed successfully.");
    } else if (transaction.status === "pending") {
      setStatusMessage("Transfer is pending review because of a fraud signal.");
    } else {
      setStatusMessage("Transfer failed.");
    }

    await loadDashboard();
  }

  async function resolveTransaction(transactionId, nextStatus) {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: nextStatus })
    });

    const data = await response.json();
    if (!response.ok) {
      setStatusMessage(data.error || "Could not update transaction.");
      return;
    }

    setStatusMessage(`Transaction ${nextStatus}.`);
    await loadDashboard();
  }

  const pendingTransactions = dashboard.transactions.filter(
    (transaction) => transaction.status === "pending"
  );

  return (
    <div className="page-shell">
      <div className="background-glow glow-left" />
      <div className="background-glow glow-right" />

      <main className="layout">
        <section className="hero-card">
          <p className="eyebrow">Digital Payment Simulator</p>
          <h1>Build and explain the full transaction lifecycle.</h1>
          <p className="hero-copy">
            This mini payment processor shows how transfers move through pending,
            completed, and failed states, with a lightweight fraud review step.
          </p>
          <div className="hero-stats">
            <article>
              <span>Users</span>
              <strong>{dashboard.users.length}</strong>
            </article>
            <article>
              <span>Total Transactions</span>
              <strong>{dashboard.transactions.length}</strong>
            </article>
            <article>
              <span>Pending Review</span>
              <strong>{pendingTransactions.length}</strong>
            </article>
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <h2>Send Money</h2>
            <p className="panel-copy">
              Create a transfer between users and let the backend determine the
              final outcome.
            </p>
            <form className="transfer-form" onSubmit={submitTransfer}>
              <label>
                Sender
                <select
                  value={form.senderId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      senderId: event.target.value
                    }))
                  }
                >
                  {dashboard.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Receiver
                <select
                  value={form.receiverId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      receiverId: event.target.value
                    }))
                  }
                >
                  {dashboard.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Amount
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value
                    }))
                  }
                />
              </label>

              <button type="submit">Submit Transfer</button>
            </form>

            <p className="status-banner">{statusMessage}</p>
          </div>

          <div className="panel">
            <h2>Accounts</h2>
            <div className="user-list">
              {dashboard.users.map((user) => (
                <article className="user-card" key={user.id}>
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                  <strong>{currencyFormatter.format(user.balance)}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid bottom-grid">
          <div className="panel">
            <h2>Fraud Review Queue</h2>
            <div className="review-queue">
              {pendingTransactions.length === 0 ? (
                <p className="empty-state">No flagged transactions waiting right now.</p>
              ) : (
                pendingTransactions.map((transaction) => (
                  <article className="review-card" key={transaction.id}>
                    <div>
                      <strong>{currencyFormatter.format(transaction.amount)}</strong>
                      <p>{transaction.failureReason || "Needs manual review"}</p>
                    </div>
                    <div className="review-actions">
                      <button onClick={() => resolveTransaction(transaction.id, "completed")}>
                        Approve
                      </button>
                      <button
                        className="secondary"
                        onClick={() => resolveTransaction(transaction.id, "failed")}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <h2>Transaction History</h2>
            {loading ? (
              <p className="empty-state">Loading dashboard...</p>
            ) : (
              <div className="transaction-list">
                {dashboard.transactions.map((transaction) => (
                  <article className="transaction-card" key={transaction.id}>
                    <div className="transaction-top">
                      <strong>{currencyFormatter.format(transaction.amount)}</strong>
                      <span className={`pill pill-${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <p>
                      {transaction.senderId} to {transaction.receiverId}
                    </p>
                    <p>{formatDate(transaction.createdAt)}</p>
                    {transaction.fraudFlag ? <p>Fraud flag: Yes</p> : <p>Fraud flag: No</p>}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
