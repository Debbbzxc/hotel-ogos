require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');

const seedData = async () => {
  try {
    // Check if URI is configured
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<db_password>')) {
      console.warn('MongoDB URI is not configured or contains placeholder <db_password>. Skipping seeding.');
      process.exit(0);
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB!');

    // 1. Seed Rooms
    console.log('Seeding rooms...');
    await Room.deleteMany({});
    
    const rooms = [
      {
        roomId: 'premium',
        name: 'Premium Room',
        baseRate12: 825,
        baseRate24: 1365,
        totalRooms: 5,
        description: 'Cozy and standard premium accommodation perfect for short stays.',
        imageUrl: ''
      },
      {
        roomId: 'deluxe',
        name: 'Deluxe Room',
        baseRate12: 865,
        baseRate24: 1405,
        totalRooms: 3,
        description: 'Spacious deluxe room with premium bedsheets and essential toiletries.',
        imageUrl: ''
      },
      {
        roomId: 'regency',
        name: 'Regency',
        baseRate12: 935,
        baseRate24: 1475,
        totalRooms: 2,
        description: 'Elegant regency suite featuring ambient lighting and complimentary hot coffee.',
        imageUrl: ''
      },
      {
        roomId: 'regency2',
        name: 'Regency II',
        baseRate12: 1135,
        baseRate24: 1675,
        totalRooms: 4,
        description: 'Upgraded regency experience with smart TV and standard room configurations.',
        imageUrl: ''
      },
      {
        roomId: 'mega_suite',
        name: 'Mega Suite',
        baseRate12: 1960,
        baseRate24: 2500,
        totalRooms: 1,
        description: 'The ultimate luxury package at Hotel Ogos. King-sized bed and complete mini-bar.',
        imageUrl: ''
      }
    ];

    await Room.insertMany(rooms);
    console.log('Rooms seeded successfully!');

    // 2. Seed Default Admin User
    console.log('Seeding default Admin user...');
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        firstName: 'Hotel',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin@hotelogos.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Default Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: adminpassword123');
    } else {
      console.log('Admin user already exists.');
    }

    // 3. Seed Sample Guest User
    console.log('Seeding sample Guest user...');
    const guestExists = await User.findOne({ username: 'guest' });
    if (!guestExists) {
      const guestUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        username: 'guest',
        email: 'guest@hotelogos.com',
        password: 'guestpassword123',
        role: 'guest'
      });
      await guestUser.save();
      console.log('Sample Guest user created successfully!');
      console.log('Username: guest');
      console.log('Password: guestpassword123');
    } else {
      console.log('Guest user already exists.');
    }

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
