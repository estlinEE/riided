// Database connection and operations using Supabase
class DatabaseManager {
    constructor() {
        // Initialize Supabase client with provided credentials
        this.supabaseUrl = 'https://frzhlauegrwseqxwxcov.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyemhsYXVlZ3J3c2VxeHd4Y292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDkxOTIsImV4cCI6MjA2NDg4NTE5Mn0.GrCDgO6RMC7AzCrS4HWVpaT_JxjZwrHPE0ALJTOvkHw';
        
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        this.useLocalStorage = true; // Start with localStorage as default
        this.isInitialized = false;
        this.initPromise = this.createTables();
    }

    async createTables() {
        console.log('Database connection established - testing Supabase connection');
        
        // Clear any existing localStorage data to start fresh
        localStorage.removeItem('clothingItems');
        localStorage.removeItem('userProfile');
        
        // Test Supabase connection
        try {
            const { data, error } = await this.supabase.from('clothing_items').select('*').limit(1);
            
            if (error) {
                console.error('Supabase connection error:', error);
                // If there's an authentication or permission error, still try to use Supabase
                if (error.code === '42501' || error.message.includes('permission') || error.message.includes('RLS')) {
                    console.log('RLS policy may need to be configured, but connection established');
                    this.useLocalStorage = false;
                } else {
                    console.log('Falling back to localStorage due to connection error');
                    this.useLocalStorage = true;
                }
            } else {
                console.log('Supabase connection successful');
                this.useLocalStorage = false;
            }
            
            // Test user_profiles table if clothing_items worked
            if (!this.useLocalStorage) {
                const { error: profileError } = await this.supabase.from('user_profiles').select('*').limit(1);
                if (profileError) {
                    console.warn('User profiles table error:', profileError);
                }
            }
            
        } catch (error) {
            console.error('Failed to connect to Supabase:', error);
            this.useLocalStorage = true;
        }
        
        if (this.useLocalStorage) {
            console.log('Using localStorage for data storage');
        } else {
            console.log('Using Supabase for data storage');
        }
        
        this.isInitialized = true;
    }

    // Sync localStorage data to Supabase when connection is established
    async syncLocalStorageToSupabase() {
        if (this.useLocalStorage) return;
        
        const localItems = JSON.parse(localStorage.getItem('clothingItems') || '[]');
        if (localItems.length > 0) {
            console.log('Syncing local items to Supabase...');
            try {
                for (const item of localItems) {
                    await this.addClothingItem(item);
                }
                console.log('Successfully synced all local items to Supabase');
                // Clear localStorage after successful sync
                localStorage.removeItem('clothingItems');
            } catch (error) {
                console.error('Error syncing to Supabase:', error);
            }
        }
    }

    // Clothing items operations
    async getClothingItems(filters = {}) {
        // Wait for initialization to complete
        if (!this.isInitialized) {
            await this.initPromise;
        }
        
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('clothingItems') || '[]');
            return items.filter(item => {
                return (filters.color === 'all' || !filters.color || item.color === filters.color) &&
                       (filters.type === 'all' || !filters.type || item.type === filters.type) &&
                       (filters.home === 'all' || !filters.home || item.home === filters.home);
            });
        }

        try {
            console.log('Fetching items from Supabase with filters:', filters);
            let query = this.supabase.from('clothing_items').select('*');
            
            if (filters.color && filters.color !== 'all') {
                query = query.eq('color', filters.color);
            }
            
            if (filters.type && filters.type !== 'all') {
                query = query.eq('type', filters.type);
            }
            
            if (filters.home && filters.home !== 'all') {
                query = query.eq('home', filters.home);
            }
            
            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching clothing items from Supabase:', error);
                console.error('Error details:', error.message, error.code);
                return [];
            }
            
            console.log('Successfully fetched items from Supabase:', data);
            return data || [];
        } catch (error) {
            console.error('Exception in getClothingItems:', error);
            return [];
        }
    }

    async addClothingItem(item) {
        const newItem = {
            description: item.description,
            color: item.color,
            type: item.type,
            home: item.home,
            image_data: item.imageData,
            uploader: item.uploader || 'Anonymous',
            created_at: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('clothingItems') || '[]');
            newItem.id = Math.floor(Math.random() * 1000000); // Simple random ID for localStorage
            items.unshift(newItem);
            localStorage.setItem('clothingItems', JSON.stringify(items));
            console.log('Item added to localStorage:', newItem);
            return newItem;
        }

        try {
            console.log('Attempting to add item to Supabase:', newItem);
            const { data, error } = await this.supabase
                .from('clothing_items')
                .insert([newItem])
                .select();

            if (error) {
                console.error('Error adding clothing item to Supabase:', error);
                console.error('Error details:', error.message, error.code);
                throw error;
            }

            console.log('Successfully added item to Supabase:', data[0]);
            return data[0];
        } catch (error) {
            console.error('Exception in addClothingItem:', error);
            throw error;
        }
    }

    // User profile operations
    async getUserProfile(userId = 'default') {
        if (this.useLocalStorage) {
            const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
            return profile || { theme: 'banana', language: 'en', user_id: userId };
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching user profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            return null;
        }
    }

    async updateUserProfile(userId = 'default', profile) {
        if (this.useLocalStorage) {
            const userProfile = {
                user_id: userId,
                profile_picture: profile.profilePicture,
                theme: profile.theme,
                language: profile.language,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            return userProfile;
        }

        try {
            // First try to update existing profile
            const { data: updateData, error: updateError } = await this.supabase
                .from('user_profiles')
                .update({
                    profile_picture: profile.profilePicture,
                    theme: profile.theme,
                    language: profile.language,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select();

            if (updateError && updateError.code !== 'PGRST116') {
                // If update fails and it's not "no rows" error, try insert
                const { data: insertData, error: insertError } = await this.supabase
                    .from('user_profiles')
                    .insert({
                        user_id: userId,
                        profile_picture: profile.profilePicture,
                        theme: profile.theme,
                        language: profile.language,
                        updated_at: new Date().toISOString()
                    })
                    .select();

                if (insertError) {
                    console.error('Error inserting user profile:', insertError);
                    throw insertError;
                }
                return insertData[0];
            }

            if (updateData && updateData.length > 0) {
                return updateData[0];
            }

            // If no rows were updated, insert new profile
            const { data: insertData, error: insertError } = await this.supabase
                .from('user_profiles')
                .insert({
                    user_id: userId,
                    profile_picture: profile.profilePicture,
                    theme: profile.theme,
                    language: profile.language,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (insertError) {
                console.error('Error inserting user profile:', insertError);
                throw insertError;
            }

            return insertData[0];
        } catch (error) {
            console.error('Error in updateUserProfile:', error);
            throw error;
        }
    }

    // Update existing clothing item
    async updateClothingItem(itemId, updatedData) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('clothingItems') || '[]');
            const index = items.findIndex(item => item.id === itemId);
            
            if (index !== -1) {
                items[index] = { ...items[index], ...updatedData, updated_at: new Date().toISOString() };
                localStorage.setItem('clothingItems', JSON.stringify(items));
                console.log('Item updated in localStorage:', items[index]);
                return items[index];
            }
            throw new Error('Item not found');
        }

        try {
            console.log('Updating item in Supabase:', itemId, updatedData);
            const { data, error } = await this.supabase
                .from('clothing_items')
                .update({
                    description: updatedData.description,
                    color: updatedData.color,
                    type: updatedData.type,
                    home: updatedData.home,
                    ...(updatedData.imageData && { image_data: updatedData.imageData }),
                    updated_at: new Date().toISOString()
                })
                .eq('id', itemId)
                .select();

            if (error) {
                console.error('Error updating clothing item in Supabase:', error);
                throw error;
            }

            console.log('Successfully updated item in Supabase:', data[0]);
            return data[0];
        } catch (error) {
            console.error('Exception in updateClothingItem:', error);
            throw error;
        }
    }

    // Delete clothing item
    async deleteClothingItem(itemId) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('clothingItems') || '[]');
            const filteredItems = items.filter(item => item.id !== itemId);
            localStorage.setItem('clothingItems', JSON.stringify(filteredItems));
            console.log('Item deleted from localStorage');
            return true;
        }

        try {
            console.log('Deleting item from Supabase:', itemId);
            const { error } = await this.supabase
                .from('clothing_items')
                .delete()
                .eq('id', itemId);

            if (error) {
                console.error('Error deleting clothing item from Supabase:', error);
                throw error;
            }

            console.log('Successfully deleted item from Supabase');
            return true;
        } catch (error) {
            console.error('Exception in deleteClothingItem:', error);
            throw error;
        }
    }

    // Utility function to convert file to base64 with compression
    async fileToBase64(file, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions to maintain aspect ratio (smaller for storage)
                const maxWidth = 400;
                const maxHeight = 300;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            
            img.onerror = reject;
            
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Initialize database manager
const dbManager = new DatabaseManager();
