import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import ModelEvaluation from './pages/ModelEvaluation';
import OverfittingAnalysis from './pages/OverfittingAnalysis';
import CrossValidation from './pages/CrossValidation';
import ModelComparison from './pages/ModelComparison';
import HyperparameterTuning from './pages/HyperparameterTuning';
import AdvancedModels from './pages/AdvancedModels';
import Dataset from './pages/Dataset';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/model-evaluation" element={<ModelEvaluation />} />
          <Route path="/overfitting" element={<OverfittingAnalysis />} />
          <Route path="/cross-validation" element={<CrossValidation />} />
          <Route path="/model-comparison" element={<ModelComparison />} />
          <Route path="/hyperparameter-tuning" element={<HyperparameterTuning />} />
          <Route path="/advanced-models" element={<AdvancedModels />} />
          <Route path="/dataset" element={<Dataset />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
