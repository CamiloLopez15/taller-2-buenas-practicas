const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class InventorySystem {
  constructor() {
    this.products = [];
    this.nextId = 1;
  }

  addProduct(name, price, quantity) {
    if (!name || name.trim() === '') {
      return { success: false, message: 'Product name cannot be empty.' };
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return { success: false, message: 'Price must be a positive number.' };
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return { success: false, message: 'Quantity must be a positive integer.' };
    }

    const product = {
      id: this.nextId++,
      name: name.trim(),
      price: parsedPrice,
      quantity: parsedQuantity
    };

    this.products.push(product);
    return { success: true, message: `Product "${product.name}" added successfully.` };
  }

  listProducts() {
    if (this.products.length === 0) {
      return { success: false, message: 'Inventory is empty.' };
    }

    const headers = ['ID', 'Name', 'Price', 'Quantity', 'Total Value'];
    const rows = this.products.map(p => [
      p.id.toString(),
      p.name,
      `$${p.price.toFixed(2)}`,
      p.quantity.toString(),
      `$${(p.price * p.quantity).toFixed(2)}`
    ]);

    return { success: true, headers, rows };
  }

  getTotalInventoryValue() {
    return this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  updateProduct(id, newPrice, newQuantity) {
    const product = this.getProductById(id);
    if (!product) {
      return { success: false, message: 'Product not found.' };
    }

    const oldPrice = product.price;
    const oldQuantity = product.quantity;

    if (newPrice !== null) {
      const parsedPrice = parseFloat(newPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return { success: false, message: 'Price must be a positive number.' };
      }
      product.price = parsedPrice;
    }

    if (newQuantity !== null) {
      const parsedQuantity = parseInt(newQuantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return { success: false, message: 'Quantity must be a positive integer.' };
      }
      product.quantity = parsedQuantity;
    }

    const message = `Product "${product.name}" updated. (Price: $${oldPrice.toFixed(2)} → $${product.price.toFixed(2)}, Quantity: ${oldQuantity} → ${product.quantity})`;
    return { success: true, message };
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, message: 'Product not found.' };
    }

    const name = this.products[index].name;
    this.products.splice(index, 1);
    return { success: true, message: `Product "${name}" deleted successfully.` };
  }
}

const inventory = new InventorySystem();

function formatTable(headers, rows) {
  const colWidths = headers.map((h, i) => {
    return Math.max(h.length, ...rows.map(r => r[i].length));
  });

  const borderTop = '┌' + colWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐';
  const borderMid = '├' + colWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤';
  const borderBot = '└' + colWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘';

  const headerRow = '│' + headers.map((h, i) => {
    const padding = colWidths[i] - h.length;
    return ' ' + h + ' '.repeat(padding + 1);
  }).join('│') + '│';

  const dataRows = rows.map(row =>
    '│' + row.map((cell, i) => {
      const padding = colWidths[i] - cell.length;
      return ' ' + cell + ' '.repeat(padding + 1);
    }).join('│') + '│'
  );

  return [borderTop, headerRow, borderMid, ...dataRows, borderBot].join('\n');
}

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function showMenu() {
  console.clear();
  console.log('╔════════════════════════════════════════╗');
  console.log('║     INVENTORY MANAGEMENT SYSTEM        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n  1. Add Product');
  console.log('  2. List Products');
  console.log('  3. Update Product');
  console.log('  4. Delete Product');
  console.log('  5. Exit\n');
}

async function handleAddProduct() {
  console.clear();
  console.log('─── ADD PRODUCT ───\n');
  const name = await prompt('Product name: ');
  const price = await prompt('Price: $');
  const quantity = await prompt('Quantity: ');

  const result = inventory.addProduct(name, price, quantity);
  console.log('\n' + result.message);
  await prompt('\nPress Enter to continue...');
}

async function handleListProducts() {
  console.clear();
  console.log('─── PRODUCTS ───\n');
  const result = inventory.listProducts();

  if (!result.success) {
    console.log(result.message);
  } else {
    console.log(formatTable(result.headers, result.rows));
    console.log(`\nTotal Products: ${inventory.products.length}`);
    console.log(`Total Inventory Value: $${inventory.getTotalInventoryValue().toFixed(2)}`);
  }

  await prompt('\nPress Enter to continue...');
}

async function handleUpdateProduct() {
  console.clear();
  console.log('─── UPDATE PRODUCT ───\n');

  const listResult = inventory.listProducts();
  if (!listResult.success) {
    console.log(listResult.message);
    await prompt('\nPress Enter to continue...');
    return;
  }

  console.log(formatTable(listResult.headers, listResult.rows) + '\n');
  const idStr = await prompt('Enter product ID to update: ');
  const id = parseInt(idStr);

  const product = inventory.getProductById(id);
  if (!product) {
    console.log('\nProduct not found.');
    await prompt('Press Enter to continue...');
    return;
  }

  console.log(`\nUpdating: ${product.name}`);
  console.log('1. Update Price');
  console.log('2. Update Quantity');
  console.log('3. Update Both\n');

  const choice = await prompt('Choose option: ');

  let newPrice = null;
  let newQuantity = null;

  if (choice === '1' || choice === '3') {
    const priceStr = await prompt(`Current price: $${product.price.toFixed(2)}\nNew price: $`);
    newPrice = priceStr;
  }

  if (choice === '2' || choice === '3') {
    const qtyStr = await prompt(`Current quantity: ${product.quantity}\nNew quantity: `);
    newQuantity = qtyStr;
  }

  const result = inventory.updateProduct(id, newPrice, newQuantity);
  console.log('\n' + result.message);
  await prompt('\nPress Enter to continue...');
}

async function handleDeleteProduct() {
  console.clear();
  console.log('─── DELETE PRODUCT ───\n');

  const listResult = inventory.listProducts();
  if (!listResult.success) {
    console.log(listResult.message);
    await prompt('\nPress Enter to continue...');
    return;
  }

  console.log(formatTable(listResult.headers, listResult.rows) + '\n');
  const idStr = await prompt('Enter product ID to delete: ');
  const id = parseInt(idStr);

  const product = inventory.getProductById(id);
  if (!product) {
    console.log('\nProduct not found.');
    await prompt('Press Enter to continue...');
    return;
  }

  const confirm = await prompt(`\nConfirm deletion of "${product.name}"? (yes/no): `);

  if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
    const result = inventory.deleteProduct(id);
    console.log('\n' + result.message);
  } else {
    console.log('\nDeletion cancelled.');
  }

  await prompt('Press Enter to continue...');
}

async function main() {
  while (true) {
    await showMenu();
    const choice = await prompt('Select an option (1-5): ');

    switch (choice) {
      case '1':
        await handleAddProduct();
        break;
      case '2':
        await handleListProducts();
        break;
      case '3':
        await handleUpdateProduct();
        break;
      case '4':
        await handleDeleteProduct();
        break;
      case '5':
        console.log('\nThank you for using Inventory Management System. Goodbye!\n');
        rl.close();
        return;
      default:
        console.log('\nInvalid option. Please try again.');
        await prompt('Press Enter to continue...');
    }
  }
}

main();
