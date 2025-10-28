from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/process', methods=['POST'])
@jwt_required()
def process_payment():
    try:
        data = request.get_json()
        
        # Simulate payment processing
        return jsonify({
            'success': True,
            'message': 'Payment processed successfully',
            'transaction_id': f"TXN{123456789}",
            'amount': data.get('amount', 0)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500