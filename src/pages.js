/**
 * Page Templates for Invoice Manager
 */
import { store } from './store.js';

export const pages = {
    dashboard() {
        const stats = store.getStats();
        const invoices = store.getInvoices().slice(0, 10);
        const customers = store.getCustomers();

        const formatCurrency = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
        const formatDate = (val) => new Date(val).toLocaleDateString('de-DE');

        return `
            <div id="page-header">
                <h1>Dashboard</h1>
                <div class="quick-actions">
                    <button class="btn" data-link="kunden"><i class="fa-solid fa-users"></i> Stammkunden</button>
                    <button class="btn btn-primary" data-link="rechnung-neu"><i class="fa-solid fa-plus"></i> Neue Rechnung</button>
                </div>
            </div>

            <div class="kpi-row">
                <div class="kpi-card red card">
                    <div class="label">Gesamtbetrag Offen</div>
                    <div class="value" style="color: var(--status-open)">${formatCurrency(stats.offen_betrag)}</div>
                </div>
                <div class="kpi-card card" style="border-left: 4px solid var(--accent)">
                    <div class="label">Offene Rechnungen</div>
                    <div class="value">${stats.offen_anzahl}</div>
                </div>
                <div class="kpi-card orange card">
                    <div class="label">Überfällig</div>
                    <div class="value" style="color: var(--status-overdue)">${stats.ueberfaellig_anzahl}</div>
                </div>
                <div class="kpi-card green card">
                    <div class="label">Umsatz Monat</div>
                    <div class="value" style="color: var(--status-paid-end)">${formatCurrency(stats.monat_umsatz)}</div>
                </div>
                <!-- Mini Stats with a modern glass look -->
                <div class="kpi-card card" style="border-left: 2px dashed rgba(255,255,255,0.1)">
                    <div class="label">Umsatz Jahr</div>
                    <div class="value">${formatCurrency(stats.jahr_umsatz)}</div>
                </div>
            </div>

            <section class="card">
                <div class="flex justify-between align-center mb-4">
                    <h2 style="font-size: 16px;">Aktuelle Rechnungsübersicht</h2>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Rechnungsnr.</th>
                            <th>Kundenname</th>
                            <th>Datum</th>
                            <th>Fälligkeit</th>
                            <th>Betrag (Brutto)</th>
                            <th>Status</th>
                            <th class="text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.length === 0 ? `
                            <tr>
                                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                                    Keine Rechnungen gefunden.
                                </td>
                            </tr>
                        ` : invoices.map(inv => {
                            const customer = customers.find(c => c.id == inv.kunden_id);
                            const overdue = (inv.status === 'offen' && new Date(inv.faelligkeitsdatum) < new Date());
                            const statusColor = overdue ? 'var(--status-overdue)' : '';
                            return `
                                <tr class="${inv.status === 'bezahlt' ? 'paid' : ''}">
                                    <td style="font-weight: 700;">#${inv.rechnungsnummer}</td>
                                    <td>${customer ? customer.firma : 'Unbekannt'}</td>
                                    <td>${formatDate(inv.datum)}</td>
                                    <td>
                                        <span style="${overdue ? 'color: var(--status-overdue); font-weight: bold;' : ''}">
                                            ${formatDate(inv.faelligkeitsdatum)}
                                        </span>
                                    </td>
                                    <td>${formatCurrency(inv.gesamtbrutto)}</td>
                                    <td><span class="badge badge-${overdue ? 'overdue' : inv.status}">${inv.status.toUpperCase()}</span></td>
                                    <td class="text-right">
                                        <button class="btn-icon" data-action="edit-invoice" data-id="${inv.id}" title="Bearbeiten"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-icon" onclick="window.print()" title="PDF"><i class="fa-solid fa-file-pdf"></i></button>
                                        ${inv.status === 'offen' ? `
                                            <button class="btn-icon" data-action="mark-paid" data-id="${inv.id}" title="Als bezahlt markieren"><i class="fa-solid fa-check"></i></button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </section>
        `;
    },

    rechnungen() {
        const invoices = store.getInvoices();
        const customers = store.getCustomers();
        const formatCurrency = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
        const formatDate = (val) => new Date(val).toLocaleDateString('de-DE');

        return `
            <div id="page-header">
                <h1>Rechnungen</h1>
                <div class="quick-actions">
                    <button class="btn btn-primary" data-link="rechnung-neu"><i class="fa-solid fa-plus"></i> Neue Rechnung</button>
                </div>
            </div>

            <section class="card mb-4" style="padding: 16px;">
                <div class="flex" style="gap: 12px;">
                    <div style="flex: 1; position: relative;">
                        <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 12px; color: var(--text-muted);"></i>
                        <input type="text" id="invoice-search" placeholder="Suchen nach Rechnungsnr. oder Kundenname..." style="padding-left: 40px;" onkeyup="app.filterInvoices()">
                    </div>
                    <select id="invoice-status-filter" style="max-width: 150px;" onchange="app.filterInvoices()">
                        <option value="">Status: Alle</option>
                        <option value="offen">Offen</option>
                        <option value="bezahlt">Bezahlt</option>
                        <option value="storniert">Storniert</option>
                    </select>
                </div>
            </section>

            <section class="card">
                <table id="invoices-table">
                    <thead>
                        <tr>
                            <th>Rechnungsnr.</th>
                            <th>Kundenname</th>
                            <th>Datum</th>
                            <th>Fälligkeit</th>
                            <th>Betrag (Brutto)</th>
                            <th>Status</th>
                            <th class="text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.map(inv => {
                            const customer = customers.find(c => c.id == inv.kunden_id);
                            return `
                                <tr class="${inv.status === 'bezahlt' ? 'paid' : ''}">
                                    <td style="font-weight: 700;">#${inv.rechnungsnummer}</td>
                                    <td>${customer ? customer.firma : 'Unbekannt'}</td>
                                    <td>${formatDate(inv.datum)}</td>
                                    <td>${formatDate(inv.faelligkeitsdatum)}</td>
                                    <td>${formatCurrency(inv.gesamtbrutto)}</td>
                                    <td><span class="badge badge-${inv.status}">${inv.status.toUpperCase()}</span></td>
                                    <td class="text-right">
                                        <button class="btn-icon" data-action="edit-invoice" data-id="${inv.id}"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-icon" onclick="window.print()"><i class="fa-solid fa-file-pdf"></i></button>
                                        <button class="btn-icon" data-action="delete-invoice" data-id="${inv.id}" style="color: rgba(255,255,255,0.3)"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </section>
        `;
    },

    customerList() {
        const customers = store.getCustomers();
        return `
            <div id="page-header">
                <h1>Stammkunden</h1>
                <div class="quick-actions">
                    <button class="btn btn-primary" data-action="new-customer"><i class="fa-solid fa-plus"></i> Neuer Kunde</button>
                </div>
            </div>
            <section class="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Firma / Name</th>
                            <th>Adresse</th>
                            <th class="text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td><strong>${c.firma}</strong></td>
                                <td>${c.adresse}</td>
                                <td class="text-right">
                                    <button class="btn-icon"><i class="fa-solid fa-pen"></i></button>
                                    <button class="btn-icon"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </section>
        `;
    },

    rechnungForm(id = null) {
        const settings = store.getSettings();
        const customers = store.getCustomers();
        const invoice = id ? store.getInvoiceById(id) : {
            rechnungsnummer: `RE-${new Date().getFullYear()}-${String(store.getInvoices().length + 1).padStart(3, '0')}`,
            datum: new Date().toISOString().split('T')[0],
            faelligkeitsdatum: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            kunden_id: '',
            items: [],
            mwst_satz: settings.mwst_satz,
            status: 'offen'
        };

        return `
            <div id="page-header">
                <h1>${id ? 'Rechnung bearbeiten' : 'Neue Rechnung'}</h1>
                <div class="quick-actions">
                    <button class="btn" data-link="rechnungen"><i class="fa-solid fa-arrow-left"></i> Zurück</button>
                    <button type="button" class="btn btn-primary" onclick="app.saveInvoice()"><i class="fa-solid fa-floppy-disk"></i> Speichern</button>
                </div>
            </div>

            <div class="flex" style="gap: 32px; align-items: flex-start;">
                <!-- Left: Form -->
                <div class="col-form" style="flex: 1.2;">
                    <form id="invoice-form">
                        <section class="card">
                            <h2 class="mb-4" style="font-size: 16px;">Kopfdaten</h2>
                            <div class="flex" style="gap: 16px; flex-wrap: wrap;">
                                <div class="form-group" style="flex: 1; min-width: 150px;">
                                    <label>Rechnungsnummer (JJJJ-NNN)</label>
                                    <input type="text" name="rechnungsnummer" value="${invoice.rechnungsnummer}">
                                </div>
                                <div class="form-group" style="flex: 1; min-width: 120px;">
                                    <label>Rechnungsdatum</label>
                                    <input type="date" name="datum" value="${invoice.datum}">
                                </div>
                                <div class="form-group" style="flex: 1; min-width: 120px;">
                                    <label>Liefer-/Leistungsdatum</label>
                                    <input type="date" name="lieferdatum" value="${invoice.lieferdatum || invoice.datum}">
                                </div>
                            </div>
                            <div class="flex" style="gap: 16px; flex-wrap: wrap;">
                                <div class="form-group" style="flex: 1; min-width: 150px;">
                                    <label>Zahlungsziel</label>
                                    <select name="zahlungsziel_tage" onchange="app.calculateDueDate(this.value)">
                                        <option value="7" ${invoice.zahlungsziel_tage == 7 ? 'selected' : ''}>7 Tage</option>
                                        <option value="14" ${invoice.zahlungsziel_tage == 14 ? 'selected' : ''}>14 Tage</option>
                                        <option value="30" ${invoice.zahlungsziel_tage == 30 ? 'selected' : ''}>30 Tage</option>
                                    </select>
                                </div>
                                <div class="form-group" style="flex: 1; min-width: 150px;">
                                    <label>Fälligkeitsdatum</label>
                                    <input type="date" name="faelligkeitsdatum" value="${invoice.faelligkeitsdatum}">
                                </div>
                                <div class="form-group" style="flex: 1; min-width: 150px;">
                                    <label>Status</label>
                                    <select name="status">
                                        <option value="offen" ${invoice.status == 'offen' ? 'selected' : ''}>Offen</option>
                                        <option value="bezahlt" ${invoice.status == 'bezahlt' ? 'selected' : ''}>Bezahlt</option>
                                        <option value="storniert" ${invoice.status == 'storniert' ? 'selected' : ''}>Storniert</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Kunde (Stammkunde wählen)</label>
                                <select name="kunden_id" onchange="app.selectCustomer(this.value)">
                                    <option value="">-- Kunden wählen --</option>
                                    ${customers.map(c => `<option value="${c.id}" ${c.id == invoice.kunden_id ? 'selected' : ''}>${c.firma}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Wartungstyp / Betreff (z.B. Heizungswartung Ölfeuerungsanlage)</label>
                                <input type="text" name="wartungstyp" value="${invoice.wartungstyp || ''}" placeholder="Freitext für Betreffzeile...">
                            </div>
                        </section>

                        <section class="card">
                             <div class="flex justify-between align-center mb-4">
                                <h2 style="font-size: 16px;">Positionen</h2>
                                <div class="flex" style="gap: 8px;">
                                    <button type="button" class="btn btn-secondary" onclick="app.addItem('text')" style="background: rgba(255,255,255,0.05); font-size: 12px; padding: 6px 12px;"><i class="fa-solid fa-font"></i> Textzeile</button>
                                    <button type="button" class="btn btn-secondary" onclick="app.addItem('artikel')" style="background: rgba(255,255,255,0.05); font-size: 12px; padding: 6px 12px;"><i class="fa-solid fa-box"></i> Artikel</button>
                                </div>
                            </div>
                            
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th width="40">Typ</th>
                                        <th width="80">Menge</th>
                                        <th>Bezeichnung / Leistung</th>
                                        <th width="100">E-Preis</th>
                                        <th width="50" class="text-right"></th>
                                    </tr>
                                </thead>
                                <tbody id="items-body">
                                    <!-- Items via JS -->
                                </tbody>
                            </table>

                            <div class="mt-4 flex justify-between align-center">
                                <select name="mwst_satz" style="width: 150px;">
                                    <option value="19" ${invoice.mwst_satz == 19 ? 'selected' : ''}>19% MwSt.</option>
                                    <option value="7" ${invoice.mwst_satz == 7 ? 'selected' : ''}>7% MwSt.</option>
                                    <option value="0" ${invoice.mwst_satz == 0 ? 'selected' : ''}>Steuerfrei</option>
                                </select>
                                <div class="text-right">
                                    <div style="font-size: 12px; color: var(--text-muted);">Netto: <span id="summary-netto">0,00 €</span></div>
                                    <div style="font-size: 12px; color: var(--text-muted);">MwSt (<span id="summary-mwst-label">19</span>%): <span id="summary-mwst-amount">0,00 €</span></div>
                                    <div style="font-size: 18px; font-weight: 700; color: #fff; margin-top: 5px;">Brutto: <span id="summary-brutto">0,00 €</span></div>
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                <!-- Right: Preview (A4 Mockup) -->
                <div class="col-preview" style="flex: 1; position: sticky; top: 20px;">
                    <div id="a4-preview" style="background: #fff; color: #000; width: 100%; aspect-ratio: 1/1.414; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); font-size: 11px; color: #333;">
                        <!-- Preview Header -->
                        <div class="flex justify-between" style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
                            <div style="font-weight: 800; font-size: 18px; color: #000;">GHS HEIZUNG</div>
                            <div class="text-right" style="font-size: 10px;">
                                <strong>Meisterbetrieb</strong><br>
                                ${settings.address}<br>
                                ${settings.email}<br>
                                Tel: 0123 / 456789
                            </div>
                        </div>

                        <!-- Customer Info -->
                        <div style="margin-bottom: 40px;">
                            <div style="font-size: 8px; text-decoration: underline; margin-bottom: 5px;">GHS Heizung • ${settings.address}</div>
                            <div id="preview-customer-name" style="font-size: 13px; font-weight: 600;">Max Mustermann</div>
                            <div id="preview-customer-address">Musterweg 1, 12345 Stadt</div>
                        </div>

                        <!-- Invoice Title -->
                        <div style="margin-bottom: 30px;">
                            <h2 style="font-size: 18px; font-weight: 800; color: #000; margin-bottom: 5px;">RECHNUNG</h2>
                            <div class="flex" style="gap: 40px;">
                                <div>Rechnungsnummer: <strong id="preview-rechnungsnummer">RE-2024-001</strong></div>
                                <div>Datum: <strong id="preview-datum">01.01.2024</strong></div>
                            </div>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            <thead style="border-bottom: 1px solid #eee;">
                                <tr>
                                    <th style="padding: 10px 0; text-align: left; color: #666;">Pos.</th>
                                    <th style="padding: 10px 0; text-align: left; color: #666;">Menge</th>
                                    <th style="padding: 10px 0; text-align: left; color: #666;">Bezeichnung</th>
                                    <th style="padding: 10px 0; text-align: right; color: #666;">E-Preis</th>
                                    <th style="padding: 10px 0; text-align: right; color: #666;">Gesamt</th>
                                </tr>
                            </thead>
                            <tbody id="preview-items-body" style="font-size: 10px;">
                                <!-- Items via JS -->
                            </tbody>
                        </table>

                        <div style="float: right; width: 45%; border-top: 1px solid #000; padding-top: 10px;">
                            <div class="flex justify-between" style="margin-bottom: 5px;">
                                <span>Netto Gesamt</span>
                                <span id="preview-netto">0,00 €</span>
                            </div>
                            <div class="flex justify-between" style="margin-bottom: 5px;">
                                <span>Zzgl. <span id="preview-mwst-label">19</span>% MwSt.</span>
                                <span id="preview-mwst-amount">0,00 €</span>
                            </div>
                            <div class="flex justify-between" style="font-size: 14px; font-weight: 800; border-top: 1px solid #eee; padding-top: 5px; margin-top: 5px;">
                                <span>Gesamtbetrag</span>
                                <span id="preview-brutto">0,00 €</span>
                            </div>
                        </div>
                        
                        <div style="clear: both; margin-top: 50px; font-size: 9px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="font-weight: 700; margin-bottom: 10px;">${settings.zahlungszusatz}</p>
                            <p>Bitte überweisen Sie den Rechnungsbetrag innerhalb von ${invoice.zahlungsziel_tage || 14} Tagen unter Angabe der Rechnungsnummer auf das unten genannte Konto.</p>
                            
                            <div class="flex" style="margin-top: 15px; border-top: 1px dashed #eee; padding-top: 10px; gap: 30px;">
                                <div style="flex: 1;">
                                    <strong>Steuerdaten:</strong><br>
                                    Länderschlüssel: ${settings.laenderschlüssel}<br>
                                    Finanzamt: ${settings.finanzamt}<br>
                                    Steuernummber: ${settings.steuernummer}<br>
                                    USt-IdNr.: ${settings.ust_id}
                                </div>
                                <div style="flex: 1;">
                                    <strong>Bankverbindung:</strong><br>
                                    ${settings.bank_name}<br>
                                    Inhaber: ${settings.kontoinhaber}<br>
                                    IBAN: ${settings.iban}<br>
                                    BIC: ${settings.bic}
                                </div>
                            </div>
                            <p style="margin-top: 15px; font-style: italic; font-size: 8px;">${settings.pflichtenhinweis} • ${settings.freistellungstext}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    settings() {
        const settings = store.getSettings();
        return `
            <div id="page-header">
                <h1>Einstellungen</h1>
            </div>
            <div class="card" style="max-width: 800px;">
                <form id="settings-form" onsubmit="app.saveSettings(event)">
                    <h3 class="mb-4" style="font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">Firmendaten</h3>
                    <div class="flex" style="gap: 16px;">
                        <div class="form-group" style="flex: 1;">
                            <label>Firmenname</label>
                            <input type="text" name="company_name" value="${settings.company_name}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Email</label>
                            <input type="email" name="email" value="${settings.email}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Vollständige Adresse</label>
                        <textarea name="address" rows="2">${settings.address}</textarea>
                    </div>

                    <h3 class="mb-4 mt-4" style="font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">Rechtliches & Steuern</h3>
                    <div class="flex" style="gap: 16px;">
                        <div class="form-group" style="flex: 1;">
                            <label>USt-IdNr.</label>
                            <input type="text" name="ust_id" value="${settings.ust_id}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Steuernummer</label>
                            <input type="text" name="steuernummer" value="${settings.steuernummer}">
                        </div>
                    </div>
                    <div class="flex" style="gap: 16px;">
                        <div class="form-group" style="flex: 1;">
                            <label>Finanzamt</label>
                            <input type="text" name="finanzamt" value="${settings.finanzamt}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Länderschlüssel</label>
                            <input type="text" name="laenderschlüssel" value="${settings.laenderschlüssel}">
                        </div>
                    </div>
                    
                    <h3 class="mb-4 mt-4" style="font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">Bankverbindung</h3>
                    <div class="flex" style="gap: 16px;">
                        <div class="form-group" style="flex: 1;">
                            <label>Bankname</label>
                            <input type="text" name="bank_name" value="${settings.bank_name}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Kontoinhaber</label>
                            <input type="text" name="kontoinhaber" value="${settings.kontoinhaber}">
                        </div>
                    </div>
                    <div class="flex" style="gap: 16px;">
                        <div class="form-group" style="flex: 1;">
                            <label>IBAN</label>
                            <input type="text" name="iban" value="${settings.iban}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>BIC</label>
                            <input type="text" name="bic" value="${settings.bic}">
                        </div>
                    </div>

                    <h3 class="mb-4 mt-4" style="font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">Standardtexte</h3>
                    <div class="form-group">
                        <label>Pflichtenhinweis (§14b UStG)</label>
                        <input type="text" name="pflichtenhinweis" value="${settings.pflichtenhinweis}">
                    </div>
                    <div class="form-group">
                        <label>Freistellungstext</label>
                        <input type="text" name="freistellungstext" value="${settings.freistellungstext}">
                    </div>
                    <div class="form-group">
                        <label>Zusatzhinweis Bank (Hervorgehoben)</label>
                        <input type="text" name="zahlungszusatz" value="${settings.zahlungszusatz}">
                    </div>

                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">Konfiguration speichern</button>
                        <button type="button" class="btn" style="background: rgba(255,0,0,0.1); color: #ff5555; margin-left: 10px;" onclick="app.resetData()">Werkseinstellungen</button>
                    </div>
                </form>
            </div>
        `;
    }
};
