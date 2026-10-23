"""
Risk Assessment Inference Service
Handles ML inference using trained user_risk_model.pkl (ExtraTrees Classifier)
and calibrated Institutional Financial Risk Capacity Score.
"""
import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATHS = [
    os.path.join(BASE_DIR, 'models', 'user_risk_model.pkl'),
    os.path.join(BASE_DIR, '..', 'user_risk_model.pkl'),
    r'c:\Users\Rohan\Desktop\NewNfcs_Dataset\user_risk_model.pkl'
]

loaded_pipeline = None
for path in MODEL_PATHS:
    if os.path.exists(path):
        try:
            loaded_pipeline = joblib.load(path)
            print(f"[RiskService] Loaded ML model successfully from: {path}")
            break
        except Exception as e:
            print(f"[RiskService] Error loading model from {path}: {e}")

TARGET_NAMES = ['Conservative (Low Risk)', 'Moderate (Medium Risk)', 'Aggressive (High Risk)']
ALLOCATION_MAP = {
    'Conservative (Low Risk)': {
        'tier': 'Conservative',
        'risk_level': 'Low',
        'badge_color': 'success',
        'description': 'Priority on capital preservation with minimal volatility exposure.',
        'allocation': [
            {'category': 'Government Bonds & Debt', 'percentage': 60, 'color': '#20c997'},
            {'category': 'Fixed Deposits & Cash', 'percentage': 25, 'color': '#0dcaf0'},
            {'category': 'Large Cap Equities', 'percentage': 15, 'color': '#0d6efd'}
        ]
    },
    'Moderate (Medium Risk)': {
        'tier': 'Moderate',
        'risk_level': 'Medium',
        'badge_color': 'warning',
        'description': 'Balanced approach targeting growth with moderate market risk.',
        'allocation': [
            {'category': 'Diversified Equities (Stocks)', 'percentage': 50, 'color': '#0d6efd'},
            {'category': 'Corporate Debt & Bonds', 'percentage': 35, 'color': '#20c997'},
            {'category': 'Gold & Liquid Cash', 'percentage': 15, 'color': '#ffc107'}
        ]
    },
    'Aggressive (High Risk)': {
        'tier': 'Aggressive',
        'risk_level': 'High',
        'badge_color': 'danger',
        'description': 'High growth orientation with maximum exposure to market opportunities.',
        'allocation': [
            {'category': 'Equity & Mid/Small Cap Stocks', 'percentage': 75, 'color': '#6f42c1'},
            {'category': 'High Yield Corporate Debt', 'percentage': 20, 'color': '#0d6efd'},
            {'category': 'Cash Reserve', 'percentage': 5, 'color': '#0dcaf0'}
        ]
    }
}


def calculate_institutional_risk_score(data):
    """
    Calibrated Institutional Financial Risk Score calculation.
    """
    emergency_savings = float(data.get('emergencySavings', 4))
    emergency_conf = float(data.get('emergencyConfidence', 3))
    stocks_bonds = float(data.get('stocksBonds', 2))
    investment_choice = float(data.get('investmentChoice', 4))
    financial_knowledge = float(data.get('financialKnowledge', 4))
    household_income = float(data.get('householdIncome', 5))
    income_stability = float(data.get('incomeStability', 3))
    spending_vs_income = float(data.get('spendingVsIncome', 2))
    too_much_debt = float(data.get('tooMuchDebt', 3))
    credit_card_late = float(data.get('creditCardLateFee', 1))
    medical_debt = float(data.get('medicalDebt', 1))

    w_safety = (emergency_savings + emergency_conf) / 8.0
    w_experience = (stocks_bonds + investment_choice + financial_knowledge) / 15.0
    w_stability = (household_income + income_stability + spending_vs_income) / 15.0
    w_debt = (too_much_debt + credit_card_late + medical_debt) / 12.0

    risk_capacity_raw = (
        0.30 * w_safety +
        0.25 * w_experience +
        0.25 * w_stability -
        0.20 * w_debt
    )

    # Scale raw score (range roughly 0.0 - 0.7) to 0-100 score
    score = np.clip((risk_capacity_raw + 0.1) / 0.8 * 100.0, 5.0, 95.0)

    if score < 38.0:
        tier_index = 0
    elif score < 68.0:
        tier_index = 1
    else:
        tier_index = 2

    return round(score, 2), tier_index, {
        'Emergency_Safety_Ratio': emergency_savings * emergency_conf,
        'Debt_Severity_Score': too_much_debt + credit_card_late + medical_debt,
        'Knowledge_Exp_Score': financial_knowledge * stocks_bonds,
        'Income_Stability_Score': household_income * income_stability
    }


def predict_user_risk(data):
    """
    Main prediction entry point. Uses ML model if loaded, or calibrated institutional model.
    """
    calculated_score, default_tier_idx, eng_features = calculate_institutional_risk_score(data)
    
    tier_idx = default_tier_idx
    probabilities = [0.1, 0.2, 0.7] # Default placeholder proba
    is_ml_used = False

    if loaded_pipeline and 'classifier' in loaded_pipeline:
        try:
            classifier = loaded_pipeline['classifier']
            feature_names = loaded_pipeline.get('feature_names', [])
            
            # Construct input vector matching feature_names
            raw_input_dict = {
                'Emergency Savings': float(data.get('emergencySavings', 4)),
                '$2,000 Emergency Confidence': float(data.get('emergencyConfidence', 3)),
                'Stocks/Bonds/Mutual Funds': float(data.get('stocksBonds', 2)),
                'Investment Choice': float(data.get('investmentChoice', 4)),
                'Financial Knowledge': float(data.get('financialKnowledge', 4)),
                'Household Income': float(data.get('householdIncome', 5)),
                'Income Stability': float(data.get('incomeStability', 3)),
                'Spending vs Income': float(data.get('spendingVsIncome', 2)),
                'Too Much Debt': float(data.get('tooMuchDebt', 3)),
                'Credit Card Late Fee': float(data.get('creditCardLateFee', 1)),
                'Medical Debt': float(data.get('medicalDebt', 1)),
                **eng_features
            }
            
            feature_vector = [raw_input_dict.get(fn, 0.0) for fn in feature_names]
            X = np.array([feature_vector])
            
            pred = classifier.predict(X)[0]
            tier_idx = int(pred)
            if hasattr(classifier, 'predict_proba'):
                probas = classifier.predict_proba(X)[0]
                probabilities = [round(float(p), 3) for p in probas]
            is_ml_used = True
        except Exception as e:
            print(f"[RiskService] ML Prediction fallback error: {e}")

    tier_name = TARGET_NAMES[tier_idx]
    details = ALLOCATION_MAP[tier_name]

    return {
        'risk_tier': details['tier'],
        'risk_label': tier_name,
        'risk_level': details['risk_level'],
        'risk_score': calculated_score,
        'badge_color': details['badge_color'],
        'description': details['description'],
        'allocations': details['allocation'],
        'confidence_scores': {
            'Conservative': probabilities[0] if len(probabilities) > 0 else 0.1,
            'Moderate': probabilities[1] if len(probabilities) > 1 else 0.3,
            'Aggressive': probabilities[2] if len(probabilities) > 2 else 0.6
        },
        'is_ml_model_active': is_ml_used
    }
