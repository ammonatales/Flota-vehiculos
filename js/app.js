const STORAGE_KEY = 'fleet-manager-data-v1';
const SESSION_KEY = 'fleet-manager-session-v1';
const STATUS_LABELS = {
    en_servicio: 'En servicio',
    mantenimiento: 'En mantenimiento',
    fuera_servicio: 'Fuera de servicio'
};

const seedData = createSeedData();
let state = loadState();
let session = loadSession();

const dom = {
    loginSection: document.getElementById('login-section'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    dashboard: document.getElementById('dashboard'),
    welcomeText: document.getElementById('welcome-text'),
    logoutBtn: document.getElementById('logout-btn'),
    navLinks: Array.from(document.querySelectorAll('.nav-link')),
    pages: Array.from(document.querySelectorAll('.page')),
    stats: {
        drivers: document.getElementById('stat-drivers'),
        vehicles: document.getElementById('stat-vehicles'),
        movements: document.getElementById('stat-movements'),
        maintenance: document.getElementById('stat-maintenance')
    },
    recentActivity: document.getElementById('recent-activity')
};

const entityConfig = {
    drivers: {
        table: document.getElementById('drivers-table'),
        modal: document.getElementById('driver-modal'),
        title: document.getElementById('driver-modal-title'),
        newTitle: 'Nuevo conductor',
        editTitle: 'Editar conductor',
        emptyMessage: 'No hay conductores registrados.',
        columnCount: 4,
        toForm: (item = {}) => ({
            name: item.name || '',
            licenseNumber: item.licenseNumber || '',
            phone: item.phone || '',
            email: item.email || ''
        }),
        serialize: formData => ({
            name: formData.get('name').trim(),
            licenseNumber: formData.get('licenseNumber').trim(),
            phone: formData.get('phone').trim(),
            email: formData.get('email').trim()
        }),
        columns: driver => [
            driver.name,
            driver.licenseNumber,
            driver.phone,
            driver.email
        ]
    },
    vehicles: {
        table: document.getElementById('vehicles-table'),
        modal: document.getElementById('vehicle-modal'),
        title: document.getElementById('vehicle-modal-title'),
        newTitle: 'Nuevo vehículo',
        editTitle: 'Editar vehículo',
        emptyMessage: 'No hay vehículos registrados.',
        columnCount: 6,
        toForm: (item = {}) => ({
            plate: item.plate || '',
            brand: item.brand || '',
            model: item.model || '',
            year: item.year || '',
            capacity: item.capacity || '',
            status: item.status || 'en_servicio'
        }),
        serialize: formData => ({
            plate: formData.get('plate').trim(),
            brand: formData.get('brand').trim(),
            model: formData.get('model').trim(),
            year: Number(formData.get('year')) || new Date().getFullYear(),
            capacity: formData.get('capacity').trim(),
            status: formData.get('status')
        }),
        columns: vehicle => [
            vehicle.plate,
            vehicle.brand,
            vehicle.model,
            vehicle.year,
            vehicle.capacity,
            STATUS_LABELS[vehicle.status] || vehicle.status
        ]
    },
    movements: {
        table: document.getElementById('movements-table'),
        modal: document.getElementById('movement-modal'),
        title: document.getElementById('movement-modal-title'),
        newTitle: 'Registrar movimiento',
        editTitle: 'Editar movimiento',
        emptyMessage: 'No hay movimientos registrados.',
        columnCount: 6,
        toForm: (item = {}) => ({
            vehicleId: item.vehicleId || '',
            driverId: item.driverId || '',
            origin: item.origin || '',
            destination: item.destination || '',
            departureDate: item.departureDate || '',
            arrivalDate: item.arrivalDate || '',
            notes: item.notes || ''
        }),
        serialize: formData => ({
            vehicleId: formData.get('vehicleId'),
            driverId: formData.get('driverId'),
            origin: formData.get('origin').trim(),
            destination: formData.get('destination').trim(),
            departureDate: formData.get('departureDate'),
            arrivalDate: formData.get('arrivalDate') || '',
            notes: formData.get('notes').trim()
        }),
        columns: movement => [
            getVehicleName(movement.vehicleId),
            getDriverName(movement.driverId),
            movement.origin,
            movement.destination,
            formatDateTime(movement.departureDate),
            movement.arrivalDate ? formatDateTime(movement.arrivalDate) : 'Pendiente'
        ]
    },
    fuel: {
        table: document.getElementById('fuel-table'),
        modal: document.getElementById('fuel-modal'),
        title: document.getElementById('fuel-modal-title'),
        newTitle: 'Registrar carguío',
        editTitle: 'Editar carguío',
        emptyMessage: 'No hay carguíos registrados.',
        columnCount: 6,
        toForm: (item = {}) => ({
            vehicleId: item.vehicleId || '',
            driverId: item.driverId || '',
            date: item.date || '',
            liters: item.liters ?? '',
            cost: item.cost ?? '',
            station: item.station || ''
        }),
        serialize: formData => ({
            vehicleId: formData.get('vehicleId'),
            driverId: formData.get('driverId') || '',
            date: formData.get('date'),
            liters: Number(formData.get('liters')) || 0,
            cost: Number(formData.get('cost')) || 0,
            station: formData.get('station').trim()
        }),
        columns: fuel => [
            getVehicleName(fuel.vehicleId),
            fuel.driverId ? getDriverName(fuel.driverId) : 'No registrado',
            formatDate(fuel.date),
            `${fuel.liters.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`,
            formatCurrency(fuel.cost),
            fuel.station || '—'
        ]
    },
    maintenance: {
        table: document.getElementById('maintenance-table'),
        modal: document.getElementById('maintenance-modal'),
        title: document.getElementById('maintenance-modal-title'),
        newTitle: 'Registrar mantenimiento',
        editTitle: 'Editar mantenimiento',
        emptyMessage: 'No hay mantenimientos registrados.',
        columnCount: 6,
        toForm: (item = {}) => ({
            vehicleId: item.vehicleId || '',
            date: item.date || '',
            type: item.type || '',
            description: item.description || '',
            cost: item.cost ?? '',
            nextDate: item.nextDate || ''
        }),
        serialize: formData => ({
            vehicleId: formData.get('vehicleId'),
            date: formData.get('date'),
            type: formData.get('type').trim(),
            description: formData.get('description').trim(),
            cost: Number(formData.get('cost')) || 0,
            nextDate: formData.get('nextDate') || ''
        }),
        columns: maintenance => [
            getVehicleName(maintenance.vehicleId),
            formatDate(maintenance.date),
            maintenance.type,
            maintenance.description || '—',
            maintenance.cost ? formatCurrency(maintenance.cost) : '—',
            maintenance.nextDate ? formatDate(maintenance.nextDate) : '—'
        ]
    }
};

document.querySelectorAll('tbody[data-entity]').forEach(tbody => {
    tbody.addEventListener('click', handleTableAction);
});

document.querySelectorAll('[data-open-modal]').forEach(button => {
    button.addEventListener('click', () => openEntityModal(button.dataset.openModal));
});

document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', event => {
        event.preventDefault();
        const dialog = button.closest('dialog');
        if (dialog) {
            closeDialog(dialog);
        }
    });
});

document.querySelectorAll('dialog form[data-entity]').forEach(form => {
    form.addEventListener('submit', handleEntitySubmit);
    const dialog = form.closest('dialog');
    if (dialog) {
        dialog.addEventListener('close', () => form.reset());
    }
});

dom.loginForm.addEventListener('submit', handleLogin);
dom.logoutBtn.addEventListener('click', handleLogout);

dom.navLinks.forEach(link => {
    link.addEventListener('click', () => switchPage(link.dataset.target));
});

initializeApp();

function initializeApp() {
    if (session?.username) {
        showDashboard(session.username);
    } else {
        showLogin();
    }
}

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(dom.loginForm);
    const username = formData.get('username').trim();
    const password = formData.get('password').trim();

    if (authenticate(username, password)) {
        dom.loginError.classList.add('hidden');
        session = { username };
        saveSession(session);
        showDashboard(username);
        dom.loginForm.reset();
    } else {
        dom.loginError.classList.remove('hidden');
    }
}

function authenticate(username, password) {
    const demoUser = { username: 'admin', password: 'admin123' };
    return username === demoUser.username && password === demoUser.password;
}

function handleLogout() {
    session = null;
    localStorage.removeItem(SESSION_KEY);
    showLogin();
}

function showLogin() {
    dom.loginSection.classList.remove('hidden');
    dom.dashboard.classList.add('hidden');
}

function showDashboard(username) {
    dom.loginSection.classList.add('hidden');
    dom.dashboard.classList.remove('hidden');
    dom.welcomeText.textContent = `Bienvenido, ${username}`;
    switchPage('resumen');
    renderAll();
}

function switchPage(targetId) {
    dom.pages.forEach(page => {
        if (page.id === targetId) {
            page.classList.remove('hidden');
        } else {
            page.classList.add('hidden');
        }
    });

    dom.navLinks.forEach(link => {
        if (link.dataset.target === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function openEntityModal(modalId, itemId = null) {
    const entity = getEntityByModalId(modalId);
    if (!entity) return;

    const config = entityConfig[entity];
    const modal = config.modal;
    const form = modal.querySelector('form');
    const currentItem = itemId ? state[entity].find(item => item.id === itemId) : null;

    populateForm(form, entity, currentItem);

    form.querySelector('input[name="id"]').value = currentItem?.id || '';
    config.title.textContent = currentItem ? config.editTitle : config.newTitle;

    modal.showModal();
}

function populateForm(form, entity, item) {
    form.reset();
    populateRelatedSelects(form, entity);

    const values = entityConfig[entity].toForm(item);
    Object.entries(values).forEach(([field, value]) => {
        if (form.elements[field] !== undefined) {
            form.elements[field].value = value;
        }
    });
}

function populateRelatedSelects(form, entity) {
    if (entity === 'movements' || entity === 'fuel' || entity === 'maintenance') {
        fillSelect(form.elements.vehicleId, state.vehicles, 'Selecciona un vehículo', vehicle => ({
            value: vehicle.id,
            label: `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}`
        }));
    }

    if (entity === 'movements' || entity === 'fuel') {
        fillSelect(form.elements.driverId, state.drivers, 'Selecciona un conductor', driver => ({
            value: driver.id,
            label: `${driver.name} · Licencia ${driver.licenseNumber}`
        }), entity === 'fuel');
    }
}

function fillSelect(select, options, placeholder, mapFn, allowEmpty = false) {
    if (!select) return;
    select.innerHTML = '';

    if (placeholder && !allowEmpty) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = placeholder;
        option.disabled = true;
        option.selected = true;
        select.append(option);
    }

    if (allowEmpty) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No registrado';
        select.append(option);
    }

    options.forEach(optionData => {
        const option = document.createElement('option');
        const { value, label } = mapFn(optionData);
        option.value = value;
        option.textContent = label;
        select.append(option);
    });
}

function handleEntitySubmit(event) {
    event.preventDefault();
    const form = event.target;
    const entity = form.dataset.entity;
    const config = entityConfig[entity];
    const formData = new FormData(form);
    const id = formData.get('id');
    const payload = config.serialize(formData);

    if (id) {
        updateEntity(entity, id, payload);
    } else {
        createEntity(entity, payload);
    }

    closeDialog(form.closest('dialog'));
    renderAll();
}

function handleTableAction(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const row = button.closest('tr');
    const tbody = button.closest('tbody');
    if (!row || !tbody) return;

    const entity = tbody.dataset.entity;
    const id = row.dataset.id;

    if (action === 'edit') {
        openEntityModal(entityConfig[entity].modal.id, id);
    } else if (action === 'delete') {
        const confirmation = confirm('¿Deseas eliminar este registro?');
        if (confirmation) {
            deleteEntity(entity, id);
            renderAll();
        }
    }
}

function createEntity(entity, payload) {
    const item = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...payload
    };
    state[entity].push(item);
    persistState();
    return item;
}

function updateEntity(entity, id, payload) {
    const items = state[entity];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = {
        ...items[index],
        ...payload,
        updatedAt: new Date().toISOString()
    };
    persistState();
    return items[index];
}

function deleteEntity(entity, id) {
    state[entity] = state[entity].filter(item => item.id !== id);
    persistState();
}

function renderAll() {
    renderTables();
    renderStats();
    renderRecentActivity();
}

function renderTables() {
    Object.entries(entityConfig).forEach(([entity, config]) => {
        const items = state[entity];
        renderTable(config.table, items, config.columns, config.columnCount, config.emptyMessage);
    });
}

function renderTable(tbody, items, getColumns, columnCount, emptyMessage) {
    tbody.innerHTML = '';
    if (!items.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = columnCount + 1;
        cell.textContent = emptyMessage;
        cell.style.textAlign = 'center';
        cell.style.color = 'var(--color-muted)';
        row.append(cell);
        tbody.append(row);
        return;
    }

    const sortedItems = [...items].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    sortedItems.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        const values = getColumns(item);
        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
        });
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';
        actionsCell.innerHTML = '<button class="icon-btn" data-action="edit" title="Editar">✏️</button>\n            <button class="icon-btn" data-action="delete" title="Eliminar">🗑️</button>';
        row.append(actionsCell);
        tbody.append(row);
    });
}

function renderStats() {
    dom.stats.drivers.textContent = state.drivers.length;
    dom.stats.vehicles.textContent = state.vehicles.filter(vehicle => vehicle.status === 'en_servicio').length;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentMovements = state.movements.filter(movement => {
        const departure = movement.departureDate ? new Date(movement.departureDate).getTime() : 0;
        return departure >= thirtyDaysAgo;
    });
    dom.stats.movements.textContent = recentMovements.length;

    const today = new Date().setHours(0, 0, 0, 0);
    const upcomingMaintenance = state.maintenance.filter(item => {
        if (!item.nextDate) return false;
        const next = new Date(item.nextDate).setHours(0, 0, 0, 0);
        return next >= today;
    });
    dom.stats.maintenance.textContent = upcomingMaintenance.length;
}

function renderRecentActivity() {
    const events = [];

    state.movements.forEach(item => {
        events.push({
            date: item.departureDate || item.createdAt,
            description: `Movimiento de ${getVehicleName(item.vehicleId)} hacia ${item.destination}`
        });
    });

    state.fuel.forEach(item => {
        events.push({
            date: item.date || item.createdAt,
            description: `Carguío de ${item.liters.toLocaleString('es-ES', { maximumFractionDigits: 1 })} L para ${getVehicleName(item.vehicleId)}`
        });
    });

    state.maintenance.forEach(item => {
        events.push({
            date: item.date || item.createdAt,
            description: `Mantenimiento (${item.type}) registrado para ${getVehicleName(item.vehicleId)}`
        });
    });

    const sorted = events
        .filter(event => event.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    dom.recentActivity.innerHTML = '';

    if (!sorted.length) {
        const li = document.createElement('li');
        li.textContent = 'No hay actividades recientes.';
        dom.recentActivity.append(li);
        return;
    }

    sorted.forEach(event => {
        const li = document.createElement('li');
        const spanDescription = document.createElement('span');
        spanDescription.textContent = event.description;

        const spanDate = document.createElement('span');
        spanDate.style.color = 'var(--color-muted)';
        spanDate.textContent = formatDateTime(event.date);

        li.append(spanDescription, spanDate);
        dom.recentActivity.append(li);
    });
}

function generateId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getVehicleName(id) {
    const vehicle = state.vehicles.find(vehicle => vehicle.id === id);
    if (!vehicle) return 'Vehículo no encontrado';
    return `${vehicle.plate} · ${vehicle.brand}`;
}

function getDriverName(id) {
    const driver = state.drivers.find(driver => driver.id === id);
    if (!driver) return 'Conductor no asignado';
    return driver.name;
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value || 0);
}

function closeDialog(dialog) {
    if (!dialog) return;
    const form = dialog.querySelector('form');
    dialog.close();
    if (form) {
        form.reset();
    }
}

function persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return clone(seedData);
        }
        const parsed = JSON.parse(raw);
        return {
            drivers: parsed.drivers || [],
            vehicles: parsed.vehicles || [],
            movements: parsed.movements || [],
            fuel: parsed.fuel || [],
            maintenance: parsed.maintenance || []
        };
    } catch (error) {
        console.warn('No se pudo cargar la información almacenada, usando datos iniciales.', error);
        return clone(seedData);
    }
}

function loadSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.warn('No se pudo cargar la sesión previa.', error);
        return null;
    }
}

function saveSession(value) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(value));
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function getEntityByModalId(modalId) {
    const entry = Object.entries(entityConfig).find(([, config]) => config.modal.id === modalId);
    return entry ? entry[0] : null;
}

function createSeedData() {
    const now = new Date();
    const isoNow = now.toISOString();
    const formatDateOnly = daysAgo => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().slice(0, 10);
    };
    const formatDateTimeString = daysAgo => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().slice(0, 16);
    };

    return {
        drivers: [
            { id: 'drv-1', name: 'Laura Pérez', licenseNumber: 'CL-98234', phone: '+56 9 1234 5678', email: 'laura.perez@transporte.cl', createdAt: isoNow },
            { id: 'drv-2', name: 'Andrés Muñoz', licenseNumber: 'CL-54231', phone: '+56 9 8765 4321', email: 'andres.munoz@transporte.cl', createdAt: isoNow },
            { id: 'drv-3', name: 'Carolina Díaz', licenseNumber: 'CL-76890', phone: '+56 9 5555 7890', email: 'carolina.diaz@transporte.cl', createdAt: isoNow }
        ],
        vehicles: [
            { id: 'veh-1', plate: 'AB-CD-12', brand: 'Mercedes-Benz', model: 'Sprinter', year: 2020, capacity: '3.5 t', status: 'en_servicio', createdAt: isoNow },
            { id: 'veh-2', plate: 'EF-GH-34', brand: 'Volvo', model: 'FH16', year: 2018, capacity: '25 t', status: 'en_servicio', createdAt: isoNow },
            { id: 'veh-3', plate: 'IJ-KL-56', brand: 'Scania', model: 'P320', year: 2019, capacity: '18 t', status: 'mantenimiento', createdAt: isoNow }
        ],
        movements: [
            {
                id: 'mov-1',
                vehicleId: 'veh-1',
                driverId: 'drv-1',
                origin: 'Santiago',
                destination: 'Valparaíso',
                departureDate: formatDateTimeString(2),
                arrivalDate: formatDateTimeString(1),
                notes: 'Entrega programada en horario matutino',
                createdAt: isoNow
            },
            {
                id: 'mov-2',
                vehicleId: 'veh-2',
                driverId: 'drv-2',
                origin: 'Concepción',
                destination: 'Temuco',
                departureDate: formatDateTimeString(5),
                arrivalDate: formatDateTimeString(4),
                notes: 'Carga de materiales de construcción',
                createdAt: isoNow
            }
        ],
        fuel: [
            {
                id: 'fuel-1',
                vehicleId: 'veh-1',
                driverId: 'drv-1',
                date: formatDateOnly(1),
                liters: 120,
                cost: 580,
                station: 'Copec Kennedy',
                createdAt: isoNow
            },
            {
                id: 'fuel-2',
                vehicleId: 'veh-2',
                driverId: 'drv-2',
                date: formatDateOnly(3),
                liters: 300,
                cost: 1350,
                station: 'Shell Paicaví',
                createdAt: isoNow
            }
        ],
        maintenance: [
            {
                id: 'mnt-1',
                vehicleId: 'veh-3',
                date: formatDateOnly(7),
                type: 'Cambio de aceite',
                description: 'Reemplazo de filtro y aceite sintético',
                cost: 220,
                nextDate: formatDateOnly(-83),
                createdAt: isoNow
            },
            {
                id: 'mnt-2',
                vehicleId: 'veh-2',
                date: formatDateOnly(20),
                type: 'Revisión general',
                description: 'Chequeo de frenos y neumáticos',
                cost: 480,
                nextDate: formatDateOnly(-40),
                createdAt: isoNow
            }
        ]
    };
}
