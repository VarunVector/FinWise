import React from 'react';
import { Navigate } from 'react-router-dom';

// Deprecated standalone page - Risk model assessment now runs directly from the Onboarding Questionnaire and renders on the Dashboard.
const RiskAssessment = () => {
    return <Navigate to="/dashboard" replace />;
};

export default RiskAssessment;
