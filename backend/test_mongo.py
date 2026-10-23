"""
Verification script for MongoDB Atlas questionnaire data integration.
Tests ping, insertion of sample questionnaire response, and retrieval.
"""
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from mongo_config import test_connection, save_questionnaire_record, get_questionnaire_records

def main():
    print("=== Step 1: Testing MongoDB Atlas Connection ===")
    ok, msg = test_connection()
    print(f"Connection Status: {ok}")
    print(f"Message: {msg}\n")
    
    if not ok:
        print("ERROR: Connection failed. Aborting test.")
        sys.exit(1)

    print("=== Step 2: Testing Questionnaire Data Insertion ===")
    sample_user = {
        'email': 'rohantarange05@test.com',
        'name': 'Rohan Tarange',
        'user_id': 'USR_TEST_001'
    }
    
    sample_answers = {
        'age': '26–35',
        'occupation': 'Salaried',
        'financialSituation': 'I save regularly.',
        'emergencyFund': '3–6 months',
        'monthlySavingsRate': '20–40%',
        'loansStatus': 'No',
        'incomeLossRunway': 'More than 6 months',
        'investmentExperience': 'Mutual Funds',
        'investmentKnowledge': 'Intermediate',
        'preInvestingHabit': 'Compare multiple sources',
        'marketReaction': 'Buy More',
        'investmentHorizon': '3–5 years',
        'riskStatement': 'I prefer balanced growth.',
        'moneyUsageTimeline': '3–7 years',
        'interestedAssets': ['Mutual Funds', 'Stocks', 'ETFs'],
        'monthlyInvestmentAmount': '₹10k–₹25k',
        'importantFactor': 'Returns',
        'portfolioReviewFrequency': 'Monthly',
        'recommendationTypes': ['Complete Portfolio', 'Goal-Based Investment']
    }
    
    sample_model_input = {
        'emergencySavings': 5,
        'emergencyConfidence': 4,
        'stocksBonds': 2,
        'investmentChoice': 4,
        'financialKnowledge': 4,
        'householdIncome': 6,
        'incomeStability': 3,
        'spendingVsIncome': 2,
        'tooMuchDebt': 1,
        'creditCardLateFee': 1,
        'medicalDebt': 1
    }
    
    sample_risk_output = {
        'risk_tier': 'Moderate',
        'risk_label': 'Moderate (Medium Risk)',
        'risk_score': 62.5
    }
    
    save_res = save_questionnaire_record(
        user_info=sample_user,
        questionnaire_answers=sample_answers,
        model_input=sample_model_input,
        risk_assessment_output=sample_risk_output
    )
    print(f"Save Result: {save_res}\n")

    print("=== Step 3: Retrieving Inserted Document from MongoDB ===")
    records = get_questionnaire_records(email='rohantarange05@test.com')
    print(f"Retrieved Records Count: {len(records)}")
    if records:
        rec = records[0]
        print(f"User Email: {rec.get('email')}")
        print(f"User Name: {rec.get('user_name')}")
        print(f"Questionnaire Answers Count: {len(rec.get('questionnaire_answers', {}))}")
        print(f"Risk Assessment Output: {rec.get('risk_assessment_output')}")
        print(f"Updated At: {rec.get('updated_at')}")
        print("\nSUCCESS: Questionnaire data verified in MongoDB Atlas!")
    else:
        print("ERROR: No records retrieved!")
        sys.exit(1)

if __name__ == '__main__':
    main()
