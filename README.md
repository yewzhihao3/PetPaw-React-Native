# PetPaw React Native App

A mobile application built with React Native and Expo for pet-related services and community features.

## 🐾 Features

### 🏠 Core Features

- User Authentication and Profile Management
- Dark/Light Theme Support
- Multi-role Support (Pet Owner, Driver, Rider)
- Location-based Services
- Real-time Notifications

### 🐕 Pet Management

- Pet Profile Management
  - Add and edit pet information
  - Pet medical records
  - Pet prescriptions tracking
  - Pet diary system
- Pet Tips and AI Chat Support
  - Educational content for pet care
  - AI-powered chat for pet-related queries
  - Trophy room for achievements

### 🏥 Veterinary Services

- Veterinary Appointment Booking
  - Schedule veterinary visits
  - Date and time selection
  - Booking confirmation system
  - View booking history
- Medical Records Management
  - Track pet prescriptions
  - Store medical history
  - Access medical documents

### 🚗 Pet Transportation

- Pet Taxi Service
  - Real-time location tracking
  - Route optimization
  - Fare estimation
  - Driver/rider matching
- Driver Features
  - Ride management
  - Trip history
  - Profile management
  - Real-time status updates

### 🏨 Pet Services

- Pet Hotel Booking
  - Browse available hotels
  - Make reservations
  - View booking details
  - Booking confirmation system
- Grooming Services
  - Schedule grooming appointments
  - Service selection
  - Booking management
  - View booking history

### 🎮 Interactive Features

- Tamagotchi Pet Game
  - Virtual pet care simulation
  - Pet tips and guidance
  - Achievement system
  - Trophy collection

### 🛍️ E-Commerce

- Pet Store
  - Browse products
  - Shopping cart functionality
  - Order tracking
  - Delivery status updates
- Order Management
  - View order history
  - Track current orders
  - Order preparation status
  - Delivery tracking

### 📱 Technical Features

- Responsive UI with Animations
- Secure Data Storage
- Real-time Location Tracking
- Push Notifications
- Image Handling and Sharing
  - Upload and crop images
  - Image viewing gallery
  - Share functionality
- Interactive Maps Integration
- Calendar Management
- Offline Data Persistence

## 🛠 Technology Stack

- **Framework:** React Native with Expo
- **State Management:**
  - Redux Toolkit
  - Zustand
  - MMKV Storage
- **UI/Styling:**
  - NativeWind (TailwindCSS for React Native)
  - React Native Animatable
  - Vector Icons
  - Linear Gradient
- **Navigation:** React Navigation v6
- **Data Fetching:** Axios
- **Data Persistence:**
  - Async Storage
  - Secure Store
- **Maps & Location:** React Native Maps
- **Date Handling:** date-fns
- **Content Management:** Sanity.io Integration

## 📱 Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Studio (for Android development)

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yewzhihao3/PetPaw-React-Native.git
   ```

2. Install dependencies:

   ```bash
   cd PetPaw-React-Native
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```bash
   npm start
   # or
   yarn start
   ```

4. Run on your preferred platform:
   ```bash
   # For iOS
   npm run ios
   # For Android
   npm run android
   ```

## 📱 Platform Support

- iOS
- Android
- Web (Expo web support)

## 🔗 Related Projects

This mobile app is part of a larger ecosystem that includes a web application for business owners and a FastAPI backend server.

### 🌐 Web Application ([PetPaw Web](https://github.com/yewzhihao3/PetPaw_Web))

The web application is built with React and provides business management interfaces for:

#### 🏪 Shop Management

- Order Management System
  - View and process pending orders
  - Accept/decline orders with reason
  - Track order history
- Financial Analytics
  - Money earned tracking
  - Sales analytics by category
  - Revenue reports

#### 🏥 Veterinary Clinic Management

- Appointment Management
  - Schedule and manage vet appointments
  - Track appointment status
- Veterinary Staff Management
- Prescription Management
  - Handle refill requests
  - Manage prescriptions
- Medical Records System
  - Store and access pet medical histories
  - Manage patient records

#### 🏨 Pet Hotel Management

- Booking Management
  - Process hotel reservations
  - Manage room availability
  - Handle check-in/check-out
- Analytics Dashboard
  - Occupancy rates
  - Revenue tracking
  - Booking trends

#### 💇 Grooming Service Management

- Appointment Scheduling
  - Manage grooming bookings
  - Service scheduling
- Analytics
  - Service popularity metrics
  - Revenue tracking
  - Customer trends

#### 💼 Business Features

- Multi-role Authentication
- Real-time Updates
- Analytics & Reporting
- Responsive Dashboard UI
- Secure Data Management

### 🔧 Backend Server ([PetPaw FastAPI](https://github.com/yewzhihao3/petpaw-fastapi))

The backend is built with FastAPI, providing:

- RESTful API endpoints
- Real-time data processing
- Secure authentication system
- Database management
- File handling
- Business logic implementation
- API documentation with Swagger UI

## 📝 Notes

- The app uses Expo's managed workflow
- Secure storage is implemented for sensitive data
- Location services require appropriate permissions
- Push notifications are handled through Expo's notification system

## 🔒 Environment Setup

Make sure to set up the following environment variables:

- API endpoints configuration
- Sanity.io project configuration
- Maps API keys
- Other service-specific configurations

## 📦 Build and Deploy

To create a production build:

```bash
expo build:android  # For Android
expo build:ios      # For iOS
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
