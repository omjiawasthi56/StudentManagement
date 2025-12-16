from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
from sqlalchemy import inspect

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow React to connect

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'student_data.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# ==================== DATABASE MODELS ====================

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    roll_no = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    class_name = db.Column(db.String(20), nullable=False)
    contact = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100))
    address = db.Column(db.Text)
    admission_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'roll_no': self.roll_no,
            'name': self.name,
            'class': self.class_name,
            'contact': self.contact,
            'email': self.email,
            'address': self.address,
            'admission_date': self.admission_date.strftime('%Y-%m-%d') if self.admission_date else None
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD format
    status = db.Column(db.String(10), nullable=False)  # Present/Absent/Leave
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'date': self.date,
            'status': self.status
        }

# ==================== CREATE TABLES ====================

with app.app_context():
    db.create_all()
    print("Database tables created successfully!")
    
    # Check available tables
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Available tables in database: {tables}")

# ==================== HOME ROUTE ====================

@app.route('/')
def home():
    return jsonify({
        "message": "Student Management System API",
        "endpoints": {
            "GET /api/students": "Get all students",
            "POST /api/students": "Add new student",
            "GET /api/students/<id>": "Get single student",
            "PUT /api/students/<id>": "Update student",
            "DELETE /api/students/<id>": "Delete student",
            "GET /api/attendance": "Get today's attendance",
            "POST /api/attendance": "Mark attendance",
            "GET /api/attendance/<date>": "Get attendance by date",
            "GET /api/students/<id>/attendance": "Get student attendance summary"
        }
    })

# ==================== STUDENT ROUTES ====================

# GET ALL STUDENTS
@app.route('/api/students', methods=['GET'])
def get_all_students():
    students = Student.query.all()
    return jsonify({
        'success': True,
        'count': len(students),
        'students': [student.to_dict() for student in students]
    })

# ADD NEW STUDENT
@app.route('/api/students', methods=['POST'])
def add_student():
    try:
        data = request.json
        
        # Check if roll number already exists
        existing = Student.query.filter_by(roll_no=data['roll_no']).first()
        if existing:
            return jsonify({'success': False, 'error': 'Roll number already exists'}), 400
        
        # Create new student
        new_student = Student(
            roll_no=data['roll_no'],
            name=data['name'],
            class_name=data['class'],
            contact=data['contact'],
            email=data.get('email', ''),
            address=data.get('address', '')
        )
        
        db.session.add(new_student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student added successfully',
            'student': new_student.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# GET SINGLE STUDENT
@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'success': False, 'error': 'Student not found'}), 404
    
    return jsonify({'success': True, 'student': student.to_dict()})

# UPDATE STUDENT
@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        data = request.json
        
        # Update fields
        student.name = data.get('name', student.name)
        student.class_name = data.get('class', student.class_name)
        student.contact = data.get('contact', student.contact)
        student.email = data.get('email', student.email)
        student.address = data.get('address', student.address)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student updated successfully',
            'student': student.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# DELETE STUDENT
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# SEARCH STUDENTS
@app.route('/api/students/search', methods=['GET'])
def search_students():
    query = request.args.get('q', '')
    
    if not query:
        return jsonify({'success': False, 'error': 'Search query required'}), 400
    
    students = Student.query.filter(
        (Student.name.contains(query)) | 
        (Student.roll_no.contains(query)) |
        (Student.class_name.contains(query))
    ).all()
    
    return jsonify({
        'success': True,
        'count': len(students),
        'students': [student.to_dict() for student in students]
    })

# ==================== ATTENDANCE ROUTES ====================

# GET TODAY'S ATTENDANCE OR POST ATTENDANCE
@app.route('/api/attendance', methods=['GET', 'POST'])
def handle_attendance():
    if request.method == 'GET':
        # Get today's attendance
        today = datetime.now().strftime('%Y-%m-%d')
        attendance = Attendance.query.filter_by(date=today).all()
        
        return jsonify({
            'success': True,
            'date': today,
            'attendance': [a.to_dict() for a in attendance]
        })
    
    elif request.method == 'POST':
        try:
            data = request.json
            date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
            records = data.get('records', [])
            
            # Delete existing attendance for this date
            Attendance.query.filter_by(date=date).delete()
            
            # Add new records
            for record in records:
                attendance = Attendance(
                    student_id=record['student_id'],
                    date=date,
                    status=record['status']
                )
                db.session.add(attendance)
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'Attendance saved for {len(records)} students',
                'date': date
            })
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500

# GET ATTENDANCE BY DATE
@app.route('/api/attendance/<date>', methods=['GET'])
def get_attendance_by_date(date):
    try:
        attendance = Attendance.query.filter_by(date=date).all()
        
        # Get student details
        attendance_list = []
        for record in attendance:
            student = Student.query.get(record.student_id)
            attendance_list.append({
                'id': record.id,
                'student_id': record.student_id,
                'student_name': student.name if student else 'Unknown',
                'student_roll': student.roll_no if student else '',
                'student_class': student.class_name if student else '',
                'date': record.date,
                'status': record.status
            })
        
        return jsonify({
            'success': True,
            'date': date,
            'attendance': attendance_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# GET STUDENT ATTENDANCE SUMMARY
@app.route('/api/students/<int:student_id>/attendance', methods=['GET'])
def get_student_attendance_summary(student_id):
    try:
        # Get last 30 days
        import datetime as dt
        end_date = datetime.now()
        start_date = end_date - dt.timedelta(days=30)
        
        # Generate date range
        dates = []
        current_date = start_date
        while current_date <= end_date:
            dates.append(current_date.strftime('%Y-%m-%d'))
            current_date += dt.timedelta(days=1)
        
        # Get attendance for these dates
        attendance_records = {}
        records = Attendance.query.filter(
            Attendance.student_id == student_id,
            Attendance.date >= start_date.strftime('%Y-%m-%d'),
            Attendance.date <= end_date.strftime('%Y-%m-%d')
        ).all()
        
        for record in records:
            attendance_records[record.date] = record.status
        
        # Prepare response
        summary = []
        for date in dates:
            summary.append({
                'date': date,
                'status': attendance_records.get(date, 'Not Marked')
            })
        
        # Calculate stats
        total_days = len(dates)
        present_days = sum(1 for day in summary if day['status'] == 'Present')
        attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'total_days': total_days,
            'present_days': present_days,
            'attendance_percentage': round(attendance_percentage, 2),
            'summary': summary
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== SAMPLE DATA ====================

def add_sample_data():
    """Add sample students for testing"""
    sample_students = [
        {
            'roll_no': '2024001',
            'name': 'Aarav Sharma',
            'class_name': '12th Science',
            'contact': '9876543210',
            'email': 'aarav@gmail.com',
            'address': 'New Delhi'
        },
        {
            'roll_no': '2024002',
            'name': 'Priya Patel',
            'class_name': '11th Commerce',
            'contact': '9876543211',
            'email': 'priya@gmail.com',
            'address': 'Mumbai'
        },
        {
            'roll_no': '2024003',
            'name': 'Rohan Singh',
            'class_name': '10th',
            'contact': '9876543212',
            'email': 'rohan@gmail.com',
            'address': 'Bangalore'
        }
    ]
    
    added_count = 0
    for student_data in sample_students:
        # Check if student already exists
        existing = Student.query.filter_by(roll_no=student_data['roll_no']).first()
        if not existing:
            student = Student(**student_data)
            db.session.add(student)
            added_count += 1
    
    db.session.commit()
    print(f"Sample data: {added_count} students added")

# ==================== RUN APPLICATION ====================

if __name__ == '__main__':
    print("\n" + "="*60)
    print("STUDENT MANAGEMENT SYSTEM BACKEND")
    print("="*60)
    print(f"Database: {basedir}/student_data.db")
    print("Server: http://localhost:5000")
    
    # Add sample data
    with app.app_context():
        add_sample_data()
    
    print("\n📚 Available API Endpoints:")
    print("  [GET]  /api/students           - Get all students")
    print("  [POST] /api/students           - Add new student")
    print("  [GET]  /api/students/<id>      - Get single student")
    print("  [PUT]  /api/students/<id>      - Update student")
    print("  [DEL]  /api/students/<id>      - Delete student")
    print("  [GET]  /api/attendance         - Get today's attendance")
    print("  [POST] /api/attendance         - Mark attendance")
    print("  [GET]  /api/attendance/<date>  - Get attendance by date")
    print("  [GET]  /api/students/<id>/attendance - Student attendance")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000)

    # ==================== FEES MANAGEMENT ====================

class Fees(db.Model):
    __tablename__ = 'fees'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    month = db.Column(db.String(20), nullable=False)  # e.g., "January 2024"
    total_amount = db.Column(db.Float, nullable=False)
    paid_amount = db.Column(db.Float, default=0)
    due_date = db.Column(db.String(10))  # YYYY-MM-DD
    status = db.Column(db.String(20), default='Pending')  # Paid/Partial/Pending
    payment_date = db.Column(db.String(10))
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'month': self.month,
            'total_amount': self.total_amount,
            'paid_amount': self.paid_amount,
            'due_amount': round(self.total_amount - self.paid_amount, 2),
            'due_date': self.due_date,
            'status': self.status,
            'payment_date': self.payment_date
        }

# Create tables mein fees add karein (update the existing create_tables block)
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")
    
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Available tables in database: {tables}")

# ==================== FEES ROUTES ====================

# GET ALL FEES RECORDS
@app.route('/api/fees', methods=['GET'])
def get_all_fees():
    fees = Fees.query.all()
    return jsonify({
        'success': True,
        'count': len(fees),
        'fees': [fee.to_dict() for fee in fees]
    })

# GET FEES BY STUDENT ID
@app.route('/api/students/<int:student_id>/fees', methods=['GET'])
def get_student_fees(student_id):
    fees = Fees.query.filter_by(student_id=student_id).all()
    
    # Calculate summary
    total_due = 0
    total_paid = 0
    for fee in fees:
        total_paid += fee.paid_amount
        total_due += (fee.total_amount - fee.paid_amount)
    
    return jsonify({
        'success': True,
        'student_id': student_id,
        'total_records': len(fees),
        'total_paid': round(total_paid, 2),
        'total_due': round(total_due, 2),
        'fees': [fee.to_dict() for fee in fees]
    })

# ADD/UPDATE FEES
@app.route('/api/fees', methods=['POST'])
def add_fees():
    try:
        data = request.json
        
        # Check if fees record already exists for this student and month
        existing = Fees.query.filter_by(
            student_id=data['student_id'],
            month=data['month']
        ).first()
        
        if existing:
            # Update existing record
            existing.paid_amount = data.get('paid_amount', existing.paid_amount)
            existing.total_amount = data.get('total_amount', existing.total_amount)
            existing.due_date = data.get('due_date', existing.due_date)
            
            # Update status
            if existing.paid_amount >= existing.total_amount:
                existing.status = 'Paid'
                existing.payment_date = datetime.now().strftime('%Y-%m-%d')
            elif existing.paid_amount > 0:
                existing.status = 'Partial'
            else:
                existing.status = 'Pending'
        else:
            # Create new record
            status = 'Pending'
            payment_date = None
            paid_amount = data.get('paid_amount', 0)
            total_amount = data['total_amount']
            
            if paid_amount >= total_amount:
                status = 'Paid'
                payment_date = datetime.now().strftime('%Y-%m-%d')
            elif paid_amount > 0:
                status = 'Partial'
            
            new_fee = Fees(
                student_id=data['student_id'],
                month=data['month'],
                total_amount=total_amount,
                paid_amount=paid_amount,
                due_date=data.get('due_date'),
                status=status,
                payment_date=payment_date
            )
            db.session.add(new_fee)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fees record saved successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# DELETE FEES RECORD
@app.route('/api/fees/<int:fee_id>', methods=['DELETE'])
def delete_fee(fee_id):
    try:
        fee = Fees.query.get(fee_id)
        if not fee:
            return jsonify({'success': False, 'error': 'Fees record not found'}), 404
        
        db.session.delete(fee)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fees record deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# GET FEES STATISTICS
@app.route('/api/fees/stats', methods=['GET'])
def get_fees_stats():
    try:
        fees = Fees.query.all()
        
        total_fees = sum(f.total_amount for f in fees)
        total_paid = sum(f.paid_amount for f in fees)
        total_due = total_fees - total_paid
        
        # Monthly collection
        monthly_data = {}
        for fee in fees:
            month_year = fee.month
            if month_year not in monthly_data:
                monthly_data[month_year] = {'collected': 0, 'pending': 0}
            monthly_data[month_year]['collected'] += fee.paid_amount
            monthly_data[month_year]['pending'] += (fee.total_amount - fee.paid_amount)
        
        # Status count
        status_count = {
            'paid': sum(1 for f in fees if f.status == 'Paid'),
            'partial': sum(1 for f in fees if f.status == 'Partial'),
            'pending': sum(1 for f in fees if f.status == 'Pending')
        }
        
        return jsonify({
            'success': True,
            'stats': {
                'total_fees': round(total_fees, 2),
                'total_paid': round(total_paid, 2),
                'total_due': round(total_due, 2),
                'collection_rate': round((total_paid / total_fees * 100), 2) if total_fees > 0 else 0,
                'monthly_data': monthly_data,
                'status_count': status_count
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500