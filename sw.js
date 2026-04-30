// SISTEMA OFFLINE COMPLETO - Com carregamento imediato do cache
(function() {
    let isOnline = navigator.onLine;
    let pendingData = [];
    
    // Carregar dados pendentes
    const saved = localStorage.getItem('pendingOfflineData');
    if (saved) {
        pendingData = JSON.parse(saved);
    }
    
    // ============================================
    // FUNÇÃO PRINCIPAL: Carregar dados do cache IMEDIATAMENTE
    // ============================================
    
    function loadAllDataFromCache() {
        console.log('📦 Carregando dados do cache local...');
        
        // Carregar clientes
        const cachedClients = localStorage.getItem('cached_clients');
        if (cachedClients) {
            try {
                const parsed = JSON.parse(cachedClients);
                if (parsed.length > 0) {
                    window.clients = parsed;
                    console.log('✅ Clientes carregados do cache:', window.clients.length);
                    
                    // Atualizar interfaces
                    if (typeof updateClientsUI === 'function') updateClientsUI();
                    if (typeof updateClientRecordsList === 'function') updateClientRecordsList();
                    if (typeof updatePackageClientSelect === 'function') updatePackageClientSelect();
                    if (typeof loadUpcomingBirthdays === 'function') loadUpcomingBirthdays();
                    const totalElem = document.getElementById('totalClients');
                    if (totalElem) totalElem.textContent = window.clients.length;
                }
            } catch(e) { console.error('Erro ao carregar clientes do cache:', e); }
        }
        
        // Carregar produtos
        const cachedProducts = localStorage.getItem('cached_products');
        if (cachedProducts) {
            try {
                const parsed = JSON.parse(cachedProducts);
                if (parsed.length > 0) {
                    window.products = parsed;
                    console.log('✅ Produtos carregados do cache:', window.products.length);
                    
                    if (typeof updateInventoryUI === 'function') updateInventoryUI();
                    if (typeof renderStore === 'function') renderStore();
                    if (typeof checkLowStock === 'function') checkLowStock();
                }
            } catch(e) { console.error('Erro ao carregar produtos do cache:', e); }
        }
        
        // Carregar colaboradores
        const cachedCollaborators = localStorage.getItem('cached_collaborators');
        if (cachedCollaborators) {
            try {
                const parsed = JSON.parse(cachedCollaborators);
                if (parsed.length > 0) {
                    window.collaborators = parsed;
                    console.log('✅ Colaboradores carregados do cache:', window.collaborators.length);
                    
                    if (typeof updateCollaboratorsUI === 'function') updateCollaboratorsUI();
                    if (typeof updateCollaboratorSelect === 'function') updateCollaboratorSelect();
                    if (typeof updateReportCollaboratorSelect === 'function') updateReportCollaboratorSelect();
                    if (typeof updateSalaryCollaboratorSelect === 'function') updateSalaryCollaboratorSelect();
                    const totalElem = document.getElementById('totalCollaborators');
                    if (totalElem) totalElem.textContent = window.collaborators.filter(c => c.active).length;
                }
            } catch(e) { console.error('Erro ao carregar colaboradores do cache:', e); }
        }
        
        // Carregar serviços
        const cachedServices = localStorage.getItem('cached_services');
        if (cachedServices) {
            try {
                const parsed = JSON.parse(cachedServices);
                if (parsed.length > 0) {
                    window.allServices = parsed;
                    const today = new Date().toISOString().split('T')[0];
                    window.todayServices = parsed.filter(s => s.date === today);
                    console.log('✅ Serviços carregados do cache:', window.allServices.length);
                    
                    if (typeof updateTodaySalesUI === 'function') updateTodaySalesUI();
                    if (typeof updateDashboard === 'function') updateDashboard();
                    if (typeof calculatePeriodSales === 'function') calculatePeriodSales();
                }
            } catch(e) { console.error('Erro ao carregar serviços do cache:', e); }
        }
        
        // Carregar vendas de produtos
        const cachedProductSales = localStorage.getItem('cached_productSales');
        if (cachedProductSales) {
            try {
                const parsed = JSON.parse(cachedProductSales);
                if (parsed.length > 0) {
                    window.allProductSales = parsed;
                    const today = new Date().toISOString().split('T')[0];
                    window.todayProductSales = parsed.filter(s => s.date === today);
                    console.log('✅ Vendas de produtos carregadas do cache:', window.allProductSales.length);
                    
                    if (typeof updateTodaySalesUI === 'function') updateTodaySalesUI();
                    if (typeof updateDashboard === 'function') updateDashboard();
                }
            } catch(e) { console.error('Erro ao carregar vendas de produtos do cache:', e); }
        }
        
        // Carregar pacotes
        const cachedPackages = localStorage.getItem('cached_packages');
        if (cachedPackages) {
            try {
                const parsed = JSON.parse(cachedPackages);
                if (parsed.length > 0) {
                    window.packages = parsed;
                    console.log('✅ Pacotes carregados do cache:', window.packages.length);
                    if (typeof updatePackagesUI === 'function') updatePackagesUI();
                }
            } catch(e) { console.error('Erro ao carregar pacotes do cache:', e); }
        }
        
        // Carregar agendamentos
        const cachedAppointments = localStorage.getItem('cached_appointments');
        if (cachedAppointments) {
            try {
                const parsed = JSON.parse(cachedAppointments);
                if (parsed.length > 0) {
                    window.appointments = parsed;
                    console.log('✅ Agendamentos carregados do cache:', window.appointments.length);
                    if (typeof renderAgenda === 'function') renderAgenda();
                }
            } catch(e) { console.error('Erro ao carregar agendamentos do cache:', e); }
        }
        
        // Atualizar badge de itens pendentes
        updateBadge();
        
        console.log('✅ Todos os dados do cache foram carregados!');
    }
    
    // ============================================
    // SALVAR DADOS NO CACHE (quando online)
    // ============================================
    
    function saveToCache(collection, data) {
        const cacheKey = `cached_${collection}`;
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log(`💾 ${collection} salvo no cache:`, data.length);
    }
    
    // Atualizar cache com dados do Firebase
    async function refreshCache() {
        if (!isOnline || !window.currentUser) return;
        
        console.log('🔄 Atualizando cache do Firebase...');
        
        try {
            // Buscar clientes
            const clientsSnap = await firebase.firestore().collection('clients')
                .where('userId', '==', window.currentUser.uid).get();
            const clientsData = [];
            clientsSnap.forEach(doc => clientsData.push({ id: doc.id, ...doc.data() }));
            saveToCache('clients', clientsData);
            if (window.clients) window.clients = clientsData;
            
            // Buscar produtos
            const productsSnap = await firebase.firestore().collection('products')
                .where('userId', '==', window.currentUser.uid).get();
            const productsData = [];
            productsSnap.forEach(doc => productsData.push({ id: doc.id, ...doc.data() }));
            saveToCache('products', productsData);
            if (window.products) window.products = productsData;
            
            // Buscar colaboradores
            const collabSnap = await firebase.firestore().collection('collaborators')
                .where('userId', '==', window.currentUser.uid).get();
            const collabData = [];
            collabSnap.forEach(doc => collabData.push({ id: doc.id, ...doc.data() }));
            saveToCache('collaborators', collabData);
            if (window.collaborators) window.collaborators = collabData;
            
            // Buscar serviços
            const servicesSnap = await firebase.firestore().collection('services')
                .where('userId', '==', window.currentUser.uid).get();
            const servicesData = [];
            servicesSnap.forEach(doc => servicesData.push({ id: doc.id, ...doc.data() }));
            saveToCache('services', servicesData);
            if (window.allServices) window.allServices = servicesData;
            
            // Buscar vendas de produtos
            const salesSnap = await firebase.firestore().collection('productSales')
                .where('userId', '==', window.currentUser.uid).get();
            const salesData = [];
            salesSnap.forEach(doc => salesData.push({ id: doc.id, ...doc.data() }));
            saveToCache('productSales', salesData);
            if (window.allProductSales) window.allProductSales = salesData;
            
            // Buscar pacotes
            const packagesSnap = await firebase.firestore().collection('packages')
                .where('userId', '==', window.currentUser.uid).get();
            const packagesData = [];
            packagesSnap.forEach(doc => packagesData.push({ id: doc.id, ...doc.data() }));
            saveToCache('packages', packagesData);
            if (window.packages) window.packages = packagesData;
            
            console.log('✅ Cache atualizado com sucesso!');
            
        } catch(e) {
            console.log('Erro ao atualizar cache:', e);
        }
    }
    
    // ============================================
    // SALVAR DADOS LOCALMENTE (quando offline)
    // ============================================
    
    function saveLocal(collection, data, updateGlobal = true) {
        // Salvar na fila de pendentes
        pendingData.push({
            collection: collection,
            data: data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('pendingOfflineData', JSON.stringify(pendingData));
        
        // Também salvar no cache imediatamente
        const cacheKey = `cached_${collection}`;
        let existing = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        const newItem = { ...data, id: 'pending_' + Date.now(), _pending: true };
        existing.push(newItem);
        localStorage.setItem(cacheKey, JSON.stringify(existing));
        
        // Atualizar variável global e UI
        if (updateGlobal) {
            if (collection === 'clients' && window.clients) {
                window.clients.push(newItem);
                if (typeof updateClientsUI === 'function') updateClientsUI();
                if (typeof updateClientRecordsList === 'function') updateClientRecordsList();
                const totalElem = document.getElementById('totalClients');
                if (totalElem) totalElem.textContent = window.clients.length;
            }
            
            if (collection === 'products' && window.products) {
                window.products.push(newItem);
                if (typeof updateInventoryUI === 'function') updateInventoryUI();
                if (typeof renderStore === 'function') renderStore();
            }
            
            if (collection === 'collaborators' && window.collaborators) {
                window.collaborators.push(newItem);
                if (typeof updateCollaboratorsUI === 'function') updateCollaboratorsUI();
            }
            
            if (collection === 'services' && window.allServices) {
                window.allServices.push(newItem);
                const today = new Date().toISOString().split('T')[0];
                if (data.date === today && window.todayServices) {
                    window.todayServices.push(newItem);
                }
                if (typeof updateTodaySalesUI === 'function') updateTodaySalesUI();
                if (typeof updateDashboard === 'function') updateDashboard();
            }
        }
        
        updateBadge();
        showStatus(`💾 ${collection} salvo localmente!`, 'success');
        return newItem.id;
    }
    
    // ============================================
    // SINCRONIZAR DADOS PENDENTES
    // ============================================
    
    async function syncPendingData() {
        if (!isOnline || pendingData.length === 0) return;
        
        showStatus(`🔄 Sincronizando ${pendingData.length} item(ns)...`, 'info');
        
        for (let i = 0; i < pendingData.length; i++) {
            const item = pendingData[i];
            try {
                const db = firebase.firestore();
                if (item.collection === 'clients') {
                    await db.collection('clients').add(item.data);
                } else if (item.collection === 'products') {
                    await db.collection('products').add(item.data);
                } else if (item.collection === 'services') {
                    await db.collection('services').add(item.data);
                } else if (item.collection === 'appointments') {
                    await db.collection('appointments').add(item.data);
                } else if (item.collection === 'collaborators') {
                    await db.collection('collaborators').add(item.data);
                }
                
                pendingData.splice(i, 1);
                i--;
                
            } catch(e) {
                console.log('Erro ao sincronizar:', e);
            }
        }
        
        localStorage.setItem('pendingOfflineData', JSON.stringify(pendingData));
        
        // Atualizar cache após sincronizar
        await refreshCache();
        
        showStatus('✅ Sincronização concluída!', 'success');
        updateBadge();
        
        // Recarregar interfaces
        if (typeof loadAllServices === 'function') loadAllServices();
        if (typeof loadClients === 'function') loadClients();
        if (typeof loadProducts === 'function') loadProducts();
    }
    
    // ============================================
    // NOTIFICAÇÕES
    // ============================================
    
    let statusDiv = null;
    
    function showStatus(message, type) {
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'offlineStatus';
            statusDiv.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:12px 20px;border-radius:8px;color:white;font-size:14px;transition:0.3s;box-shadow:0 2px 10px rgba(0,0,0,0.2);max-width:300px';
            document.body.appendChild(statusDiv);
        }
        
        const colors = {
            'offline': '#dc3545',
            'online': '#28a745',
            'success': '#28a745',
            'info': '#17a2b8'
        };
        
        statusDiv.style.background = colors[type] || '#6c757d';
        statusDiv.innerHTML = message;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            if (statusDiv) statusDiv.style.display = 'none';
        }, 4000);
    }
    
    // ============================================
    // BADGE DE ITENS PENDENTES
    // ============================================
    
    function updateBadge() {
        let badge = document.getElementById('pendingBadge');
        if (pendingData.length > 0) {
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'pendingBadge';
                badge.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#ffc107;color:#000;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;z-index:9999;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.2);font-size:16px';
                badge.onclick = () => syncPendingData();
                badge.title = 'Clique para sincronizar dados pendentes';
                document.body.appendChild(badge);
            }
            badge.textContent = pendingData.length;
            badge.style.display = 'flex';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }
    
    // ============================================
    // EVENTOS DE CONEXÃO
    // ============================================
    
    window.addEventListener('online', async () => {
        isOnline = true;
        showStatus('✅ Internet恢复! Sincronizando...', 'online');
        await syncPendingData();
        await refreshCache();
        loadAllDataFromCache(); // Recarregar dados atualizados
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        showStatus('⚠️ Modo Offline - Usando dados salvos', 'offline');
        loadAllDataFromCache(); // Carregar dados do cache
    });
    
    // ============================================
    // CAPTURAR DADOS QUANDO CARREGAR NORMALMENTE
    // ============================================
    
    function setupDataCapture() {
        // Observar quando os dados são carregados do Firebase
        const originalLoadClients = window.loadClients;
        if (originalLoadClients) {
            window.loadClients = async function() {
                const result = await originalLoadClients.apply(this, arguments);
                if (window.clients && window.clients.length > 0) {
                    saveToCache('clients', window.clients);
                }
                return result;
            };
        }
        
        const originalLoadProducts = window.loadProducts;
        if (originalLoadProducts) {
            window.loadProducts = async function() {
                const result = await originalLoadProducts.apply(this, arguments);
                if (window.products && window.products.length > 0) {
                    saveToCache('products', window.products);
                }
                return result;
            };
        }
        
        const originalLoadCollaborators = window.loadCollaborators;
        if (originalLoadCollaborators) {
            window.loadCollaborators = async function() {
                const result = await originalLoadCollaborators.apply(this, arguments);
                if (window.collaborators && window.collaborators.length > 0) {
                    saveToCache('collaborators', window.collaborators);
                }
                return result;
            };
        }
    }
    
    // ============================================
    // SUBSTITUIR FUNÇÕES DE SALVAMENTO
    // ============================================
    
    // Salvar cliente offline
    const originalSaveClient = window.saveClient;
    if (originalSaveClient) {
        window.saveClient = function() {
            if (isOnline) {
                return originalSaveClient();
            } else {
                const name = document.getElementById('clientName')?.value;
                const phone = document.getElementById('clientPhone')?.value;
                const email = document.getElementById('clientEmail')?.value;
                const birthdate = document.getElementById('clientBirthdate')?.value;
                
                if (!name) {
                    alert('Nome do cliente é obrigatório');
                    return;
                }
                
                const clientData = {
                    name, phone, email, birthdate,
                    userId: window.currentUser?.uid,
                    createdAt: new Date().toISOString()
                };
                
                saveLocal('clients', clientData, true);
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('clientModal'));
                if (modal) modal.hide();
                
                alert('✅ Cliente salvo localmente! Aparecerá na lista.');
            }
        };
    }
    
    // ============================================
    // INICIALIZAÇÃO PRINCIPAL
    // ============================================
    
    // AGUARDAR O DOM CARREGAR
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Inicializando sistema offline...');
        
        // CARREGAR DADOS DO CACHE IMEDIATAMENTE
        loadAllDataFromCache();
        
        // Configurar captura de dados
        setupDataCapture();
        
        // Atualizar badge
        updateBadge();
        
        // Se estiver online, atualizar cache
        setTimeout(() => {
            if (isOnline && window.currentUser) {
                refreshCache();
            }
        }, 3000);
    });
    
    // Também tentar carregar quando o usuário fizer login
    const originalOnAuthStateChanged = firebase.auth().onAuthStateChanged;
    if (originalOnAuthStateChanged) {
        firebase.auth().onAuthStateChanged = async function(user) {
            if (user) {
                window.currentUser = user;
                // Carregar dados do cache primeiro
                loadAllDataFromCache();
                // Depois tentar sincronizar
                setTimeout(() => {
                    if (navigator.onLine) {
                        refreshCache();
                        syncPendingData();
                    }
                }, 1000);
            }
            if (originalOnAuthStateChanged) {
                originalOnAuthStateChanged(user);
            }
        };
    }
    
    console.log('✅ Sistema offline pronto!');
})();
