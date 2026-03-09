# Inventory Management System

A simple command-line application to manage product inventory with basic CRUD operations.

## Features

- Add new products with name, price, and quantity
- View all products in a formatted table
- Update product information (price and quantity)
- Delete products from inventory
- Calculate total inventory value automatically

## How to Use

### Running the Application

```bash
npm start
```

Or directly with Node.js:

```bash
node index.js
```

### Menu Options

1. **Add Product** - Create a new product in the inventory
2. **List Products** - View all products in a formatted table
3. **Update Product** - Modify an existing product's price or quantity
4. **Delete Product** - Remove a product from inventory
5. **Exit** - Close the application

### Example Workflow

1. Start the application
2. Select option `1` to add a new product
3. Enter product details when prompted
4. Select option `2` to view all products
5. Select option `3` to update a product
6. Select option `4` to delete a product

## Input Validation

- Product name must not be empty
- Price must be a positive number
- Quantity must be a positive integer
- All inputs are validated before being stored

## Data Persistence

Data is stored in memory during the session and will be lost when the application closes.
