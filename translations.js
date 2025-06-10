// Translation data for bilingual support
const translations = {
    en: {
        nav: {
            clothes: 'Clotches',
            settings: 'Settings',
            admin: 'Admin'
        },
        filters: {
            color: 'Color',
            type: 'Type',
            home: 'Home',
            all: 'All'
        },
        clothingTypes: {
            tsark: 'Shirt',
            aluspuksid: 'Underwear',
            tressipluus: 'Tracksuit top',
            dressipuksid: 'Tracksuit pants',
            tarvikud: 'Accessories',
            ratikud: 'Towels',
            magamine: 'Sleepwear',
            sokid: 'Socks',
            teksad: 'Jeans',
            joped: 'Jackets',
            mutsid: 'Hats',
            sallid: 'Scarves',
            kindad: 'Gloves',
            tossud: 'Slippers',
            saapad: 'Boots'
        },
        homeLocations: {
            dadsHome: "Dad's home",
            momsHome: "Mom's home",
            grandmasHome: "Dad's Home in Muhu"
        },
        results: {
            noItems: 'No items found'
        },
        settings: {
            title: 'Settings',
            profile: 'Profile',
            uploadProfile: 'Upload Profile Picture',
            theme: 'Theme',
            userManagement: 'User Management',
            createUser: 'Create New User',
            selectUser: 'Select User',
            userName: 'User Name',
            currentUser: 'Current User',
            switchUser: 'Switch User',
            deleteUser: 'Delete User'
        },
        themes: {
            light: 'Light',
            dark: 'Dark',
            banana: 'Banana',
            cottonCandy: 'Cotton Candy',
            lightOcean: 'Light Ocean'
        },
        admin: {
            title: 'Admin Panel',
            uploadItem: 'Upload Item',
            editItem: 'Edit Item',
            updateItem: 'Update Item',
            uploadImage: 'Upload Image',
            description: 'Description',
            color: 'Color',
            type: 'Type',
            home: 'Home',
            upload: 'Upload Item',
            itemManagement: 'Item Management',
            editItem: 'Edit Item',
            deleteItem: 'Delete Item',
            bulkActions: 'Bulk Actions',
            exportData: 'Export Data',
            importData: 'Import Data',
            statistics: 'Statistics',
            totalItems: 'Total Items',
            itemsByColor: 'Items by Color',
            itemsByType: 'Items by Type',
            itemsByHome: 'Items by Home'
        },
        messages: {
            uploadSuccess: 'Item uploaded successfully!',
            uploadError: 'Error uploading item. Please try again.',
            profileUpdateSuccess: 'Profile updated successfully!',
            profileUpdateError: 'Error updating profile. Please try again.',
            selectColor: 'Select Color',
            selectType: 'Select Type',
            selectHome: 'Select Home'
        }
    },
    et: {
        nav: {
            clothes: 'Riided',
            settings: 'Seaded',
            admin: 'Admin'
        },
        filters: {
            color: 'Värv',
            type: 'Tüüp',
            home: 'Kodu',
            all: 'Kõik'
        },
        clothingTypes: {
            tsark: 'Särk',
            aluspuksid: 'Aluspüksid',
            tressipluus: 'Tressipluus',
            dressipuksid: 'Dressipüksid',
            tarvikud: 'Tarvikud',
            ratikud: 'Rätikud',
            magamine: 'Magamine',
            sokid: 'Sokid',
            teksad: 'Teksad',
            joped: 'Joped',
            mutsid: 'Mütsid',
            sallid: 'Sallid',
            kindad: 'Kindad',
            tossud: 'Tossud',
            saapad: 'Saapad'
        },
        homeLocations: {
            dadsHome: 'Isa kodu',
            momsHome: 'Ema kodu',
            grandmasHome: 'Isa kodu muhus'
        },
        results: {
            noItems: 'Ühtegi elementi ei leitud'
        },
        settings: {
            title: 'Seaded',
            profile: 'Profiil',
            uploadProfile: 'Laadi üles profiilipilt',
            theme: 'Teema',
            userManagement: 'Kasutajate haldamine',
            createUser: 'Loo uus kasutaja',
            selectUser: 'Vali kasutaja',
            userName: 'Kasutaja nimi',
            currentUser: 'Praegune kasutaja',
            switchUser: 'Vaheta kasutajat',
            deleteUser: 'Kustuta kasutaja'
        },
        themes: {
            light: 'Hele',
            dark: 'Tume',
            banana: 'Banaan',
            cottonCandy: 'Suhkruvatt',
            lightOcean: 'Hele ookean'
        },
        admin: {
            title: 'Administratsiooni paneel',
            uploadItem: 'Laadi üles ese',
            uploadImage: 'Laadi üles pilt',
            description: 'Kirjeldus',
            color: 'Värv',
            type: 'Tüüp',
            home: 'Kodu',
            upload: 'Laadi üles',
            itemManagement: 'Esemete haldamine',
            editItem: 'Muuda eset',
            updateItem: 'Uuenda eset',
            deleteItem: 'Kustuta ese',
            bulkActions: 'Hulgioperatsioonid',
            exportData: 'Ekspordi andmed',
            importData: 'Impordi andmed',
            statistics: 'Statistika',
            totalItems: 'Kokku esemeid',
            itemsByColor: 'Esemed värvi järgi',
            itemsByType: 'Esemed tüübi järgi',
            itemsByHome: 'Esemed kodu järgi'
        },
        messages: {
            uploadSuccess: 'Element edukalt üles laaditud!',
            uploadError: 'Viga elemendi üleslaadimisel. Palun proovi uuesti.',
            profileUpdateSuccess: 'Profiil edukalt uuendatud!',
            profileUpdateError: 'Viga profiili uuendamisel. Palun proovi uuesti.',
            selectColor: 'Vali värv',
            selectType: 'Vali tüüp',
            selectHome: 'Vali kodu'
        }
    }
};

// Translation function
function translate(key, language = 'en') {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
        value = value?.[k];
    }
    
    return value || key;
}

// Update all translatable elements
function updateTranslations(language) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translate(key, language);
    });
    
    // Update select options
    updateSelectOptions(language);
}

// Update select option texts
function updateSelectOptions(language) {
    // Update clothing type options
    const typeSelect = document.getElementById('item-type');
    if (typeSelect) {
        const currentValue = typeSelect.value;
        typeSelect.innerHTML = `<option value="">${translate('messages.selectType', language)}</option>`;
        
        Object.keys(translations[language].clothingTypes).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = translations[language].clothingTypes[key];
            typeSelect.appendChild(option);
        });
        
        typeSelect.value = currentValue;
    }
    
    // Update home location options
    const homeSelect = document.getElementById('item-home');
    if (homeSelect) {
        const currentValue = homeSelect.value;
        homeSelect.innerHTML = `<option value="">${translate('messages.selectHome', language)}</option>`;
        
        Object.keys(translations[language].homeLocations).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = translations[language].homeLocations[key];
            homeSelect.appendChild(option);
        });
        
        homeSelect.value = currentValue;
    }
    
    // Update color options
    const colorSelect = document.getElementById('item-color');
    if (colorSelect && colorSelect.children[0]) {
        colorSelect.children[0].textContent = translate('messages.selectColor', language);
    }
}
