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
      if (!response.ok) throw new Error('Failed to fetch bins');
      return await response.json();
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
