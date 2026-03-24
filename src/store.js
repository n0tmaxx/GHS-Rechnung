/**
 * Store for Invoice Manager
 * Handles data persistence using localStorage
 */

const STORAGE_KEYS = {
    INVOICES: 'ghs_invoices',
    CUSTOMERS: 'ghs_customers',
    SETTINGS: 'ghs_settings'
};

const DEFAULT_SETTINGS = {
    company_name: 'GHS Heizung',
    address: 'Musterstraße 123, 12345 Musterstadt',
    email: 'info@ghs-heizung.de',
    mwst_satz: 19,
    bank: 'Sparkasse Musterstadt',
    iban: 'DE12 3456 7890 0000 0000 00'
};

const INITIAL_DATA = {
    invoices: [
        {
            id: '1',
            rechnungsnummer: '2024-001',
            kunden_id: '1',
            datum: '2024-03-01',
            faelligkeitsdatum: '2024-03-15',
            status: 'offen',
            gesamtbrutto: 450.50,
            items: [
                { id: 'item1', menge: 2, bezeichnung: 'Wartung Brennwerttherme', einzelpreis: 150, typ: 'artikel' },
                { id: 'item2', menge: 1, bezeichnung: 'Anfahrtspauschale', einzelpreis: 25, typ: 'artikel' }
            ]
        },
        {
            id: '2',
            rechnungsnummer: '2024-002',
            kunden_id: '2',
            datum: '2024-03-10',
            faelligkeitsdatum: '2024-03-24',
            status: 'bezahlt',
            gesamtbrutto: 1250.00,
            items: []
        }
    ],
    customers: [
        { id: '1', firma: 'Max Mustermann', adresse: 'Musterweg 1, 12345 Stadt' },
        { id: '2', firma: 'Bau GmbH', adresse: 'Industrieallee 5, 54321 Dorf' }
    ]
};

export const store = {
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
            localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_DATA.invoices));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_DATA.customers));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        }
    },

    getInvoices() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES)) || [];
    },

    getCustomers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
    },

    getSettings() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    },

    saveInvoices(invoices) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    },

    saveCustomers(customers) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    },

    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    getInvoiceById(id) {
        return this.getInvoices().find(i => i.id == id);
    },

    getCustomerById(id) {
        return this.getCustomers().find(c => c.id == id);
    },

    getStats() {
        const invoices = this.getInvoices();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return {
            offen_betrag: invoices.filter(i => i.status === 'offen').reduce((sum, i) => sum + i.gesamtbrutto, 0),
            offen_anzahl: invoices.filter(i => i.status === 'offen').length,
            ueberfaellig_anzahl: invoices.filter(i => i.status === 'offen' && new Date(i.faelligkeitsdatum) < now).length,
            monat_umsatz: invoices.filter(i => i.status === 'bezahlt' && new Date(i.datum) >= startOfMonth).reduce((sum, i) => sum + i.gesamtbrutto, 0),
            jahr_umsatz: invoices.filter(i => i.status === 'bezahlt' && new Date(i.datum) >= startOfYear).reduce((sum, i) => sum + i.gesamtbrutto, 0),
        };
    }
};
