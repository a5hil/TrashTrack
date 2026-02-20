# Backend Integration Testing Checklist

## Pre-Testing Verification

- [ ] MongoDB URI is correct in `.env.local`
- [ ] Development server is running (`npm run dev`)
- [ ] No TypeScript/ESLint errors in console
- [ ] MongoDB cluster is accessible (test at mongodb.com)

## Test Case 1: Add a Bin

### Steps:
1. Open dashboard (http://localhost:3000/dashboard)
2. Click "Add Bin" button
3. Enter:
   - Location Name: "Test Park"
   - Category: "Recyclable"
   - Use GPS or select coordinates
4. Click "Add Bin"

### Expected Results:
- [ ] Success message appears
- [ ] Bin appears on map immediately
- [ ] Bin appears in "View Bins List"
- [ ] Map zooms to bin location

### Verify in Browser DevTools:
- [ ] Network tab shows `POST /api/bins` - Status 201
- [ ] Response has `success: true` and `data._id`
- [ ] Console shows no errors

---

## Test Case 2: Bins Persist After Refresh

### Steps:
1. Add a bin (from Test Case 1)
2. Wait 2 seconds for state to update
3. Press **Cmd+R** (Mac) or **Ctrl+R** (Windows)
4. Wait for page to reload

### Expected Results:
- [ ] Page loads with "Loading map..." message
- [ ] Previous bins are displayed after load completes
- [ ] Bin count shows correct number

### Verify in Browser DevTools:
- [ ] Network tab shows `GET /api/bins` - Status 200
- [ ] Response has array of bins with `_id`, `coordinates`, `category`
- [ ] Console shows "✅ MongoDB connected successfully"

---

## Test Case 3: Delete a Bin

### Steps:
1. Open "View Bins List"
2. Find a bin you want to delete
3. Click "Remove" button
4. Confirm action if prompted

### Expected Results:
- [ ] Bin disappears from list immediately
- [ ] Bin disappears from map
- [ ] Success message appears
- [ ] Bin count decreases

### Verify in Browser DevTools:
- [ ] Network tab shows `DELETE /api/bins?id=...` - Status 200
- [ ] Bin is no longer visible on next refresh

---

## Test Case 4: Verify MongoDB Data

### Steps:
1. Go to https://cloud.mongodb.com
2. Login with credentials
3. Select "Cluster0"
4. Go to "Collections" or "Browse Collections"
5. Find `trashtrack` database → `bins` collection
6. View documents

### Expected Results:
- [ ] Bins you added appear in collection
- [ ] Each bin has: `_id`, `locationName`, `coordinates`, `category`, `createdAt`
- [ ] Document count matches number of bins in app

---

## Test Case 5: Multiple Categories

### Steps:
1. Add bins with each category:
   - [ ] General Waste
   - [ ] Recyclable
   - [ ] Organic
   - [ ] Hazardous
   - [ ] E-waste
   - [ ] Medical
2. View bins list
3. Refresh page

### Expected Results:
- [ ] All bins display with correct icons
- [ ] All bins persist after refresh
- [ ] Bins on map show correct colors
- [ ] Each bin in list shows correct category tag

---

## Test Case 6: Coordinates Handling

### Steps:
1. Add a bin with GPS
2. Add a bin by selecting on map
3. Add a bin with manual coordinates
4. Open bin details (click on marker)

### Expected Results:
- [ ] GPS bin shows user's location coordinates
- [ ] Map-selected bin shows exact clicked location
- [ ] Manual bin shows entered coordinates
- [ ] Coordinates display in details panel (6 decimal places)
- [ ] Copy button works for coordinates

---

## Common Issues & Solutions

### Issue: "Failed to fetch bins"
**Solution:**
1. Check `.env.local` for correct MONGODB_URI
2. Verify MongoDB cluster is running
3. Check network tab for API response
4. Look for error message in console

### Issue: Bins appear then disappear
**Solution:**
- Check browser console for fetch errors
- Verify API response has `success: true`
- Check MongoDB credentials are correct

### Issue: "Cannot read property '_id'"
**Solution:**
- Ensure bins are formatted with `id: bin._id` when fetching
- Check that API returns bins with all required fields
- Restart development server

### Issue: Coordinates are backwards
**Solution:**
- User inputs [latitude, longitude]
- API converts to [longitude, latitude] for GeoJSON
- Frontend converts back to [latitude, longitude] for map
- This is automatic and should work without manual fixes

### Issue: Bin added but doesn't appear on map
**Solution:**
- Check that coordinates are within valid ranges
- Verify map center includes the coordinates
- Check that bin status is 'active'
- Try zooming out on map

---

## Performance Checks

- [ ] Adding a bin takes < 2 seconds
- [ ] Page refresh takes < 3 seconds to load all bins
- [ ] Deleting a bin is instant (< 1 second)
- [ ] Switching between up to 50 bins is smooth
- [ ] Map performs smoothly with 10+ markers

---

## Browser Console Checks

After completing all tests, console should show:
- [ ] No red error messages
- [ ] "✅ MongoDB connected successfully" on refresh
- [ ] Network requests succeeding (Status 200, 201, etc.)

---

## Final Verification

After all tests pass:
1. [ ] Restart development server
2. [ ] Clear browser cache (DevTools → Application → Clear)
3. [ ] Reload page
4. [ ] Verify bins still load
5. [ ] Add new bin and refresh
6. [ ] Verify new bin persists

---

## If Tests Fail

1. **Check `.env.local` file exists** in project root
2. **Verify MongoDB cluster is accessible**
3. **Restart development server** (`Ctrl+C` then `npm run dev`)
4. **Clear browser cache**
5. **Check browser console** for specific error messages
6. **Check Network tab** in DevTools for API responses
7. **Verify coordinates format**: [latitude, longitude]

---

**Status:** Ready to test! 🚀
