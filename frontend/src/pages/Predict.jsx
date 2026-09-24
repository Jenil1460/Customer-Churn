import React, { useState, useEffect } from 'react';
import {
  User,
  CreditCard,
  Wifi,
  DollarSign,
  BrainCircuit,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import FormSegmentedControl from '../components/prediction/FormSegmentedControl';
import ResultCard from '../components/prediction/ResultCard';
import ErrorBanner from '../components/ui/ErrorBanner';
import { getFeatureOptions, predictChurn } from '../services/api';

const Predict = () => {
  const [featureOptions, setFeatureOptions] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    gender: 'Female',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    tenure: 12,
    PhoneService: 'Yes',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'Yes',
    TechSupport: 'No',
    StreamingTV: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 79.5,
    TotalCharges: 954.0,
  });

  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const options = await getFeatureOptions();
        setFeatureOptions(options);
      } catch (err) {
        console.error('Failed to load feature options from API:', err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const validateForm = () => {
    if (formData.tenure < 0) {
      setValidationError('Tenure must be 0 or greater.');
      return false;
    }
    if (formData.MonthlyCharges < 0) {
      setValidationError('Monthly Charges must be $0.00 or greater.');
      return false;
    }
    if (formData.TotalCharges < 0) {
      setValidationError('Total Charges must be $0.00 or greater.');
      return false;
    }
    if (![0, 1].includes(Number(formData.SeniorCitizen))) {
      setValidationError('Senior Citizen must be 0 or 1.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setApiError('');
    setResult(null);

    try {
      const payload = {
        ...formData,
        tenure: Number(formData.tenure),
        SeniorCitizen: Number(formData.SeniorCitizen),
        MonthlyCharges: Number(formData.MonthlyCharges),
        TotalCharges: Number(formData.TotalCharges),
      };

      const data = await predictChurn(payload);
      setResult(data);

      // Smooth scroll to result
      setTimeout(() => {
        const resEl = document.getElementById('prediction-result-section');
        if (resEl) resEl.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Prediction request failed. Ensure backend is running.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = featureOptions?.PaymentMethod || [
    'Electronic check',
    'Mailed check',
    'Bank transfer (automatic)',
    'Credit card (automatic)',
  ];

  const internetServices = featureOptions?.InternetService || ['DSL', 'Fiber optic', 'No'];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Predict Customer Churn
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
          Enter customer information and let the trained ML model estimate churn risk.
        </p>
      </div>

      {apiError && <ErrorBanner message={apiError} />}

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: CUSTOMER PROFILE */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <User size={20} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>1. Customer Profile</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <FormSegmentedControl
              label="Gender"
              options={['Female', 'Male']}
              value={formData.gender}
              onChange={(val) => handleChange('gender', val)}
            />

            <FormSegmentedControl
              label="Senior Citizen"
              options={[
                { label: 'No (0)', value: 0 },
                { label: 'Yes (1)', value: 1 },
              ]}
              value={formData.SeniorCitizen}
              onChange={(val) => handleChange('SeniorCitizen', val)}
            />

            <FormSegmentedControl
              label="Partner"
              options={['No', 'Yes']}
              value={formData.Partner}
              onChange={(val) => handleChange('Partner', val)}
            />

            <FormSegmentedControl
              label="Dependents"
              options={['No', 'Yes']}
              value={formData.Dependents}
              onChange={(val) => handleChange('Dependents', val)}
            />
          </div>
        </div>

        {/* SECTION 2: ACCOUNT INFORMATION */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <DollarSign size={20} style={{ color: 'var(--accent-emerald)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>2. Account Information</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Tenure (Months)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.tenure}
                onChange={(e) => handleChange('tenure', e.target.value)}
                required
              />
              <div className="form-sublabel">How many months the customer has stayed with the company.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Charges ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.MonthlyCharges}
                onChange={(e) => handleChange('MonthlyCharges', e.target.value)}
                required
              />
              <div className="form-sublabel">The amount charged to the customer monthly.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Total Charges ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.TotalCharges}
                onChange={(e) => handleChange('TotalCharges', e.target.value)}
                required
              />
              <div className="form-sublabel">The total amount charged to the customer.</div>
            </div>
          </div>
        </div>

        {/* SECTION 3: SERVICES */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Wifi size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>3. Subscribed Services</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Service</label>
              <select
                className="form-select"
                value={formData.PhoneService}
                onChange={(e) => handleChange('PhoneService', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Internet Service</label>
              <select
                className="form-select"
                value={formData.InternetService}
                onChange={(e) => handleChange('InternetService', e.target.value)}
              >
                {internetServices.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Online Security</label>
              <select
                className="form-select"
                value={formData.OnlineSecurity}
                onChange={(e) => handleChange('OnlineSecurity', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Online Backup</label>
              <select
                className="form-select"
                value={formData.OnlineBackup}
                onChange={(e) => handleChange('OnlineBackup', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tech Support</label>
              <select
                className="form-select"
                value={formData.TechSupport}
                onChange={(e) => handleChange('TechSupport', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Streaming TV</label>
              <select
                className="form-select"
                value={formData.StreamingTV}
                onChange={(e) => handleChange('StreamingTV', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: PAYMENT METHOD */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <CreditCard size={20} style={{ color: 'var(--accent-indigo)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>4. Payment Information</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={formData.PaymentMethod}
              onChange={(e) => handleChange('PaymentMethod', e.target.value)}
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.9rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', width: '100%', maxWidth: '400px' }}>
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Analyzing Churn Risk...
              </>
            ) : (
              <>
                <BrainCircuit size={20} /> Analyze Churn Risk
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Section */}
      {result && (
        <div id="prediction-result-section" style={{ marginTop: '2.5rem', marginBottom: '3rem' }}>
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
};

export default Predict;
