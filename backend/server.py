
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection function
def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'production_manager')
        )
        print("MySQL Database connection successful")
    except Error as e:
        print(f"Error: '{e}'")
    return connection

# Initialize database
def init_db():
    connection = create_connection()
    if connection:
        cursor = connection.cursor()
        
        # Create products table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL,
            estimated_cost DECIMAL(10, 2) NOT NULL,
            status VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Create materials table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS materials (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            quantity INT NOT NULL,
            unit VARCHAR(50) NOT NULL,
            supplier VARCHAR(255) NOT NULL
        )
        """)
        
        # Create product_materials junction table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS product_materials (
            product_id VARCHAR(36),
            material_id VARCHAR(36),
            PRIMARY KEY (product_id, material_id),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
        )
        """)
        
        # Create logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS production_logs (
            id VARCHAR(36) PRIMARY KEY,
            product_id VARCHAR(36),
            product_name VARCHAR(255) NOT NULL,
            action VARCHAR(255) NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        )
        """)
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("Database initialized successfully")

# Initialize database on startup
init_db()

# Products API Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    connection = create_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
        SELECT p.*, GROUP_CONCAT(pm.material_id) as materials
        FROM products p
        LEFT JOIN product_materials pm ON p.id = pm.product_id
        GROUP BY p.id
        """)
        products = cursor.fetchall()
        
        # Convert materials from string to list
        for product in products:
            materials_str = product.get('materials')
            product['materials'] = materials_str.split(',') if materials_str else []
            
        cursor.close()
        connection.close()
        return jsonify(products)
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    connection = create_connection()
    
    if connection:
        cursor = connection.cursor()
        try:
            # Insert product
            cursor.execute("""
            INSERT INTO products (id, name, type, estimated_cost, status, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            """, (
                data['id'],
                data['name'],
                data['type'],
                data['estimatedCost'],
                data['status']
            ))
            
            # Insert product-material relationships
            if data.get('materials'):
                for material_id in data['materials']:
                    cursor.execute("""
                    INSERT INTO product_materials (product_id, material_id)
                    VALUES (%s, %s)
                    """, (data['id'], material_id))
            
            # Add log entry
            cursor.execute("""
            INSERT INTO production_logs (id, product_id, product_name, action)
            VALUES (%s, %s, %s, %s)
            """, (
                f"l{data['id'][1:]}",  # Generate log ID
                data['id'],
                data['name'],
                "Product created"
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({"message": "Product added successfully"}), 201
        except Error as e:
            connection.rollback()
            cursor.close()
            connection.close()
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/products/<id>', methods=['PUT'])
def update_product(id):
    data = request.json
    connection = create_connection()
    
    if connection:
        cursor = connection.cursor()
        try:
            update_fields = []
            update_values = []
            
            for key, value in data.items():
                if key in ['name', 'type', 'status']:
                    update_fields.append(f"{key} = %s")
                    update_values.append(value)
                elif key == 'estimatedCost':
                    update_fields.append("estimated_cost = %s")
                    update_values.append(value)
            
            if update_fields:
                # Update product details
                query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, update_values + [id])
                
                # Handle materials if present
                if 'materials' in data:
                    # Remove existing relationships
                    cursor.execute("DELETE FROM product_materials WHERE product_id = %s", (id,))
                    
                    # Add new relationships
                    for material_id in data['materials']:
                        cursor.execute("""
                        INSERT INTO product_materials (product_id, material_id)
                        VALUES (%s, %s)
                        """, (id, material_id))
                
                # Add log entry
                cursor.execute("""
                INSERT INTO production_logs (id, product_id, product_name, action)
                VALUES (%s, %s, %s, %s)
                """, (
                    f"l{id[1:]}_update_{int(time.time())}",  # Generate unique log ID
                    id,
                    data.get('name', 'Unknown product'),
                    "Product updated"
                ))
                
                connection.commit()
                cursor.close()
                connection.close()
                
                return jsonify({"message": "Product updated successfully"})
            
            return jsonify({"message": "No fields to update"})
            
        except Error as e:
            connection.rollback()
            cursor.close()
            connection.close()
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/products/<id>', methods=['DELETE'])
def delete_product(id):
    connection = create_connection()
    
    if connection:
        cursor = connection.cursor()
        try:
            # Get product name for log
            cursor.execute("SELECT name FROM products WHERE id = %s", (id,))
            product = cursor.fetchone()
            product_name = product[0] if product else "Unknown product"
            
            # Delete product (cascade will handle relationships)
            cursor.execute("DELETE FROM products WHERE id = %s", (id,))
            
            # Add log entry
            cursor.execute("""
            INSERT INTO production_logs (id, product_id, product_name, action)
            VALUES (%s, %s, %s, %s)
            """, (
                f"l{id[1:]}_delete_{int(time.time())}",  # Generate unique log ID
                None,  # product_id is now NULL since product is deleted
                product_name,
                f"Product '{product_name}' deleted"
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({"message": "Product deleted successfully"})
            
        except Error as e:
            connection.rollback()
            cursor.close()
            connection.close()
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Database connection failed"}), 500

# Materials API Routes
@app.route('/api/materials', methods=['GET'])
def get_materials():
    connection = create_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM materials")
        materials = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(materials)
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/materials', methods=['POST'])
def add_material():
    data = request.json
    connection = create_connection()
    
    if connection:
        cursor = connection.cursor()
        try:
            cursor.execute("""
            INSERT INTO materials (id, name, quantity, unit, supplier)
            VALUES (%s, %s, %s, %s, %s)
            """, (
                data['id'],
                data['name'],
                data['quantity'],
                data['unit'],
                data['supplier']
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({"message": "Material added successfully"}), 201
        except Error as e:
            connection.rollback()
            cursor.close()
            connection.close()
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/materials/<id>', methods=['PUT'])
def update_material(id):
    data = request.json
    connection = create_connection()
    
    if connection:
        cursor = connection.cursor()
        try:
            update_fields = []
            update_values = []
            
            for key, value in data.items():
                if key in ['name', 'quantity', 'unit', 'supplier']:
                    update_fields.append(f"{key} = %s")
                    update_values.append(value)
            
            if update_fields:
                query = f"UPDATE materials SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, update_values + [id])
                
                connection.commit()
                cursor.close()
                connection.close()
                
                return jsonify({"message": "Material updated successfully"})
            
            return jsonify({"message": "No fields to update"})
            
        except Error as e:
            connection.rollback()
            cursor.close()
            connection.close()
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/materials/<id>', methods=['DELETE'])
def delete_material(id):
    connection = create_connection()
    
    if connection:
        cursor = connection.cursor()
        try:
            # Delete material
            cursor.execute("DELETE FROM materials WHERE id = %s", (id,))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({"message": "Material deleted successfully"})
            
        except Error as e:
            connection.rollback()
            cursor.close()
            connection.close()
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Database connection failed"}), 500

# Production Logs API Routes
@app.route('/api/logs', methods=['GET'])
def get_logs():
    connection = create_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM production_logs ORDER BY timestamp DESC")
        logs = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(logs)
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reports/<type>', methods=['GET'])
def get_report(type):
    if type not in ['products', 'materials', 'logs']:
        return jsonify({"error": "Invalid report type"}), 400
        
    connection = create_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        
        if type == 'products':
            cursor.execute("""
            SELECT p.*, GROUP_CONCAT(m.name) as material_names
            FROM products p
            LEFT JOIN product_materials pm ON p.id = pm.product_id
            LEFT JOIN materials m ON pm.material_id = m.id
            GROUP BY p.id
            """)
        elif type == 'materials':
            cursor.execute("SELECT * FROM materials")
        elif type == 'logs':
            cursor.execute("SELECT * FROM production_logs ORDER BY timestamp DESC")
            
        data = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(data)
        
    return jsonify({"error": "Database connection failed"}), 500

# Database Settings API Routes
@app.route('/api/db-settings', methods=['GET'])
def get_db_settings():
    return jsonify({
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'database': os.getenv('DB_NAME', 'production_manager')
    })

@app.route('/api/db-test', methods=['POST'])
def test_db_connection():
    data = request.json
    try:
        connection = mysql.connector.connect(
            host=data.get('host', 'localhost'),
            user=data.get('user', 'root'),
            password=data.get('password', ''),
            database=data.get('database', 'production_manager')
        )
        if connection.is_connected():
            connection.close()
            return jsonify({"status": "success", "message": "Database connection successful"})
    except Error as e:
        return jsonify({"status": "error", "message": f"Connection failed: {str(e)}"})

if __name__ == '__main__':
    import time  # Add missing import
    app.run(debug=True, host='0.0.0.0', port=5000)
