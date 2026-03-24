/**
 * Main App Controller
 */
import { store } from './store.js';
import { pages } from './pages.js';

class App {
    constructor() {
        this.pageContainer = document.getElementById('page-container');
        this.loader = document.getElementById('loader');
        this.currentPath = '';
        
        window.addEventListener('hashchange', () => this.route());
        document.addEventListener('click', (e) => this.handleClicks(e));
        
        store.init();
        this.route();
    }

    showLoader(show) {
        this.loader.style.display = show ? 'block' : 'none';
    }

    route() {
        const hash = window.location.hash || '#dashboard';
        const [path, id] = hash.slice(1).split('/');
        this.currentPath = path;

        this.showLoader(true);
        
        // Update active sidebar link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === path);
        });

        // Dynamic Routing
        let html = '';
        setTimeout(() => { // Simulate slight loading for feel
            switch(path) {
                case 'dashboard': html = pages.dashboard(); break;
                case 'rechnungen': html = pages.rechnungen(); break;
                case 'rechnung-neu': html = pages.rechnungForm(); break;
                case 'rechnung-edit': html = pages.rechnungForm(id); break;
                case 'kunden': html = pages.customerList(); break;
                case 'einstellungen': html = pages.settings(); break;
                default: html = pages.dashboard();
            }
            
            this.pageContainer.innerHTML = html;
            this.showLoader(false);
            
            // Initialization for specific pages
            if (path.startsWith('rechnung-')) {
                this.initInvoiceForm(id);
            }
        }, 150);
    }

    handleClicks(e) {
        const link = e.target.closest('[data-link]');
        if (link) {
            window.location.hash = link.dataset.link;
        }

        const action = e.target.closest('[data-action]');
        if (action) {
            this.handleAction(action.dataset.action, action.dataset.id);
        }
    }

    handleAction(action, id) {
        switch(action) {
            case 'edit-invoice': window.location.hash = `rechnung-edit/${id}`; break;
            case 'mark-paid': this.markAsPaid(id); break;
            case 'delete-invoice': this.deleteInvoice(id); break;
        }
    }

    // --- Invoice Form Logic ---
    initInvoiceForm(id) {
        const form = document.getElementById('invoice-form');
        if (!form) return;

        // Add event listeners for live preview
        form.addEventListener('input', () => this.updatePreview());
        
        // Initial items if editing
        if (id) {
            const invoice = store.getInvoiceById(id);
            if (invoice && invoice.items) {
                invoice.items.forEach(item => this.addItem(item.typ, item));
            }
        } else {
            this.addItem('artikel');
        }
        
        this.updatePreview();
    }

    addItem(type = 'artikel', data = null) {
        const tbody = document.getElementById('items-body');
        if (!tbody) return;

        const rowId = Date.now() + Math.random().toString(36).substr(2, 5);
        const tr = document.createElement('tr');
        tr.id = `row-${rowId}`;
        tr.dataset.type = type;

        const descValue = data ? data.bezeichnung : '';
        const mengeValue = data ? data.menge : (type === 'artikel' ? 1 : 0);
        const preisValue = data ? data.einzelpreis : 0;

        if (type === 'artikel') {
            tr.innerHTML = `
                <td><i class="fa-solid fa-box" style="color: var(--accent);"></i></td>
                <td><input type="number" name="menge" value="${mengeValue}" step="0.01"></td>
                <td><input type="text" name="bezeichnung" value="${descValue}" placeholder="Leistungsbeschreibung..."></td>
                <td><input type="number" name="einzelpreis" value="${preisValue}" step="0.01"></td>
                <td class="text-right">
                    <button type="button" class="btn-icon" onclick="app.removeRow('${rowId}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        } else {
            tr.innerHTML = `
                <td><i class="fa-solid fa-font" style="color: var(--text-muted);"></i></td>
                <td colspan="3"><input type="text" name="bezeichnung" value="${descValue}" placeholder="Textzeile oder Überschrift..."></td>
                <td class="text-right">
                    <button type="button" class="btn-icon" onclick="app.removeRow('${rowId}')"><i class="fa-solid fa-trash"></i></button>
                </td>
                <input type="hidden" name="menge" value="0">
                <input type="hidden" name="einzelpreis" value="0">
            `;
        }
        tbody.appendChild(tr);
        this.updatePreview();
    }

    removeRow(id) {
        const row = document.getElementById(`row-${id}`);
        if (row) row.remove();
        this.updatePreview();
    }

    updatePreview() {
        const form = document.getElementById('invoice-form');
        if (!form) return;

        const formData = new FormData(form);
        const mwstSatz = parseFloat(formData.get('mwst_satz'));
        
        // Basic Info
        document.getElementById('preview-rechnungsnummer').innerText = formData.get('rechnungsnummer');
        document.getElementById('preview-datum').innerText = this.formatDateSimple(formData.get('datum'));
        document.getElementById('preview-mwst-label').innerText = mwstSatz;
        document.getElementById('summary-mwst-label').innerText = mwstSatz;

        // Items Preview
        const previewBody = document.getElementById('preview-items-body');
        previewBody.innerHTML = '';
        let totalNetto = 0;

        const rows = document.getElementById('items-body').querySelectorAll('tr');
        rows.forEach((row, index) => {
            const type = row.dataset.type;
            const menge = parseFloat(row.querySelector('[name="menge"]').value || 0);
            const desc = row.querySelector('[name="bezeichnung"]').value || '';
            const preis = parseFloat(row.querySelector('[name="einzelpreis"]').value || 0);
            const lineTotal = menge * preis;

            if (type === 'artikel') {
                totalNetto += lineTotal;
                previewBody.innerHTML += `
                    <tr style="border-bottom: 1px solid #f9f9f9;">
                        <td style="padding: 8px 0;">${index + 1}</td>
                        <td style="padding: 8px 0;">${menge.toFixed(2)} Stk</td>
                        <td style="padding: 8px 0;"><strong>${desc}</strong></td>
                        <td style="padding: 8px 0; text-align: right;">${this.formatCurrency(preis)}</td>
                        <td style="padding: 8px 0; text-align: right;">${this.formatCurrency(lineTotal)}</td>
                    </tr>
                `;
            } else {
                previewBody.innerHTML += `
                    <tr>
                        <td colspan="5" style="padding: 15px 0 5px 0; font-weight: 700; border-bottom: 1px solid #eee;">${desc}</td>
                    </tr>
                `;
            }
        });

        const totalMwst = totalNetto * (mwstSatz / 100);
        const totalBrutto = totalNetto + totalMwst;

        document.getElementById('summary-netto').innerText = this.formatCurrency(totalNetto);
        document.getElementById('summary-mwst-amount').innerText = this.formatCurrency(totalMwst);
        document.getElementById('summary-brutto').innerText = this.formatCurrency(totalBrutto);

        document.getElementById('preview-netto').innerText = this.formatCurrency(totalNetto);
        document.getElementById('preview-mwst-amount').innerText = this.formatCurrency(totalMwst);
        document.getElementById('preview-brutto').innerText = this.formatCurrency(totalBrutto);
    }

    saveInvoice() {
        const form = document.getElementById('invoice-form');
        const formData = new FormData(form);
        const id = window.location.hash.split('/')[1] || Date.now();

        const items = [];
        document.getElementById('items-body').querySelectorAll('tr').forEach(row => {
            items.push({
                typ: row.dataset.type,
                menge: parseFloat(row.querySelector('[name="menge"]').value),
                bezeichnung: row.querySelector('[name="bezeichnung"]').value,
                einzelpreis: parseFloat(row.querySelector('[name="einzelpreis"]').value)
            });
        });

        const mwstSatz = parseFloat(formData.get('mwst_satz'));
        const netto = items.reduce((sum, i) => sum + (i.menge * i.einzelpreis), 0);
        const brutto = netto * (1 + mwstSatz/100);

        const newInvoice = {
            id,
            rechnungsnummer: formData.get('rechnungsnummer'),
            datum: formData.get('datum'),
            faelligkeitsdatum: formData.get('faelligkeitsdatum'),
            kunden_id: formData.get('kunden_id'),
            mwst_satz: mwstSatz,
            status: 'offen',
            gesamtbrutto: brutto,
            items
        };

        const invoices = store.getInvoices();
        const index = invoices.findIndex(i => i.id == id);
        if (index > -1) invoices[index] = newInvoice;
        else invoices.push(newInvoice);

        store.saveInvoices(invoices);
        alert('Rechnung gespeichert!');
        window.location.hash = '#rechnungen';
    }

    markAsPaid(id) {
        const invoices = store.getInvoices();
        const inv = invoices.find(i => i.id == id);
        if (inv) {
            inv.status = 'bezahlt';
            store.saveInvoices(invoices);
            this.route();
        }
    }

    deleteInvoice(id) {
        if (!confirm('Sicher löschen?')) return;
        const invoices = store.getInvoices().filter(i => i.id != id);
        store.saveInvoices(invoices);
        this.route();
    }

    saveSettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = {
            company_name: formData.get('company_name'),
            address: formData.get('address'),
            email: formData.get('email'),
            bank: formData.get('bank'),
            iban: formData.get('iban'),
            mwst_satz: parseFloat(formData.get('mwst_satz'))
        };
        store.saveSettings(settings);
        alert('Einstellungen gespeichert!');
    }

    resetData() {
        if (confirm('Alle Daten im Browser löschen und Demo-Daten laden?')) {
            localStorage.clear();
            location.reload();
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    formatDateSimple(val) {
        if (!val) return '--.--.----';
        const [y, m, d] = val.split('-');
        return `${d}.${m}.${y}`;
    }

    filterInvoices() {
        const query = document.getElementById('invoice-search').value.toLowerCase();
        const status = document.getElementById('invoice-status-filter').value;
        const rows = document.querySelectorAll('#invoices-table tbody tr');
        
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const rowStatus = row.querySelector('.badge').classList.contains(`badge-${status}`) || status === '';
            const matches = text.includes(query) && rowStatus;
            row.style.display = matches ? '' : 'none';
        });
    }
}

// Make app globally accessible for onclick events in templates
window.app = new App();
