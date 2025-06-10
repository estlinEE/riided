// Main application logic
class ClothingInventoryApp {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.currentFilters = {
            color: 'all',
            type: 'all',
            home: 'all'
        };
        this.clothingItems = [];
        
        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        this.initializeLanguage();
        this.initializeFilters();
        this.initializeAdminForm();
        
        // Load items and profile in parallel for faster loading
        await Promise.all([
            this.loadClothingItems(),
            this.loadUserProfile()
        ]);
        
        this.hideLoading();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Language switcher
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Theme toggle button
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const themeDropdown = document.getElementById('theme-dropdown');
        
        themeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            themeDropdown.classList.remove('show');
        });

        // Theme options
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.getAttribute('data-theme');
                themeManager.applyTheme(theme);
                
                // Update active state
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                
                // Close dropdown
                themeDropdown.classList.remove('show');
                
                this.saveUserProfile();
            });
        });

        // Edit form functionality
        const editForm = document.getElementById('edit-form');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const editFileUploadBtn = document.getElementById('edit-file-upload-btn');
        const editItemImage = document.getElementById('edit-item-image');
        
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleItemUpdate();
            });
        }
        
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }
        
        if (editFileUploadBtn) {
            editFileUploadBtn.addEventListener('click', () => {
                editItemImage.click();
            });
        }
        
        if (editItemImage) {
            editItemImage.addEventListener('change', (e) => {
                this.showEditImagePreview(e.target.files[0]);
                this.updateEditFileUploadButton(e.target.files[0]);
            });
        }

        // Admin form
        document.getElementById('upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleClothingUpload();
        });

        // Custom file upload button
        document.getElementById('file-upload-btn').addEventListener('click', () => {
            document.getElementById('item-image').click();
        });

        // Image preview in admin form
        document.getElementById('item-image').addEventListener('change', (e) => {
            this.showImagePreview(e.target.files[0]);
            this.updateFileUploadButton(e.target.files[0]);
        });

        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAdminTab(e.target.getAttribute('data-tab'));
            });
        });



        // Export/Import data
        const exportBtn = document.querySelector('[data-translate="admin.exportData"]');
        const importBtn = document.querySelector('[data-translate="admin.importData"]');
        const importFile = document.getElementById('import-file');
        
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
        if (importBtn) importBtn.addEventListener('click', () => importFile?.click());
        if (importFile) importFile.addEventListener('change', (e) => this.importData(e.target.files[0]));

        // Filter buttons
        this.setupFilterListeners();
    }

    setupFilterListeners() {
        // Color filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-filter')) {
                this.setActiveFilter('color', e.target.getAttribute('data-color'));
                this.filterItems();
            }
        });

        // Type filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('type-filter')) {
                this.setActiveFilter('type', e.target.getAttribute('data-type'));
                this.filterItems();
            }
        });

        // Home filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('home-filter')) {
                this.setActiveFilter('home', e.target.getAttribute('data-home'));
                this.filterItems();
            }
        });
    }

    setActiveFilter(filterType, value) {
        // Remove active class from all filters of this type
        document.querySelectorAll(`.${filterType}-filter`).forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to selected filter
        document.querySelector(`.${filterType}-filter[data-${filterType}="${value}"]`).classList.add('active');

        // Update current filters
        this.currentFilters[filterType] = value;
    }

    showPage(pageId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Show selected page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageId}-page`).classList.add('active');
    }

    initializeLanguage() {
        document.getElementById('language-select').value = this.currentLanguage;
        updateTranslations(this.currentLanguage);
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        updateTranslations(language);
        this.saveUserProfile();
    }

    initializeFilters() {
        this.createColorFilters();
        this.createTypeFilters();
        this.createHomeFilters();
    }

    createColorFilters() {
        const container = document.getElementById('color-filters');
        const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'navy'];
        
        const colorTranslations = {
            red: { en: 'Red', et: 'Punane' },
            blue: { en: 'Blue', et: 'Sinine' },
            green: { en: 'Green', et: 'Roheline' },
            yellow: { en: 'Yellow', et: 'Kollane' },
            black: { en: 'Black', et: 'Must' },
            white: { en: 'White', et: 'Valge' },
            gray: { en: 'Gray', et: 'Hall' },
            brown: { en: 'Brown', et: 'Pruun' },
            pink: { en: 'Pink', et: 'Roosa' },
            purple: { en: 'Purple', et: 'Lilla' },
            orange: { en: 'Orange', et: 'Oranž' },
            navy: { en: 'Navy', et: 'Tumesinine' }
        };
        
        colors.forEach(color => {
            const button = document.createElement('button');
            button.className = 'color-filter';
            button.setAttribute('data-color', color);
            button.innerHTML = `
                <span class="color-dot" style="background-color: ${color}"></span>
                <span>${colorTranslations[color]?.[this.currentLanguage] || color}</span>
            `;
            container.appendChild(button);
        });
    }

    createTypeFilters() {
        const container = document.getElementById('type-filters');
        const types = Object.keys(translations[this.currentLanguage].clothingTypes);
        
        types.forEach(type => {
            const button = document.createElement('button');
            button.className = 'type-filter';
            button.setAttribute('data-type', type);
            button.setAttribute('data-translate', `clothingTypes.${type}`);
            button.textContent = translate(`clothingTypes.${type}`, this.currentLanguage);
            container.appendChild(button);
        });
    }

    createHomeFilters() {
        const container = document.getElementById('home-filters');
        const homes = Object.keys(translations[this.currentLanguage].homeLocations);
        
        homes.forEach(home => {
            const button = document.createElement('button');
            button.className = 'home-filter';
            button.setAttribute('data-home', home);
            button.setAttribute('data-translate', `homeLocations.${home}`);
            button.textContent = translate(`homeLocations.${home}`, this.currentLanguage);
            container.appendChild(button);
        });
    }

    initializeAdminForm() {
        // Populate type select
        const typeSelect = document.getElementById('item-type');
        typeSelect.innerHTML = `<option value="">${translate('messages.selectType', this.currentLanguage)}</option>`;
        
        Object.keys(translations[this.currentLanguage].clothingTypes).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = translations[this.currentLanguage].clothingTypes[key];
            typeSelect.appendChild(option);
        });

        // Populate home select
        const homeSelect = document.getElementById('item-home');
        homeSelect.innerHTML = `<option value="">${translate('messages.selectHome', this.currentLanguage)}</option>`;
        
        Object.keys(translations[this.currentLanguage].homeLocations).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = translations[this.currentLanguage].homeLocations[key];
            homeSelect.appendChild(option);
        });
    }

    async loadClothingItems() {
        this.showLoading();
        try {
            // Wait for database initialization
            if (!dbManager.isInitialized) {
                await dbManager.initPromise;
            }
            // Always get fresh data from database
            this.clothingItems = await dbManager.getClothingItems();
            console.log('Loaded items:', this.clothingItems); // Debug log
            this.filterItems(); // Use filterItems instead of direct render to respect current filters
            
            // Update admin tabs if they're active
            if (document.getElementById('stats-tab')?.classList.contains('active')) {
                this.updateStatistics();
            }
            
            if (document.getElementById('manage-tab')?.classList.contains('active')) {
                this.loadAdminItemsList();
            }
        } catch (error) {
            console.error('Error loading clothing items:', error);
        } finally {
            this.hideLoading();
        }
    }

    filterItems() {
        if (!this.clothingItems || this.clothingItems.length === 0) {
            this.renderClothingItems([]);
            return;
        }
        
        const filteredItems = this.clothingItems.filter(item => {
            const colorMatch = this.currentFilters.color === 'all' || item.color === this.currentFilters.color;
            const typeMatch = this.currentFilters.type === 'all' || item.type === this.currentFilters.type;
            const homeMatch = this.currentFilters.home === 'all' || item.home === this.currentFilters.home;
            
            return colorMatch && typeMatch && homeMatch;
        });
        
        console.log('Filtering items:', this.clothingItems.length, 'filtered to:', filteredItems.length);
        this.renderClothingItems(filteredItems);
    }

    renderClothingItems(items) {
        const container = document.getElementById('results-grid');
        const noResults = document.getElementById('no-results');
        
        // Clear existing items except no-results element
        container.querySelectorAll('.clothing-item').forEach(item => item.remove());
        
        if (items.length === 0) {
            noResults.style.display = 'block';
            this.hideLoading();
            return;
        }
        
        noResults.style.display = 'none';
        
        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'chunked-loading';
        loadingIndicator.innerHTML = '<p>Loading Clotches...</p>';
        loadingIndicator.style.cssText = `
            text-align: center;
            padding: 20px;
            color: var(--text-secondary);
            font-style: italic;
            grid-column: 1 / -1;
        `;
        container.appendChild(loadingIndicator);
        
        // Load items in chunks of 3
        let currentIndex = 0;
        const chunkSize = 3;
        
        const loadNextChunk = () => {
            const chunk = items.slice(currentIndex, currentIndex + chunkSize);
            
            chunk.forEach((item, index) => {
                setTimeout(() => {
                    const itemElement = this.createClothingItemElement(item);
                    container.insertBefore(itemElement, loadingIndicator);
                    
                    // Hide main loading overlay after first 3 items
                    if (currentIndex === 0 && index === 2) {
                        this.hideLoading();
                    }
                }, index * 100);
            });
            
            currentIndex += chunkSize;
            
            if (currentIndex < items.length) {
                setTimeout(loadNextChunk, 300);
            } else {
                setTimeout(() => {
                    if (loadingIndicator.parentNode) {
                        loadingIndicator.remove();
                    }
                }, 300);
            }
        };
        
        loadNextChunk();
    }

    createClothingItemElement(item) {
        const element = document.createElement('div');
        element.className = 'clothing-item';
        
        element.innerHTML = `
            <img src="${item.image_data}" alt="${item.description}" class="item-image">
            <div class="item-details">
                <div class="item-description">${item.description}</div>
                <div class="item-metadata">
                    <span class="metadata-tag">${item.color}</span>
                    <span class="metadata-tag">${translate(`clothingTypes.${item.type}`, this.currentLanguage)}</span>
                    <span class="metadata-tag">${translate(`homeLocations.${item.home}`, this.currentLanguage)}</span>
                </div>
                <div class="item-uploader">Uploaded by: ${item.uploader}</div>
            </div>
        `;
        
        return element;
    }

    async handleClothingUpload() {
        this.showLoading();
        
        try {
            const form = document.getElementById('upload-form');
            const imageFile = document.getElementById('item-image').files[0];
            
            if (!imageFile) {
                alert('Please select an image');
                this.hideLoading();
                return;
            }
            
            // Validate other required fields
            const description = document.getElementById('item-description').value;
            const color = document.getElementById('item-color').value;
            const type = document.getElementById('item-type').value;
            const home = document.getElementById('item-home').value;
            
            if (!description || !color || !type || !home) {
                alert('Please fill in all required fields');
                this.hideLoading();
                return;
            }

            const imageData = await dbManager.fileToBase64(imageFile, 0.3);
            
            const item = {
                description: description,
                color: color,
                type: type,
                home: home,
                imageData: imageData,
                uploader: 'Current User'
            };

            await dbManager.addClothingItem(item);
            
            // Reset form
            form.reset();
            document.getElementById('image-preview').style.display = 'none';
            this.updateFileUploadButton(null);
            
            // Reload items
            await this.loadClothingItems();
            
            // Show success message
            alert(translate('messages.uploadSuccess', this.currentLanguage));
            
            // Switch to clothes page
            this.showPage('clothes');
            
            // Update statistics if on stats tab
            this.updateStatistics();
            
        } catch (error) {
            console.error('Error uploading item:', error);
            alert(translate('messages.uploadError', this.currentLanguage));
        } finally {
            this.hideLoading();
        }
    }

    async handleItemUpdate() {
        const itemId = document.getElementById('edit-item-id').value;
        const imageFile = document.getElementById('edit-item-image').files[0];
        const description = document.getElementById('edit-item-description').value;
        const color = document.getElementById('edit-item-color').value;
        const type = document.getElementById('edit-item-type').value;
        const home = document.getElementById('edit-item-home').value;

        if (!description || !color || !type || !home) {
            alert('Please fill in all required fields.');
            return;
        }

        this.showLoading();

        try {
            const updateData = {
                description,
                color,
                type,
                home
            };

            // Only update image if a new one was selected
            if (imageFile) {
                updateData.imageData = await dbManager.fileToBase64(imageFile, 0.3
                                                                   
                                                                   
                                                                   
                                                                   );
            }

            await dbManager.updateClothingItem(itemId, updateData);
            
            // Reset edit form
            this.cancelEdit();
            
            // Reload items
            await this.loadClothingItems();
            await this.loadAdminItemsList();
            
            alert('Item updated successfully!');
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Error updating item. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    editItem(item) {
        // Populate edit form
        document.getElementById('edit-item-id').value = item.id;
        document.getElementById('edit-item-description').value = item.description;
        document.getElementById('edit-item-color').value = item.color;
        document.getElementById('edit-item-type').value = item.type;
        document.getElementById('edit-item-home').value = item.home;
        
        // Show current image
        const currentImagePreview = document.getElementById('current-image-preview');
        currentImagePreview.innerHTML = `<img src="${item.image_data || item.imageData}" alt="Current image">`;
        
        // Show edit form and hide instructions
        document.getElementById('edit-form').style.display = 'block';
        document.getElementById('edit-instructions').style.display = 'none';
        
        // Switch to edit tab
        this.switchAdminTab('edit');
    }

    cancelEdit() {
        document.getElementById('edit-form').style.display = 'none';
        document.getElementById('edit-instructions').style.display = 'block';
        document.getElementById('edit-form').reset();
        document.getElementById('current-image-preview').innerHTML = '';
        document.getElementById('edit-image-preview').style.display = 'none';
        this.updateEditFileUploadButton(null);
    }

    showEditImagePreview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('edit-image-preview');
                preview.innerHTML = `<img src="${e.target.result}" alt="New image preview">`;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    updateEditFileUploadButton(file) {
        const button = document.getElementById('edit-file-upload-btn');
        const textElement = button.querySelector('.file-upload-text');
        const iconElement = button.querySelector('.file-upload-icon');
        
        if (file) {
            button.classList.add('has-file');
            textElement.textContent = file.name;
            iconElement.textContent = '✅';
        } else {
            button.classList.remove('has-file');
            textElement.textContent = 'Choose new image (optional)';
            iconElement.textContent = '📸';
        }
    }

    switchAdminTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load specific tab content
        if (tabName === 'stats') {
            this.updateStatistics();
        } else if (tabName === 'manage') {
            this.loadAdminItemsList();
        }
    }

    async updateStatistics() {
        const items = await dbManager.getClothingItems();
        
        // Update basic stats
        document.getElementById('total-items').textContent = items.length;
        
        // Count unique values
        const colors = new Set(items.map(item => item.color));
        const types = new Set(items.map(item => item.type));
        const homes = new Set(items.map(item => item.home));
        
        document.getElementById('colors-count').textContent = colors.size;
        document.getElementById('types-count').textContent = types.size;
        document.getElementById('homes-count').textContent = homes.size;
        
        // Create simple charts
        this.createSimpleChart('color-chart', items, 'color');
        this.createSimpleChart('type-chart', items, 'type');
    }

    createSimpleChart(containerId, items, property) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const counts = {};
        items.forEach(item => {
            counts[item[property]] = (counts[item[property]] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(counts));
        
        container.innerHTML = Object.entries(counts)
            .map(([key, count]) => {
                const height = (count / maxCount) * 100;
                return `
                    <div style="
                        background: var(--primary-color);
                        height: ${height}%;
                        min-height: 20px;
                        width: 30px;
                        border-radius: 4px;
                        display: flex;
                        align-items: end;
                        justify-content: center;
                        color: white;
                        font-size: 12px;
                        position: relative;
                    " title="${key}: ${count}">
                        <span style="position: absolute; bottom: -20px; color: var(--text-color); white-space: nowrap;">
                            ${key.substring(0, 3)}
                        </span>
                        ${count}
                    </div>
                `;
            })
            .join('');
    }

    async loadAdminItemsList() {
        const items = await dbManager.getClothingItems();
        const container = document.getElementById('admin-items-list');
        if (!container) return;
        
        // Clear container first
        container.innerHTML = '';
        
        if (items.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No items found.</p>';
            return;
        }
        
        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading items...</p>';
        container.appendChild(loadingIndicator);
        
        // Load items in chunks for better performance
        let currentIndex = 0;
        const chunkSize = 5;
        
        const loadNextChunk = () => {
            const chunk = items.slice(currentIndex, currentIndex + chunkSize);
            
            chunk.forEach((item, index) => {
                setTimeout(() => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'admin-item';
                    itemElement.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        padding: 15px;
                        margin: 10px 0;
                        background: var(--surface-color);
                        border-radius: 10px;
                        border: 1px solid var(--border-color);
                    `;
                    
                    itemElement.innerHTML = `
                        <img src="${item.image_data || item.imageData}" alt="${item.description}" style="
                            width: 60px;
                            height: 60px;
                            object-fit: cover;
                            border-radius: 8px;
                        ">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 5px;">${item.description}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                ${item.color} • ${translate(`clothingTypes.${item.type}`, this.currentLanguage)} • ${translate(`homeLocations.${item.home}`, this.currentLanguage)}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;">
                                Edit
                            </button>
                            <button class="btn btn-outline" style="padding: 5px 10px; font-size: 12px;">
                                Delete
                            </button>
                        </div>
                    `;
                    
                    // Add event listeners
                    const editBtn = itemElement.querySelector('.btn-primary');
                    const deleteBtn = itemElement.querySelector('.btn-outline');
                    
                    editBtn.addEventListener('click', () => this.editItem(item));
                    deleteBtn.addEventListener('click', () => this.deleteItem(item.id));
                    
                    container.insertBefore(itemElement, loadingIndicator);
                }, index * 50);
            });
            
            currentIndex += chunkSize;
            
            if (currentIndex < items.length) {
                setTimeout(loadNextChunk, 250);
            } else {
                setTimeout(() => {
                    if (loadingIndicator.parentNode) {
                        loadingIndicator.remove();
                    }
                }, 250);
            }
        };
        
        loadNextChunk();
    }

    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        this.showLoading();
        
        try {
            await dbManager.deleteClothingItem(itemId);
            await this.loadClothingItems();
            this.loadAdminItemsList();
            this.updateStatistics();
            alert('Item deleted successfully!');
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item');
        } finally {
            this.hideLoading();
        }
    }

    createNewUser() {
        const userName = document.getElementById('user-name-input').value.trim();
        if (!userName) {
            alert('Please enter a user name');
            return;
        }
        
        this.currentUser = userName;
        document.getElementById('current-user-name').textContent = userName;
        document.getElementById('user-name-input').value = '';
        
        // Add to user selector
        const select = document.getElementById('user-select');
        const option = document.createElement('option');
        option.value = userName;
        option.textContent = userName;
        select.appendChild(option);
        
        alert(`User "${userName}" created successfully!`);
    }

    updateUserName() {
        const userName = document.getElementById('user-name-input').value.trim();
        if (!userName) {
            alert('Please enter a user name');
            return;
        }
        
        this.currentUser = userName;
        document.getElementById('current-user-name').textContent = userName;
        document.getElementById('user-name-input').value = '';
        
        alert(`User name updated to "${userName}"`);
    }

    switchUser() {
        const select = document.getElementById('user-select');
        const selectedUser = select.value;
        
        if (selectedUser && selectedUser !== 'default') {
            this.currentUser = selectedUser;
            document.getElementById('current-user-name').textContent = selectedUser;
            alert(`Switched to user "${selectedUser}"`);
        }
    }

    exportData() {
        const items = JSON.parse(localStorage.getItem('clothingItems') || '[]');
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        const exportData = {
            items: items,
            profile: profile,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `clothing-inventory-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    }

    async importData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.items) {
                localStorage.setItem('clothingItems', JSON.stringify(data.items));
                await this.loadClothingItems();
            }
            
            if (data.profile) {
                localStorage.setItem('userProfile', JSON.stringify(data.profile));
                await this.loadUserProfile();
            }
            
            alert('Data imported successfully!');
            this.updateStatistics();
            
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Error importing data. Please check the file format.');
        }
    }

    showImagePreview(file) {
        if (!file) return;
        
        const preview = document.getElementById('image-preview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }

    async handleProfilePictureUpload(file) {
        if (!file) return;
        
        this.showLoading();
        
        try {
            const imageData = await dbManager.fileToBase64(file);
            document.getElementById('profile-img').src = imageData;
            await this.saveUserProfile();
            alert(translate('messages.profileUpdateSuccess', this.currentLanguage));
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert(translate('messages.profileUpdateError', this.currentLanguage));
        } finally {
            this.hideLoading();
        }
    }

    async loadUserProfile() {
        try {
            const profile = await dbManager.getUserProfile();
            if (profile) {
                if (profile.profile_picture) {
                    document.getElementById('profile-img').src = profile.profile_picture;
                }
                if (profile.theme) {
                    themeManager.applyTheme(profile.theme);
                }
                if (profile.language) {
                    this.currentLanguage = profile.language;
                    this.initializeLanguage();
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async saveUserProfile() {
        try {
            const profile = {
                profilePicture: document.getElementById('profile-img').src,
                theme: themeManager.getTheme(),
                language: this.currentLanguage
            };
            
            await dbManager.updateUserProfile('default', profile);
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    updateFileUploadButton(file) {
        const button = document.getElementById('file-upload-btn');
        const textElement = button.querySelector('.file-upload-text');
        const iconElement = button.querySelector('.file-upload-icon');
        
        if (file) {
            button.classList.add('has-file');
            textElement.textContent = file.name;
            iconElement.textContent = '✅';
        } else {
            button.classList.remove('has-file');
            textElement.textContent = 'Choose clothing image';
            iconElement.textContent = '📸';
        }
    }

    async addSampleDataIfNeeded() {
        // Sample data has been removed - app will now only show real data from Supabase
        console.log('Demo data loading disabled - using only real data from database');
    }
}

// Initialize the application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ClothingInventoryApp();
});
