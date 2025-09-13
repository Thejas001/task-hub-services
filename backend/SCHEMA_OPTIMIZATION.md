# Employee Table Optimization for Worker Marketplace

## Overview
The employee table has been optimized to better support a worker marketplace application, removing HR-specific fields and adding marketplace-specific features.

## Key Changes

### Removed Fields (HR-specific)
- `position` - Not relevant for marketplace workers
- `department` - Not applicable to independent contractors
- `salary` - Replaced with `hourlyRate` for marketplace pricing
- `joiningDate` - Not relevant for marketplace workers
- `Name` - Redundant with `firstName` and `lastName`
- `reportingManagerId` - Not applicable to independent workers
- `shiftName`, `shiftStartTime`, `shiftEndTime` - Replaced with flexible availability system

### Added Fields (Marketplace-specific)

#### Professional Information
- `hourlyRate` - DECIMAL(10,2) - Worker's hourly rate
- `bio` - TEXT - Professional bio/description
- `city` - VARCHAR(255) - City for better location filtering

#### Skills and Expertise
- `skills` - JSON - Array of skills: ["Emergency Repairs", "Pipe Installation"]
- `certifications` - JSON - Array of certifications: ["Licensed Plumber", "EPA Certified"]

#### Availability Management
- `isAvailable` - BOOLEAN - Whether worker is currently available
- `availableDays` - JSON - Days of week available: ["Monday", "Tuesday"]
- `availableTimeSlots` - JSON - Time slots: [{"start": "09:00", "end": "17:00"}]

#### Rating and Reviews
- `rating` - DECIMAL(3,2) - Overall rating (0.00 to 5.00)
- `totalReviews` - INT - Total number of reviews

#### Verification Status
- `isVerified` - BOOLEAN - Whether worker is verified
- `isBackgroundChecked` - BOOLEAN - Whether background check is complete

## New Tables

### WorkerReviews
Stores customer reviews for workers:
- `workerId` - Reference to worker
- `customerId` - Reference to customer
- `bookingId` - Reference to booking (optional)
- `rating` - 1-5 star rating
- `comment` - Review text

### WorkerAvailability
Manages detailed availability schedules:
- `workerId` - Reference to worker
- `dayOfWeek` - Day of the week
- `startTime` - Start time
- `endTime` - End time
- `isAvailable` - Whether this slot is available

### WorkerPortfolio
Stores worker's portfolio images:
- `workerId` - Reference to worker
- `imageUrl` - URL to portfolio image
- `title` - Image title
- `description` - Image description
- `workType` - Type of work shown

## Sample Data Structure

```json
{
  "id": 1,
  "userId": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "mobileNumber": "(555) 123-4567",
  "age": 35,
  "address": "123 Main Street",
  "state": "California",
  "pinCode": "90210",
  "city": "Los Angeles",
  "nationality": "American",
  "workType": "Plumbing",
  "workExperience": "8 years",
  "hourlyRate": 50.00,
  "bio": "Professional plumber with expertise in residential and commercial plumbing systems...",
  "skills": ["Emergency Repairs", "Pipe Installation", "Leak Detection", "Water Heater Repair"],
  "certifications": ["Licensed Plumber", "EPA Certified", "OSHA Safety Trained"],
  "isAvailable": true,
  "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "availableTimeSlots": [{"start": "09:00", "end": "17:00"}],
  "applicationStatus": "accepted",
  "rating": 4.8,
  "totalReviews": 127,
  "isVerified": true,
  "isBackgroundChecked": true,
  "profilePic": "/uploads/profile-pics/john-smith.jpg",
  "certificate": "/uploads/certificates/john-smith-cert.pdf",
  "aadharCard": "/uploads/documents/john-smith-aadhar.pdf",
  "panCard": "/uploads/documents/john-smith-pan.pdf"
}
```

## Migration Instructions

1. **Backup your current data:**
   ```sql
   CREATE TABLE Employee_backup AS SELECT * FROM Employee;
   ```

2. **Run the migration:**
   ```bash
   cd backend
   node run-migration.js
   ```

3. **Verify the migration:**
   ```sql
   DESCRIBE Employee;
   SELECT * FROM Employee LIMIT 1;
   ```

## API Updates Required

The following API endpoints need to be updated to work with the new schema:

### Employee Registration
- Update to handle new fields (hourlyRate, bio, skills, certifications, etc.)
- Support for availability data
- File upload for portfolio images

### Worker Search
- Filter by workType, state, city
- Filter by rating range
- Filter by availability
- Filter by hourly rate range

### Worker Profile Display
- Include rating and review count
- Display skills and certifications
- Show availability status
- Display portfolio images

### Review System
- Add/update worker reviews
- Calculate average ratings
- Display review history

## Benefits of New Schema

1. **Better User Experience**: Rich worker profiles with ratings, skills, and portfolios
2. **Improved Search**: Advanced filtering by location, skills, ratings, and availability
3. **Trust Building**: Verification status and background check indicators
4. **Flexible Availability**: Detailed availability management
5. **Performance**: Optimized indexes for common search patterns
6. **Scalability**: JSON fields for flexible data storage

## Indexes Added

- `idx_workType` - For filtering by work type
- `idx_state` - For location-based filtering
- `idx_city` - For city-based filtering
- `idx_applicationStatus` - For admin approval workflows
- `idx_rating` - For rating-based sorting
- `idx_isAvailable` - For availability filtering
- `idx_workType_state` - Composite index for common search patterns
- `idx_rating_isAvailable` - Composite index for featured workers

This optimization transforms the employee table from an HR-focused structure to a marketplace-optimized worker profile system.
