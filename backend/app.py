"""
Flask API server for FinWise AI Risk Predictions and Stock Analysis.
Stores questionnaire data into MongoDB Atlas.
"""
import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from risk_service import predict_user_risk
except ImportError:
    from backend.risk_service import predict_user_risk

try:
    from mongo_config import (
        save_questionnaire_record,
        get_questionnaire_records,
        test_connection as test_mongo_connection
    )
except ImportError:
    from backend.mongo_config import (
        save_questionnaire_record,
        get_questionnaire_records,
        test_connection as test_mongo_connection
    )

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access


@app.route('/api/risk/assess', methods=['POST'])
def assess_risk():
    try:
        data = request.json or {}
        
        # Extract user & questionnaire fields if present
        user_info = data.get('userInfo', {
            'email': data.get('email'),
            'name': data.get('name'),
            'user_id': data.get('user_id')
        })
        questionnaire_answers = data.get('questionnaire', data)
        model_input = data.get('modelInput', data)
        
        # Run ML risk prediction
        result = predict_user_risk(model_input)
        
        # Persist questionnaire data & assessment result to MongoDB
        mongo_save_status = None
        if user_info.get('email') or questionnaire_answers:
            mongo_save_status = save_questionnaire_record(
                user_info=user_info,
                questionnaire_answers=questionnaire_answers,
                model_input=model_input,
                risk_assessment_output=result
            )

        return jsonify({
            'success': True,
            'data': result,
            'mongo_status': mongo_save_status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to assess financial risk: {str(e)}'
        }), 500


@app.route('/api/questionnaire', methods=['POST'])
def save_questionnaire():
    """Explicit endpoint to store questionnaire data into MongoDB."""
    try:
        payload = request.json or {}
        user_info = payload.get('userInfo', {
            'email': payload.get('email'),
            'name': payload.get('name'),
            'user_id': payload.get('user_id')
        })
        questionnaire_answers = payload.get('questionnaire', payload.get('answers', {}))
        model_input = payload.get('modelInput', {})
        risk_output = payload.get('riskModelOutput', {})

        if not user_info.get('email') and not user_info.get('name'):
            return jsonify({'success': False, 'message': 'User info (email or name) is required.'}), 400

        result = save_questionnaire_record(
            user_info=user_info,
            questionnaire_answers=questionnaire_answers,
            model_input=model_input,
            risk_assessment_output=risk_output
        )

        return jsonify({
            'success': True,
            'message': 'Questionnaire data saved to MongoDB successfully.',
            'result': result
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to save questionnaire: {str(e)}'}), 500


@app.route('/api/questionnaire', methods=['GET'])
def get_questionnaires():
    """Retrieve questionnaire data from MongoDB."""
    try:
        email = request.args.get('email')
        records = get_questionnaire_records(email=email)
        return jsonify({
            'success': True,
            'count': len(records),
            'data': records
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to retrieve questionnaires: {str(e)}'}), 500


# Path to the predictions file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREDICTIONS_PATH = os.path.join(BASE_DIR, 'data', 'predictions.json')


@app.route('/api/stocks/predictions', methods=['GET'])
def get_predictions():
    if not os.path.exists(PREDICTIONS_PATH):
        return jsonify({
            'success': False,
            'message': 'predictions.json not found. Please run generate_predictions.py first.'
        }), 404

    try:
        with open(PREDICTIONS_PATH, 'r', encoding='utf-8') as f:
            predictions = json.load(f)

        return jsonify({
            'success': True,
            'data': predictions
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to read predictions: {str(e)}'
        }), 500


@app.route('/api/health', methods=['GET'])
def health():
    mongo_ok, mongo_msg = test_mongo_connection()
    return jsonify({
        'success': True,
        'status': 'ok',
        'mongodb': {
            'connected': mongo_ok,
            'message': mongo_msg
        }
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
