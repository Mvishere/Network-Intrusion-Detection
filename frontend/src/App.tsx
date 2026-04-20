import React, { useState, useEffect } from 'react';
import { Network, Activity, ShieldAlert, ShieldCheck, Database, ServerCrash, BarChart } from 'lucide-react';
import { BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MOCK_DATA = [
  {
    name: "Normal Web Traffic",
    type: "normal",
    data: {
      "duration": 0, "protocol_type": "tcp", "service": "http", "flag": "SF",
      "src_bytes": 215, "dst_bytes": 456, "land": 0, "wrong_fragment": 0, "urgent": 0,
      "hot": 0, "num_failed_logins": 0, "logged_in": 1, "num_compromised": 0,
      "root_shell": 0, "su_attempt": 0, "num_root": 0, "num_file_creations": 0,
      "num_shells": 0, "num_access_files": 0, "is_host_login": 0, "is_guest_login": 0,
      "count": 1, "srv_count": 1, "serror_rate": 0, "srv_serror_rate": 0,
      "rerror_rate": 0, "srv_rerror_rate": 0, "same_srv_rate": 1, "diff_srv_rate": 0,
      "srv_diff_host_rate": 0, "dst_host_count": 100, "dst_host_srv_count": 100,
      "dst_host_same_srv_rate": 1, "dst_host_diff_srv_rate": 0,
      "dst_host_same_src_port_rate": 0.01, "dst_host_srv_diff_host_rate": 0,
      "dst_host_serror_rate": 0, "dst_host_srv_serror_rate": 0,
      "dst_host_rerror_rate": 0, "dst_host_srv_rerror_rate": 0
    }
  },
  {
    name: "Neptune (SYN Flood / DoS)",
    type: "attack",
    data: {
      "duration": 0, "protocol_type": "tcp", "service": "private", "flag": "S0",
      "src_bytes": 0, "dst_bytes": 0, "land": 0, "wrong_fragment": 0, "urgent": 0,
      "hot": 0, "num_failed_logins": 0, "logged_in": 0, "num_compromised": 0,
      "root_shell": 0, "su_attempt": 0, "num_root": 0, "num_file_creations": 0,
      "num_shells": 0, "num_access_files": 0, "is_host_login": 0, "is_guest_login": 0,
      "count": 250, "srv_count": 15, "serror_rate": 1, "srv_serror_rate": 1,
      "rerror_rate": 0, "srv_rerror_rate": 0, "same_srv_rate": 0.06, "diff_srv_rate": 0.06,
      "srv_diff_host_rate": 0, "dst_host_count": 255, "dst_host_srv_count": 15,
      "dst_host_same_srv_rate": 0.06, "dst_host_diff_srv_rate": 0.07,
      "dst_host_same_src_port_rate": 0, "dst_host_srv_diff_host_rate": 0,
      "dst_host_serror_rate": 1, "dst_host_srv_serror_rate": 1,
      "dst_host_rerror_rate": 0, "dst_host_srv_rerror_rate": 0
    }
  },
  {
    name: "Satan (Probe / Port Sweep)",
    type: "attack",
    data: {
      "duration": 0, "protocol_type": "tcp", "service": "private", "flag": "REJ",
      "src_bytes": 0, "dst_bytes": 0, "land": 0, "wrong_fragment": 0, "urgent": 0,
      "hot": 0, "num_failed_logins": 0, "logged_in": 0, "num_compromised": 0,
      "root_shell": 0, "su_attempt": 0, "num_root": 0, "num_file_creations": 0,
      "num_shells": 0, "num_access_files": 0, "is_host_login": 0, "is_guest_login": 0,
      "count": 2, "srv_count": 1, "serror_rate": 0, "srv_serror_rate": 0,
      "rerror_rate": 1, "srv_rerror_rate": 1, "same_srv_rate": 0.5, "diff_srv_rate": 1,
      "srv_diff_host_rate": 0, "dst_host_count": 255, "dst_host_srv_count": 1,
      "dst_host_same_srv_rate": 0, "dst_host_diff_srv_rate": 1,
      "dst_host_same_src_port_rate": 0, "dst_host_srv_diff_host_rate": 0,
      "dst_host_serror_rate": 0, "dst_host_srv_serror_rate": 0,
      "dst_host_rerror_rate": 1, "dst_host_srv_rerror_rate": 1
    }
  },
  {
    name: "Smurf (DoS via ICMP)",
    type: "attack",
    data: {
      "duration": 0, "protocol_type": "icmp", "service": "ecr_i", "flag": "SF",
      "src_bytes": 1032, "dst_bytes": 0, "land": 0, "wrong_fragment": 0, "urgent": 0,
      "hot": 0, "num_failed_logins": 0, "logged_in": 0, "num_compromised": 0,
      "root_shell": 0, "su_attempt": 0, "num_root": 0, "num_file_creations": 0,
      "num_shells": 0, "num_access_files": 0, "is_host_login": 0, "is_guest_login": 0,
      "count": 511, "srv_count": 511, "serror_rate": 0, "srv_serror_rate": 0,
      "rerror_rate": 0, "srv_rerror_rate": 0, "same_srv_rate": 1, "diff_srv_rate": 0,
      "srv_diff_host_rate": 0, "dst_host_count": 255, "dst_host_srv_count": 255,
      "dst_host_same_srv_rate": 1, "dst_host_diff_srv_rate": 0,
      "dst_host_same_src_port_rate": 1, "dst_host_srv_diff_host_rate": 0,
      "dst_host_serror_rate": 0, "dst_host_srv_serror_rate": 0,
      "dst_host_rerror_rate": 0, "dst_host_srv_rerror_rate": 0
    }
  }
];

// We will map over the full 41 features available in the mock data

function App() {
  const [tab, setTab] = useState('predict');
  const [formData, setFormData] = useState(MOCK_DATA[0].data);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetch('/api/insights')
      .then(r => r.json())
      .then(data => setInsights(data))
      .catch(e => console.error("Could not load insights, is backend running?", e));
  }, []);

  const handlePredict = async () => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const resp = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: formData })
      });
      const data = await resp.json();
      setPrediction(data.prediction);
    } catch(e) {
      alert("Error predicting! Is the backend running?");
    }
    setIsLoading(false);
  };

  const loadMock = (mock: any) => {
    setFormData(mock.data);
    setPrediction(null);
  };

  const handleChange = (k: string, val: string) => {
    setFormData(prev => ({ ...prev, [k]: val }));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">
          <Network size={32} color="var(--accent-cyan)" />
          NSL-KDD DeepWatch
        </h1>
        <div className="nav-tabs">
          <button className={`tab-btn ${tab === 'predict' ? 'active' : ''}`} onClick={() => setTab('predict')}>
            <Activity size={18} style={{marginRight:'8px', display:'inline-block', verticalAlign:'middle'}}/>
            Live Inference
          </button>
          <button className={`tab-btn ${tab === 'insights' ? 'active' : ''}`} onClick={() => setTab('insights')}>
            <BarChart size={18} style={{marginRight:'8px', display:'inline-block', verticalAlign:'middle'}}/>
            Model Insights
          </button>
        </div>
      </header>

      {tab === 'predict' && (
        <div className="glass-card animate-slide-up">
          <h2>Inject Mock Traffic Signatures</h2>
          <div className="mock-data-selector">
            {MOCK_DATA.map((mock, idx) => (
              <button 
                key={idx} 
                className={`mock-btn ${mock.type}`}
                onClick={() => loadMock(mock)}
              >
                {mock.type === 'normal' ? <ShieldCheck size={16}/> : <ServerCrash size={16}/>}
                {mock.name}
              </button>
            ))}
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Primary Features (All 41 Columns Editable)</h3>
            <div className="form-grid">
              {Object.keys(MOCK_DATA[0].data).map(col => (
                <div className="input-group" key={col}>
                  <label>{col.replace(/_/g, ' ')}</label>
                  <input 
                    type="text" 
                    value={formData[col as keyof typeof formData]} 
                    onChange={e => handleChange(col, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <button className="predict-btn" onClick={handlePredict} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Run Neural Analysis'}
          </button>

          {prediction && (
            <div className={`result-card ${prediction === 'normal' ? 'result-normal' : 'result-attack'}`}>
              <h2>Detection Result</h2>
              {prediction === 'normal' ? (
                <>
                  <ShieldCheck size={48} />
                  <p className="prediction">Normal Traffic</p>
                  <p>No anomalous patterns detected.</p>
                </>
              ) : (
                <>
                  <ShieldAlert size={48} />
                  <p className="prediction">{prediction}</p>
                  <p>Malicious signature identified. Connection flagged.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'insights' && insights && (
        <div className="dashboard-grid animate-slide-up">
          <div className="glass-card">
            <h2>Top 10 Feature Importances</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={insights.feature_importances} layout="vertical" margin={{ left: 50, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/>
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="Feature" stroke="#94a3b8" width={100} />
                  <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#0f1219', border: '1px solid #ffffff10'}} />
                  <Bar dataKey="Importance" fill="var(--accent-cyan)" radius={[0, 4, 4, 0]} />
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="stats-grid">
             <div className="stat-card">
                <div>
                  <h3 style={{margin:0, color:'var(--text-secondary)'}}>Model Architecture</h3>
                  <p style={{margin:'5px 0 0 0', fontWeight:'bold'}}>{insights.metadata.best_model}</p>
                </div>
                <Database size={32} color="var(--accent-purple)"/>
             </div>
             <div className="stat-card">
                <div>
                  <h3 style={{margin:0, color:'var(--text-secondary)'}}>Feature Set</h3>
                  <p style={{margin:'5px 0 0 0', fontWeight:'bold'}}>{insights.metadata.best_feature_set}</p>
                </div>
                <Activity size={32} color="var(--accent-green)"/>
             </div>
             <div className="stat-card">
                <div>
                  <h3 style={{margin:0, color:'var(--text-secondary)'}}>Total Features Used</h3>
                  <p style={{margin:'5px 0 0 0', fontWeight:'bold'}}>{insights.metadata.top_n_features}</p>
                </div>
                <Network size={32} color="var(--accent-cyan)"/>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
