class Payment {
  final int id;
  final double amount;
  final String currency;
  final String status;
  final String? purpose;
  final int? referenceId;
  final String? projectTitle;
  final DateTime createdAt;
  // Freelancer wallet transaction fields
  final String? type; // 'credit' or 'debit'
  final String? note;
  // Additional fields
  final String? method;

  Payment({
    required this.id,
    required this.amount,
    this.currency = 'JOD',
    required this.status,
    this.purpose,
    this.referenceId,
    this.projectTitle,
    required this.createdAt,
    this.type,
    this.note,
    this.method,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    DateTime parseDateTime(dynamic value) {
      if (value is String) {
        try {
          return DateTime.parse(value);
        } catch (e) {
          return DateTime.now();
        }
      }
      if (value is int) {
        return DateTime.fromMillisecondsSinceEpoch(value * 1000);
      }
      return DateTime.now();
    }

    double parseDouble(dynamic value) {
      if (value is double) return value;
      if (value is int) return value.toDouble();
      if (value is String) {
        final parsed = double.tryParse(value);
        return parsed ?? 0.0;
      }
      return 0.0;
    }

    return Payment(
      id: json['id'] as int? ?? 0,
      amount: parseDouble(json['amount']),
      currency: json['currency'] as String? ?? 'JOD',
      status: json['status'] as String? ?? 'pending',
      purpose: json['purpose'] as String?,
      referenceId: json['reference_id'] as int?,
      projectTitle: json['project_title'] as String?,
      createdAt: parseDateTime(json['created_at']),
      type: json['type'] as String?,
      note: json['note'] as String?,
      method: json['method'] as String?,
    );
  }
}
