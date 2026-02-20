# Debugging 400 Bad Request Error

## What to Look For

When you try to add a bin and get a 400 error, check the browser console for detailed logs:

### Console Output You Should See:

#### Frontend (Browser Console):
```
Creating bin with data: {
  locationName: "Your Location",
  category: "Recyclable",
  coordinates: [28.6139, 77.2090]
}
Create response status: 400 (or 201 if successful)
Create response data: {
  success: false,
  error: "Validation failed: ..."
}
```

#### Backend (Terminal Where npm run dev is Running):
```
POST /api/bins - Connecting to DB...
Database connected
Request body received: { locationName, category, coordinates }
Creating bin with validated data: { ... }
Bin created successfully: 612a3b4c5d6e7f8g9h0i
```

## Possible Error Messages

### 1. "Please provide: locationName, coordinates, category"
**Cause:** Missing required field
**Fix:** Make sure all three fields are filled in the form

### 2. "Coordinates must be [latitude, longitude]"
**Cause:** Coordinates is not an array or has wrong format
**Fix:** Ensure you use GPS, pick from map, or enter lat/lng coordinates

### 3. "Coordinates must be numbers"
**Cause:** Coordinates contain text or non-numeric values
**Fix:** Check that coordinates are numeric values

### 4. "Invalid coordinate values (lat: -90 to 90, lng: -180 to 180)"
**Cause:** Coordinates are outside valid geographic range
**Fix:** Use valid India coordinates (approx. lat: 8-35, lng: 68-97)

### 5. "Validation failed: ..."
**Cause:** MongoDB schema validation failed
**Fix:** Check browser console for specific field that failed

### 6. "Database error" or "Connection failed"
**Cause:** MongoDB connection issue
**Fix:** Check:
- MongoDB URI in `.env.local`
- MongoDB cluster is active
- Internet connection
- Check server terminal for specific error

## How to Test

1. **Open browser DevTools** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Try to add a bin** with test data:
   - Location Name: "Test Park"
   - Category: "Recyclable"
   - Coordinates: 28.6139, 77.2090 (Delhi)
4. **Watch console output** for detailed error message
5. **Copy the error** and fix based on the messages above

## Easy Test Data

Use these coordinates for India:
- **Delhi**: 28.6139, 77.2090
- **Mumbai**: 19.0760, 72.8777
- **Bangalore**: 12.9716, 77.5946
- **Hyderabad**: 17.3850, 78.4867

## Still Failing?

1. Check `.env.local` exists: `cat .env.local`
2. Verify MongoDB is running
3. Check server logs in terminal for error details
4. Look at browser network tab (right-click → Inspect → Network)
5. Find the POST request to `/api/bins` and check response body
