// Supabase client for Chrome extension
const SUPABASE_URL = 'https://krdwypftyokqsffxoobk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd5cGZ0eW9rcXNmZnhvb2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjU4MzUsImV4cCI6MjA3NzMwMTgzNX0.PcZThTD8TcYa2RJD2vSoHaOSXsfJTjLeUUN0UOg0vbs';

// Simple Supabase client implementation for Chrome extension
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.authToken = null;
  }

  async signIn(email, password) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Login failed');
    }

    const data = await response.json();
    this.authToken = data.access_token;
    
    // Store session
    await chrome.storage.local.set({
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      }
    });

    return data;
  }

  async signOut() {
    this.authToken = null;
    await chrome.storage.local.remove('session');
  }

  async getSession() {
    const result = await chrome.storage.local.get('session');
    if (result.session) {
      this.authToken = result.session.access_token;
      return result.session;
    }
    return null;
  }

  async query(table, options = {}) {
    const session = await this.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    let url = `${this.url}/rest/v1/${table}`;
    const headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // Handle delete
    if (options.delete) {
      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value], index) => {
          url += `${index === 0 ? '?' : '&'}${key}=eq.${value}`;
        });
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      return;
    }

    // Handle select
    if (options.select) {
      url += `?select=${options.select}`;
    } else {
      url += '?select=*';
    }

    // Handle filters
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        url += `&${key}=eq.${value}`;
      });
    }

    // Handle ordering
    if (options.order) {
      url += `&order=${options.order}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async insert(table, data) {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        'Accept-Profile': 'public',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Insert failed');
    }

    return await response.json();
  }

  async invokeFunction(functionName, body) {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.url}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Function call failed');
    }

    return await response.json();
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
