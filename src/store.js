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
    company_name: 'GHS Heizung & Sanitär',
    address: 'Pfannenstiel 1, 82386 Huglfing',
    email: 'info@ghs-heizung.de',
    ust_id: 'DE310495725',
    steuernummer: '168 222 50223',
    finanzamt: 'München 1',
    laenderschlüssel: '9',
    mwst_satz: 19,
    zahlungsziel_standard: 14,
    bank_name: 'VR-Bank Starnberg-Zugspitze',
    iban: 'DE12 3456 7890 0000 0000 00',
    bic: 'GENODEF1MUN',
    kontoinhaber: 'Martin Grimm',
    pflichtenhinweis: 'Aufbewahrungspflicht gemäß §14b UStG (10 Jahre)',
    freistellungstext: 'Ein gültiger Freistellungsbescheid zum Steuerabzug bei Bauleistungen liegt vor.',
    zahlungszusatz: 'Achtung! Neue Bankverbindung!'
};

const INITIAL_DATA = {
    invoices: [
        {
            id: '1',
            rechnungsnummer: '2024-001',
            kunden_id: '1',
            datum: '2024-03-01',
            lieferdatum: '2024-03-01',
            faelligkeitsdatum: '2024-03-15',
            zahlungsziel_tage: 14,
            status: 'offen',
            wartungstyp: 'Heizungswartung Öl',
            gesamtbrutto: 450.50,
            mwst_satz: 19,
            items: [
                { id: 'item1', menge: 2, bezeichnung: 'Wartung Brennwerttherme inkl. Düse & Ölfilter', einzelpreis: 150, einheit: 'Stk', typ: 'artikel' },
                { id: 'item2', menge: 1, bezeichnung: 'KFZ-Pauschale & Anfahrt', einzelpreis: 45, einheit: 'Stk', typ: 'artikel' }
            ]
        },
        {
            id: '2',
            rechnungsnummer: '2024-002',
            kunden_id: '2',
            datum: '2024-03-10',
            lieferdatum: '2024-03-10',
            faelligkeitsdatum: '2024-03-24',
            zahlungsziel_tage: 14,
            status: 'bezahlt',
            wartungstyp: 'Notdienst Rohrreinigung',
            gesamtbrutto: 1250.00,
            mwst_satz: 19,
            items: [
                { id: 'item3', menge: 10, bezeichnung: 'Arbeitszeit Fachmonteur', einzelpreis: 85, einheit: 'Std', typ: 'artikel' }
            ]
        }
    ],
    customers: [
        { id: '1', firma: 'Max Mustermann', ansprechpartner: 'Herr Mustermann', strasse: 'Musterweg 1', plz: '12345', ort: 'Musterstadt', email: 'max@mustermann.de', telefon: '0170 12345678', notizen: '' },
        { id: '2', firma: 'Bau GmbH', ansprechpartner: 'Thomas Bauer', strasse: 'Industrieallee 5', plz: '54321', ort: 'Dorfingen', email: 'service@baugmbh.de', telefon: '089 54321', notizen: 'Rechnung immer per Mail' }
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
