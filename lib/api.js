// API Service for bin operations
// Use relative URLs to avoid CORS issues with different IPs/domains
const getApiUrl = (endpoint) => `/api/${endpoint}`;

export const binAPI = {
  // Get all bins or filter by category/status/location
  async getBins(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.latitude) params.append('latitude', filters.latitude);
      if (filters.longitude) params.append('longitude', filters.longitude);
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);

      const response = await fetch(getApiUrl(`bins?${params.toString()}`))
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Failed to fetch bins: ${response.status}`);
        } catch (e) {
          throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
        }
      }
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text.substring(0, 200));
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Error fetching bins:', error);
      throw error;
    }
  },

  // Create a new bin
  async createBin(binData) {
    try {
      console.log('Creating bin with data:', binData);
      const response = await fetch(getApiUrl('bins'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(binData)
      });
      console.log('Create response status:', response.status);
      const data = await response.json();
      console.log('Create response data:', data);
      if (!response.ok) throw new Error(data.error || 'Failed to create bin');
      return data;
    } catch (error) {
      console.error('Error creating bin:', error);
      throw error;
    }
  },

  // Get a single bin by ID
  async getBinById(id) {
    try {
      const response = await fetch(getApiUrl(`bins?id=${id}`));
      if (!response.ok) throw new Error('Failed to fetch bin');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bin:', error);
      throw error;
    }
  },

  // Update bin information
  async updateBin(id, updateData) {
    try {
      const response = await fetch(getApiUrl(`bins?id=${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('Failed to update bin');
      return await response.json();
    } catch (error) {
      console.error('Error updating bin:', error);
      throw error;
    }
  },

  // Update bin capacity
  async updateBinCapacity(id, capacity) {
    try {
      const response = await fetch(getApiUrl(`bins?id=${id}&capacity=true`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ capacity })
      });
      if (!response.ok) throw new Error('Failed to update capacity');
      return await response.json();
    } catch (error) {
      console.error('Error updating capacity:', error);
      throw error;
    }
  },

  // Delete a bin
  async deleteBin(id) {
    try {
      const response = await fetch(getApiUrl(`bins?id=${id}`), {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete bin');
      return await response.json();
    } catch (error) {
      console.error('Error deleting bin:', error);
      throw error;
    }
  },

  // Get statistics
  async getStatistics() {
    try {
      const response = await fetch(getApiUrl('bins?stats=true'));
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
};

// API Service for waste reports
export const wasteAPI = {
  // Get all waste reports for a user
  async getReports(userId) {
    try {
      const response = await fetch(getApiUrl(`waste?userId=${userId}`));
      if (!response.ok) throw new Error('Failed to fetch reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Submit a new waste report
  async submitReport(reportData) {
    try {
      const response = await fetch(getApiUrl('waste'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error('Failed to submit report');
      return await response.json();
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  // Verify a waste report (admin only)
  async verifyReport(reportId) {
    try {
      const response = await fetch(getApiUrl('waste'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportId })
      });
      if (!response.ok) throw new Error('Failed to verify report');
      return await response.json();
    } catch (error) {
      console.error('Error verifying report:', error);
      throw error;
    }
  },

  // Get waste hotspot reports with priority clustering
  async getWasteHotspots(radius = 200) {
    try {
      const response = await fetch(getApiUrl(`waste-hotspots?radius=${radius}`));
      if (!response.ok) throw new Error('Failed to fetch hotspots');
      return await response.json();
    } catch (error) {
      console.error('Error fetching hotspots:', error);
      throw error;
    }
  }
};
