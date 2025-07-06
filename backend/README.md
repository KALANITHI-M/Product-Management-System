
# Production Manager Backend

This is the backend for the Production Manager app, built with Python Flask and MySQL.

## Setup Instructions

1. Make sure you have Python 3.8+ installed
2. Install required packages:
   ```
   pip install -r requirements.txt
   ```
3. Set up a MySQL database:
   - Create a database named `production_manager`
   - Or use an existing database and update the configuration

4. Copy `.env.example` to `.env` and update with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=production_manager
   ```

5. Run the server:
   ```
   python server.py
   ```

The server will start on http://localhost:5000

## API Documentation

The backend provides RESTful API endpoints for:

- Products management
- Materials inventory
- Production logs
- Reports generation
- Database configuration

## Database Schema

The database consists of the following tables:
- `products` - Stores product information
- `materials` - Stores material inventory
- `product_materials` - Junction table for product-material relationships
- `production_logs` - Tracks production activities
