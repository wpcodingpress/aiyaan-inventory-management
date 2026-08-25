import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Organization ───────────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "Ayan's Crafts",
      slug: 'ayans-crafts',
      primaryColor: '#4f46e5',
      secondaryColor: '#565e74',
      currency: 'BDT',
      currencySymbol: '৳',
      timezone: 'Asia/Dhaka',
      dateFormat: 'DD/MM/YYYY',
      businessType: 'footwear',
      contactEmail: 'info@aiyaanscrafts.com',
      contactPhone: '+880 1712-345678',
      address: '123 Leather Market, Dhaka 1100, Bangladesh',
    },
  });

  // ─── Roles ─────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        organizationId: org.id,
        name: 'Admin',
        slug: 'admin',
        description: 'Full system access',
        permissions: '*',
      },
    }),
    prisma.role.create({
      data: {
        organizationId: org.id,
        name: 'Manager',
        slug: 'manager',
        description: 'Manage products, purchases, and sales',
        permissions: 'products,purchases,sales,reports',
      },
    }),
    prisma.role.create({
      data: {
        organizationId: org.id,
        name: 'Sales Staff',
        slug: 'sales_staff',
        description: 'Create and manage sales',
        permissions: 'sales,customers',
      },
    }),
    prisma.role.create({
      data: {
        organizationId: org.id,
        name: 'Viewer',
        slug: 'viewer',
        description: 'Read-only access',
        permissions: 'view',
      },
    }),
  ]);

  // ─── Admin User ────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Admin User',
      email: 'admin@aiyaanscrafts.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    },
  });

  // ─── Categories ────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: { organizationId: org.id, name: 'Formal', slug: 'formal', description: 'Formal dress shoes', sortOrder: 1 },
    }),
    prisma.category.create({
      data: { organizationId: org.id, name: 'Casual', slug: 'casual', description: 'Casual everyday shoes', sortOrder: 2 },
    }),
    prisma.category.create({
      data: { organizationId: org.id, name: 'Boots', slug: 'boots', description: 'Boots and high-tops', sortOrder: 3 },
    }),
    prisma.category.create({
      data: { organizationId: org.id, name: 'Sandals', slug: 'sandals', description: 'Open-toe footwear', sortOrder: 4 },
    }),
  ]);

  // ─── Brands ────────────────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.create({
      data: { organizationId: org.id, name: "Aiyaan's Signature", slug: 'aiyaans-signature', description: 'Premium handcrafted collection', sortOrder: 1 },
    }),
    prisma.brand.create({
      data: { organizationId: org.id, name: 'Classic Heritage', slug: 'classic-heritage', description: 'Timeless classic designs', sortOrder: 2 },
    }),
  ]);

  // ─── Products ──────────────────────────────────────────────
  // Product 1: Premium Leather Loafer (Formal, in stock)
  const p1 = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Premium Leather Loafer',
      slug: 'premium-leather-loafer',
      description: 'Hand-stitched genuine leather loafer with cushioned insole',
      categoryId: categories[0].id,
      brandId: brands[0].id,
      sku: 'PLF-001',
      lowStockThreshold: 10,
    },
  });

  const p1v = await Promise.all([
    prisma.productVariant.create({
      data: { productId: p1.id, sku: 'PLF-001-40-BLK', size: '40', color: 'Black', material: 'Genuine Leather', purchaseCost: 1800, sellingPrice: 2950, minimumStock: 5, currentStock: 25 },
    }),
    prisma.productVariant.create({
      data: { productId: p1.id, sku: 'PLF-001-41-BLK', size: '41', color: 'Black', material: 'Genuine Leather', purchaseCost: 1800, sellingPrice: 2950, minimumStock: 5, currentStock: 20 },
    }),
    prisma.productVariant.create({
      data: { productId: p1.id, sku: 'PLF-001-40-BRN', size: '40', color: 'Brown', material: 'Genuine Leather', purchaseCost: 1850, sellingPrice: 3050, minimumStock: 5, currentStock: 18 },
    }),
    prisma.productVariant.create({
      data: { productId: p1.id, sku: 'PLF-001-42-BRN', size: '42', color: 'Brown', material: 'Genuine Leather', purchaseCost: 1850, sellingPrice: 3050, minimumStock: 5, currentStock: 15 },
    }),
  ]);

  // Product 2: Classic Oxford Lace-up (Formal, low stock)
  const p2 = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Classic Oxford Lace-up',
      slug: 'classic-oxford-laceup',
      description: 'Traditional Oxford lace-up in polished leather',
      categoryId: categories[0].id,
      brandId: brands[1].id,
      sku: 'COL-001',
      lowStockThreshold: 10,
    },
  });

  const p2v = await Promise.all([
    prisma.productVariant.create({
      data: { productId: p2.id, sku: 'COL-001-41-BLK', size: '41', color: 'Black', material: 'Polished Leather', purchaseCost: 2200, sellingPrice: 3650, minimumStock: 5, currentStock: 4 },
    }),
    prisma.productVariant.create({
      data: { productId: p2.id, sku: 'COL-001-42-BLK', size: '42', color: 'Black', material: 'Polished Leather', purchaseCost: 2200, sellingPrice: 3650, minimumStock: 5, currentStock: 3 },
    }),
    prisma.productVariant.create({
      data: { productId: p2.id, sku: 'COL-001-40-TAN', size: '40', color: 'Tan', material: 'Polished Leather', purchaseCost: 2300, sellingPrice: 3800, minimumStock: 5, currentStock: 5 },
    }),
  ]);

  // Product 3: Everyday Suede Chukka (Casual, out of stock)
  const p3 = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Everyday Suede Chukka',
      slug: 'everyday-suede-chukka',
      description: 'Comfortable suede chukka boot for daily wear',
      categoryId: categories[1].id,
      brandId: brands[1].id,
      sku: 'ESC-001',
      lowStockThreshold: 10,
    },
  });

  const p3v = await Promise.all([
    prisma.productVariant.create({
      data: { productId: p3.id, sku: 'ESC-001-40-TAN', size: '40', color: 'Tan', material: 'Suede', purchaseCost: 1500, sellingPrice: 2450, minimumStock: 5, currentStock: 0 },
    }),
    prisma.productVariant.create({
      data: { productId: p3.id, sku: 'ESC-001-41-BRN', size: '41', color: 'Brown', material: 'Suede', purchaseCost: 1500, sellingPrice: 2450, minimumStock: 5, currentStock: 0 },
    }),
    prisma.productVariant.create({
      data: { productId: p3.id, sku: 'ESC-001-42-GRY', size: '42', color: 'Grey', material: 'Suede', purchaseCost: 1550, sellingPrice: 2550, minimumStock: 5, currentStock: 0 },
    }),
  ]);

  // Product 4: Suede Chelsea Boot (Boots, low stock)
  const p4 = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Suede Chelsea Boot',
      slug: 'suede-chelsea-boot',
      description: 'Classic Chelsea boot in premium suede',
      categoryId: categories[2].id,
      brandId: brands[0].id,
      sku: 'SCB-001',
      lowStockThreshold: 10,
    },
  });

  const p4v = await Promise.all([
    prisma.productVariant.create({
      data: { productId: p4.id, sku: 'SCB-001-41-BRN', size: '41', color: 'Brown', material: 'Suede', purchaseCost: 2500, sellingPrice: 4150, minimumStock: 5, currentStock: 3 },
    }),
    prisma.productVariant.create({
      data: { productId: p4.id, sku: 'SCB-001-42-BLK', size: '42', color: 'Black', material: 'Suede', purchaseCost: 2500, sellingPrice: 4150, minimumStock: 5, currentStock: 2 },
    }),
    prisma.productVariant.create({
      data: { productId: p4.id, sku: 'SCB-001-40-TAN', size: '40', color: 'Tan', material: 'Suede', purchaseCost: 2600, sellingPrice: 4300, minimumStock: 5, currentStock: 5 },
    }),
  ]);

  // Product 5: Minimalist Sneaker (Casual, in stock)
  const p5 = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Minimalist Sneaker',
      slug: 'minimalist-sneaker',
      description: 'Clean minimalist sneaker for everyday wear',
      categoryId: categories[1].id,
      brandId: brands[1].id,
      sku: 'MS-001',
      lowStockThreshold: 10,
    },
  });

  const p5v = await Promise.all([
    prisma.productVariant.create({
      data: { productId: p5.id, sku: 'MS-001-40-WHT', size: '40', color: 'White', material: 'Canvas', purchaseCost: 1200, sellingPrice: 1950, minimumStock: 5, currentStock: 30 },
    }),
    prisma.productVariant.create({
      data: { productId: p5.id, sku: 'MS-001-41-WHT', size: '41', color: 'White', material: 'Canvas', purchaseCost: 1200, sellingPrice: 1950, minimumStock: 5, currentStock: 25 },
    }),
    prisma.productVariant.create({
      data: { productId: p5.id, sku: 'MS-001-42-BLK', size: '42', color: 'Black', material: 'Canvas', purchaseCost: 1250, sellingPrice: 2050, minimumStock: 5, currentStock: 22 },
    }),
    prisma.productVariant.create({
      data: { productId: p5.id, sku: 'MS-001-41-GRY', size: '41', color: 'Grey', material: 'Canvas', purchaseCost: 1250, sellingPrice: 2050, minimumStock: 5, currentStock: 20 },
    }),
  ]);

  // Product 6: Handstitched Monk Strap (Formal, in stock)
  const p6 = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Handstitched Monk Strap',
      slug: 'handstitched-monk-strap',
      description: 'Artisan handstitched monk strap in full-grain leather',
      categoryId: categories[0].id,
      brandId: brands[0].id,
      sku: 'HMS-001',
      lowStockThreshold: 10,
    },
  });

  const p6v = await Promise.all([
    prisma.productVariant.create({
      data: { productId: p6.id, sku: 'HMS-001-41-BRN', size: '41', color: 'Brown', material: 'Full-Grain Leather', purchaseCost: 3200, sellingPrice: 5300, minimumStock: 5, currentStock: 12 },
    }),
    prisma.productVariant.create({
      data: { productId: p6.id, sku: 'HMS-001-42-BLK', size: '42', color: 'Black', material: 'Full-Grain Leather', purchaseCost: 3200, sellingPrice: 5300, minimumStock: 5, currentStock: 10 },
    }),
    prisma.productVariant.create({
      data: { productId: p6.id, sku: 'HMS-001-40-BRG', size: '40', color: 'Burgundy', material: 'Full-Grain Leather', purchaseCost: 3500, sellingPrice: 6500, minimumStock: 5, currentStock: 8 },
    }),
  ]);

  // ─── Suppliers ─────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: 'Premium Leather Goods Co.',
        slug: 'premium-leather-goods',
        contactPerson: 'Rafiq Ahmed',
        email: 'rafiq@premiumleather.com',
        phone: '+880 1711-234567',
        address: '45 Tannery Road',
        city: 'Dhaka',
        country: 'Bangladesh',
        paymentTerms: 'Net 30',
        totalPurchases: 1,
        totalSpent: 200000,
        outstandingBalance: 62150,
      },
    }),
    prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: 'Footwear Manufacturers Ltd.',
        slug: 'footwear-manufacturers',
        contactPerson: 'Kamal Hossain',
        email: 'kamal@fmlbd.com',
        phone: '+880 1812-345678',
        address: '78 Industrial Area',
        city: 'Chittagong',
        country: 'Bangladesh',
        paymentTerms: 'Net 15',
        totalPurchases: 1,
        totalSpent: 303500,
        outstandingBalance: 0,
      },
    }),
    prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: 'BD Leather Exports',
        slug: 'bd-leather-exports',
        contactPerson: 'Nasir Uddin',
        email: 'nasir@bdleather.com',
        phone: '+880 1913-456789',
        address: '12 Export Zone',
        city: 'Sylhet',
        country: 'Bangladesh',
        paymentTerms: 'Net 45',
        totalPurchases: 0,
        totalSpent: 0,
        outstandingBalance: 0,
      },
    }),
  ]);

  // ─── Customers ─────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Bata Retailers Ltd.',
        email: 'procurement@bata-bd.com',
        phone: '+880 1720-111111',
        address: 'Bata Nagar, Tongi',
        city: 'Gazipur',
        country: 'Bangladesh',
        customerType: 'business',
        totalSpent: 35600,
        totalSales: 1,
        outstandingBalance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Apex Footwear',
        email: 'orders@apexfootwear.com',
        phone: '+880 1819-222222',
        address: '34 Uttara Commercial',
        city: 'Dhaka',
        country: 'Bangladesh',
        customerType: 'business',
        totalSpent: 100000,
        totalSales: 1,
        outstandingBalance: 43200,
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Lotto Outlets',
        email: 'buy@lotto-bd.com',
        phone: '+880 1630-333333',
        address: '56 Banani Road 11',
        city: 'Dhaka',
        country: 'Bangladesh',
        customerType: 'business',
        totalSpent: 75450,
        totalSales: 1,
        outstandingBalance: 0,
      },
    }),
  ]);

  // ─── Purchases ─────────────────────────────────────────────
  // Purchase 1: Premium Leather Goods Co. — Formal shoes & monk straps
  const purchase1 = await prisma.purchase.create({
    data: {
      organizationId: org.id,
      supplierId: suppliers[0].id,
      purchaseNumber: 'PO-2025-0001',
      invoiceNumber: 'PLG-INV-2025-042',
      purchaseDate: new Date('2025-01-15'),
      subtotal: 262150,
      discount: 0,
      tax: 0,
      total: 262150,
      paidAmount: 200000,
      dueAmount: 62150,
      paymentStatus: 'partial',
      status: 'completed',
      createdBy: adminUser.id,
    },
  });

  const p1Items = [
    { variantId: p1v[0].id, productId: p1.id, quantity: 25, unitCost: 1800, discount: 0, tax: 0, total: 45000 },
    { variantId: p1v[1].id, productId: p1.id, quantity: 25, unitCost: 1800, discount: 0, tax: 0, total: 45000 },
    { variantId: p1v[2].id, productId: p1.id, quantity: 20, unitCost: 1850, discount: 0, tax: 0, total: 37000 },
    { variantId: p1v[3].id, productId: p1.id, quantity: 15, unitCost: 1850, discount: 0, tax: 0, total: 27750 },
    { variantId: p6v[0].id, productId: p6.id, quantity: 12, unitCost: 3200, discount: 0, tax: 0, total: 38400 },
    { variantId: p6v[1].id, productId: p6.id, quantity: 10, unitCost: 3200, discount: 0, tax: 0, total: 32000 },
    { variantId: p6v[2].id, productId: p6.id, quantity: 8, unitCost: 3500, discount: 0, tax: 0, total: 28000 },
  ];

  for (const item of p1Items) {
    await prisma.purchaseItem.create({
      data: { purchaseId: purchase1.id, ...item },
    });
  }

  // Purchase 2: Footwear Manufacturers Ltd. — Casual, boots, sneakers
  const purchase2 = await prisma.purchase.create({
    data: {
      organizationId: org.id,
      supplierId: suppliers[1].id,
      purchaseNumber: 'PO-2025-0002',
      invoiceNumber: 'FML-INV-2025-018',
      purchaseDate: new Date('2025-02-10'),
      subtotal: 303500,
      discount: 0,
      tax: 0,
      total: 303500,
      paidAmount: 303500,
      dueAmount: 0,
      paymentStatus: 'paid',
      status: 'completed',
      createdBy: adminUser.id,
    },
  });

  const p2Items = [
    { variantId: p5v[0].id, productId: p5.id, quantity: 30, unitCost: 1200, discount: 0, tax: 0, total: 36000 },
    { variantId: p5v[1].id, productId: p5.id, quantity: 25, unitCost: 1200, discount: 0, tax: 0, total: 30000 },
    { variantId: p5v[2].id, productId: p5.id, quantity: 22, unitCost: 1250, discount: 0, tax: 0, total: 27500 },
    { variantId: p5v[3].id, productId: p5.id, quantity: 20, unitCost: 1250, discount: 0, tax: 0, total: 25000 },
    { variantId: p2v[0].id, productId: p2.id, quantity: 10, unitCost: 2200, discount: 0, tax: 0, total: 22000 },
    { variantId: p2v[1].id, productId: p2.id, quantity: 8, unitCost: 2200, discount: 0, tax: 0, total: 17600 },
    { variantId: p2v[2].id, productId: p2.id, quantity: 8, unitCost: 2300, discount: 0, tax: 0, total: 18400 },
    { variantId: p4v[0].id, productId: p4.id, quantity: 10, unitCost: 2500, discount: 0, tax: 0, total: 25000 },
    { variantId: p4v[1].id, productId: p4.id, quantity: 8, unitCost: 2500, discount: 0, tax: 0, total: 20000 },
    { variantId: p4v[2].id, productId: p4.id, quantity: 10, unitCost: 2600, discount: 0, tax: 0, total: 26000 },
    { variantId: p3v[0].id, productId: p3.id, quantity: 15, unitCost: 1500, discount: 0, tax: 0, total: 22500 },
    { variantId: p3v[1].id, productId: p3.id, quantity: 12, unitCost: 1500, discount: 0, tax: 0, total: 18000 },
    { variantId: p3v[2].id, productId: p3.id, quantity: 10, unitCost: 1550, discount: 0, tax: 0, total: 15500 },
  ];

  for (const item of p2Items) {
    await prisma.purchaseItem.create({
      data: { purchaseId: purchase2.id, ...item },
    });
  }

  // ─── Stock Movements (Purchases) ───────────────────────────
  const purchaseMovements = [
    { variantId: p1v[0].id, movementType: 'IN', quantity: 25, unitCost: 1800, totalCost: 45000, balanceAfter: 25, referenceType: 'Purchase', referenceId: purchase1.id },
    { variantId: p1v[1].id, movementType: 'IN', quantity: 25, unitCost: 1800, totalCost: 45000, balanceAfter: 25, referenceType: 'Purchase', referenceId: purchase1.id },
    { variantId: p1v[2].id, movementType: 'IN', quantity: 20, unitCost: 1850, totalCost: 37000, balanceAfter: 20, referenceType: 'Purchase', referenceId: purchase1.id },
    { variantId: p1v[3].id, movementType: 'IN', quantity: 15, unitCost: 1850, totalCost: 27750, balanceAfter: 15, referenceType: 'Purchase', referenceId: purchase1.id },
    { variantId: p6v[0].id, movementType: 'IN', quantity: 12, unitCost: 3200, totalCost: 38400, balanceAfter: 12, referenceType: 'Purchase', referenceId: purchase1.id },
    { variantId: p6v[1].id, movementType: 'IN', quantity: 10, unitCost: 3200, totalCost: 32000, balanceAfter: 10, referenceType: 'Purchase', referenceId: purchase1.id },
    { variantId: p6v[2].id, movementType: 'IN', quantity: 8, unitCost: 3500, totalCost: 28000, balanceAfter: 8, referenceType: 'Purchase', referenceId: purchase1.id },
    { variantId: p5v[0].id, movementType: 'IN', quantity: 30, unitCost: 1200, totalCost: 36000, balanceAfter: 30, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p5v[1].id, movementType: 'IN', quantity: 25, unitCost: 1200, totalCost: 30000, balanceAfter: 25, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p5v[2].id, movementType: 'IN', quantity: 22, unitCost: 1250, totalCost: 27500, balanceAfter: 22, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p5v[3].id, movementType: 'IN', quantity: 20, unitCost: 1250, totalCost: 25000, balanceAfter: 20, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p2v[0].id, movementType: 'IN', quantity: 10, unitCost: 2200, totalCost: 22000, balanceAfter: 10, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p2v[1].id, movementType: 'IN', quantity: 8, unitCost: 2200, totalCost: 17600, balanceAfter: 8, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p2v[2].id, movementType: 'IN', quantity: 8, unitCost: 2300, totalCost: 18400, balanceAfter: 8, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p4v[0].id, movementType: 'IN', quantity: 10, unitCost: 2500, totalCost: 25000, balanceAfter: 10, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p4v[1].id, movementType: 'IN', quantity: 8, unitCost: 2500, totalCost: 20000, balanceAfter: 8, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p4v[2].id, movementType: 'IN', quantity: 10, unitCost: 2600, totalCost: 26000, balanceAfter: 10, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p3v[0].id, movementType: 'IN', quantity: 15, unitCost: 1500, totalCost: 22500, balanceAfter: 15, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p3v[1].id, movementType: 'IN', quantity: 12, unitCost: 1500, totalCost: 18000, balanceAfter: 12, referenceType: 'Purchase', referenceId: purchase2.id },
    { variantId: p3v[2].id, movementType: 'IN', quantity: 10, unitCost: 1550, totalCost: 15500, balanceAfter: 10, referenceType: 'Purchase', referenceId: purchase2.id },
  ];

  for (const m of purchaseMovements) {
    await prisma.stockMovement.create({
      data: { organizationId: org.id, createdBy: adminUser.id, note: `Stock received from ${m.referenceId === purchase1.id ? 'PO-2025-0001' : 'PO-2025-0002'}`, ...m },
    });
  }

  // ─── Sales ─────────────────────────────────────────────────
  // Sale 1: Bata Retailers — Premium loafers
  const sale1 = await prisma.sale.create({
    data: {
      organizationId: org.id,
      customerId: customers[0].id,
      saleNumber: 'INV-2025-0001',
      saleDate: new Date('2025-03-05'),
      subtotal: 35600,
      discount: 0,
      tax: 0,
      total: 35600,
      paidAmount: 35600,
      dueAmount: 0,
      paymentStatus: 'paid',
      status: 'completed',
      createdBy: adminUser.id,
    },
  });

  const s1Items = [
    { variantId: p1v[0].id, productId: p1.id, quantity: 5, sellingPrice: 2950, costAtSale: 1800, discount: 0, tax: 0, total: 14750, profit: 5750 },
    { variantId: p1v[1].id, productId: p1.id, quantity: 5, sellingPrice: 2950, costAtSale: 1800, discount: 0, tax: 0, total: 14750, profit: 5750 },
    { variantId: p1v[2].id, productId: p1.id, quantity: 2, sellingPrice: 3050, costAtSale: 1850, discount: 0, tax: 0, total: 6100, profit: 2400 },
  ];

  for (const item of s1Items) {
    await prisma.saleItem.create({ data: { saleId: sale1.id, ...item } });
  }

  // Sale 2: Apex Footwear — Oxfords, chukkas
  const sale2 = await prisma.sale.create({
    data: {
      organizationId: org.id,
      customerId: customers[1].id,
      saleNumber: 'INV-2025-0002',
      saleDate: new Date('2025-03-20'),
      subtotal: 143200,
      discount: 0,
      tax: 0,
      total: 143200,
      paidAmount: 100000,
      dueAmount: 43200,
      paymentStatus: 'partial',
      status: 'completed',
      createdBy: adminUser.id,
    },
  });

  const s2Items = [
    { variantId: p2v[0].id, productId: p2.id, quantity: 6, sellingPrice: 3650, costAtSale: 2200, discount: 0, tax: 0, total: 21900, profit: 8700 },
    { variantId: p2v[1].id, productId: p2.id, quantity: 5, sellingPrice: 3650, costAtSale: 2200, discount: 0, tax: 0, total: 18250, profit: 7250 },
    { variantId: p2v[2].id, productId: p2.id, quantity: 3, sellingPrice: 3800, costAtSale: 2300, discount: 0, tax: 0, total: 11400, profit: 4500 },
    { variantId: p3v[0].id, productId: p3.id, quantity: 15, sellingPrice: 2450, costAtSale: 1500, discount: 0, tax: 0, total: 36750, profit: 14250 },
    { variantId: p3v[1].id, productId: p3.id, quantity: 12, sellingPrice: 2450, costAtSale: 1500, discount: 0, tax: 0, total: 29400, profit: 11400 },
    { variantId: p3v[2].id, productId: p3.id, quantity: 10, sellingPrice: 2550, costAtSale: 1550, discount: 0, tax: 0, total: 25500, profit: 10000 },
  ];

  for (const item of s2Items) {
    await prisma.saleItem.create({ data: { saleId: sale2.id, ...item } });
  }

  // Sale 3: Lotto Outlets — Chelsea boots
  const sale3 = await prisma.sale.create({
    data: {
      organizationId: org.id,
      customerId: customers[2].id,
      saleNumber: 'INV-2025-0003',
      saleDate: new Date('2025-04-05'),
      subtotal: 75450,
      discount: 0,
      tax: 0,
      total: 75450,
      paidAmount: 75450,
      dueAmount: 0,
      paymentStatus: 'paid',
      status: 'completed',
      createdBy: adminUser.id,
    },
  });

  const s3Items = [
    { variantId: p4v[0].id, productId: p4.id, quantity: 7, sellingPrice: 4150, costAtSale: 2500, discount: 0, tax: 0, total: 29050, profit: 11550 },
    { variantId: p4v[1].id, productId: p4.id, quantity: 6, sellingPrice: 4150, costAtSale: 2500, discount: 0, tax: 0, total: 24900, profit: 9900 },
    { variantId: p4v[2].id, productId: p4.id, quantity: 5, sellingPrice: 4300, costAtSale: 2600, discount: 0, tax: 0, total: 21500, profit: 8500 },
  ];

  for (const item of s3Items) {
    await prisma.saleItem.create({ data: { saleId: sale3.id, ...item } });
  }

  // ─── Stock Movements (Sales) ───────────────────────────────
  const saleMovements = [
    { variantId: p1v[0].id, movementType: 'OUT', quantity: 5, unitCost: 1800, totalCost: 9000, balanceAfter: 25, referenceType: 'Sale', referenceId: sale1.id },
    { variantId: p1v[1].id, movementType: 'OUT', quantity: 5, unitCost: 1800, totalCost: 9000, balanceAfter: 20, referenceType: 'Sale', referenceId: sale1.id },
    { variantId: p1v[2].id, movementType: 'OUT', quantity: 2, unitCost: 1850, totalCost: 3700, balanceAfter: 18, referenceType: 'Sale', referenceId: sale1.id },
    { variantId: p2v[0].id, movementType: 'OUT', quantity: 6, unitCost: 2200, totalCost: 13200, balanceAfter: 4, referenceType: 'Sale', referenceId: sale2.id },
    { variantId: p2v[1].id, movementType: 'OUT', quantity: 5, unitCost: 2200, totalCost: 11000, balanceAfter: 3, referenceType: 'Sale', referenceId: sale2.id },
    { variantId: p2v[2].id, movementType: 'OUT', quantity: 3, unitCost: 2300, totalCost: 6900, balanceAfter: 5, referenceType: 'Sale', referenceId: sale2.id },
    { variantId: p3v[0].id, movementType: 'OUT', quantity: 15, unitCost: 1500, totalCost: 22500, balanceAfter: 0, referenceType: 'Sale', referenceId: sale2.id },
    { variantId: p3v[1].id, movementType: 'OUT', quantity: 12, unitCost: 1500, totalCost: 18000, balanceAfter: 0, referenceType: 'Sale', referenceId: sale2.id },
    { variantId: p3v[2].id, movementType: 'OUT', quantity: 10, unitCost: 1550, totalCost: 15500, balanceAfter: 0, referenceType: 'Sale', referenceId: sale2.id },
    { variantId: p4v[0].id, movementType: 'OUT', quantity: 7, unitCost: 2500, totalCost: 17500, balanceAfter: 3, referenceType: 'Sale', referenceId: sale3.id },
    { variantId: p4v[1].id, movementType: 'OUT', quantity: 6, unitCost: 2500, totalCost: 15000, balanceAfter: 2, referenceType: 'Sale', referenceId: sale3.id },
    { variantId: p4v[2].id, movementType: 'OUT', quantity: 5, unitCost: 2600, totalCost: 13000, balanceAfter: 5, referenceType: 'Sale', referenceId: sale3.id },
  ];

  for (const m of saleMovements) {
    await prisma.stockMovement.create({
      data: { organizationId: org.id, createdBy: adminUser.id, note: `Stock sold via ${m.referenceId === sale1.id ? 'INV-2025-0001' : m.referenceId === sale2.id ? 'INV-2025-0002' : 'INV-2025-0003'}`, ...m },
    });
  }

  // ─── Expenses ──────────────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      { organizationId: org.id, category: 'Rent', title: 'Office & Warehouse Rent', amount: 45000, date: new Date('2025-03-01'), paymentMethod: 'bank_transfer', notes: 'Monthly rent for March 2025', createdBy: adminUser.id },
      { organizationId: org.id, category: 'Utilities', title: 'Electricity & Internet', amount: 12000, date: new Date('2025-03-05'), paymentMethod: 'cash', notes: 'Monthly utilities for March 2025', createdBy: adminUser.id },
      { organizationId: org.id, category: 'Marketing', title: 'Facebook & Instagram Ads', amount: 25000, date: new Date('2025-03-10'), paymentMethod: 'online', notes: 'Digital marketing campaign Q1 2025', createdBy: adminUser.id },
    ],
  });

  // ─── Settings ──────────────────────────────────────────────
  await prisma.setting.createMany({
    data: [
      { organizationId: org.id, key: 'tax_rate', value: '0', category: 'finance' },
      { organizationId: org.id, key: 'low_stock_alert', value: 'true', category: 'inventory' },
      { organizationId: org.id, key: 'invoice_prefix', value: 'INV-', category: 'sales' },
      { organizationId: org.id, key: 'po_prefix', value: 'PO-', category: 'purchases' },
      { organizationId: org.id, key: 'sku_prefix', value: '', category: 'inventory' },
      { organizationId: org.id, key: 'default_payment_terms', value: 'Net 30', category: 'sales' },
    ],
  });

  // ─── Audit Log ─────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: adminUser.id,
      action: 'SEED_COMPLETE',
      entityType: 'system',
      metadata: JSON.stringify({
        products: 6,
        variants: 20,
        suppliers: 3,
        customers: 3,
        purchases: 2,
        sales: 3,
        expenses: 3,
      }),
    },
  });

  console.log('Seed completed successfully!');
  console.log('─────────────────────────────────────────');
  console.log('Organization: Ayan\'s Crafts');
  console.log('Admin Login:  admin@aiyaanscrafts.com / admin123');
  console.log('─────────────────────────────────────────');
  console.log('Categories: 4 | Brands: 2 | Products: 6');
  console.log('Variants: 20 | Suppliers: 3 | Customers: 3');
  console.log('Purchases: 2 | Sales: 3 | Expenses: 3');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
