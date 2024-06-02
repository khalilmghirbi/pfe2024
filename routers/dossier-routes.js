const express = require('express')
const route= express.Router()
const db= require('../models/index')
const { where } = require('sequelize')
const { sequelize, dossier, client, dossier_rdv, Dossier_cliniques, hopital, ville, users } = require('../models'); // Assurez-vous que le chemin est correct
const { dateToDbFormat } = require('../helpers/dateHelper');
const bodyParser = require('body-parser')
//const hopital_hotelsController = require("../controlles/hopital_hotelsController")




route.get('/dossiers', async (req, res, next) => {
    // Définir user_type
    const user_type = 'hopital';
    try {
        let { tableau, light_form, datedeb, dateto, dossierStatus, paiementStatus, partner, hopital_id, country, protocol_id, 
              online_consultation, cons_paid, source_rs, demande_user, treatments, appointment, patientName, patientEmail, 
              patientPhone, langue } = req.body;

        let filterCdt = '';
        let filterHAVING = '';

        // Gestion des filtres basiques
        if (light_form) {
            filterCdt += " AND dossier_extrainfos LIKE '%Ligh%'";
        }

        if (datedeb) {
            filterCdt += ` AND dc.dispatch_datetime >= '${dateToDbFormat(datedeb)}'`;
        }

        if (dateto) {
            filterCdt += ` AND dc.dispatch_datetime <= '${dateToDbFormat(dateto)} 23:59:59'`;
        }

        if (dossierStatus && Array.isArray(dossierStatus) && dossierStatus.length > 0) {
            dossierStatus = dossierStatus.map(status => parseInt(status));
            if (dossierStatus.includes(5)) {
                filterCdt += " AND dc.substatus = 2";
                filterHAVING += " HAVING MAX(dc.status_hopital) = 0";
            } else if (dossierStatus.includes(2)) {
                filterCdt += " AND dc.substatus <= 2";
                filterHAVING += " HAVING MAX(dc.status_hopital) = 2";
            } else if (dossierStatus.includes(-1)) {
                filterCdt += " AND dc.status_hopital = -1";
                filterHAVING += " HAVING MIN(dc.status_hopital) = -1";
            } else if (dossierStatus.includes(0)) {
                filterCdt += " AND dc.status_hopital = 0 AND dc.substatus <> 2 AND dc.status_hopital <> -1 AND dossier_status <> -1 AND dossier_status <> 4";
                filterHAVING += " HAVING MAX(dc.status_hopital) = 0 AND MIN(dc.status_hopital) <> -1";
            } else {
                filterCdt += ` AND dc.status_hopital IN (${dossierStatus.join(',')})`;
            }
        }

        if (paiementStatus) {
            filterCdt += ` AND d.dossier_paiement = ${parseInt(paiementStatus)}`;
        }

        if (partner) {
            filterCdt += ` AND d.dossier_partnerid = ${parseInt(partner)}`;
        }

        if (hopital_id) {
            filterCdt += ` AND dc.status = 1 AND dc.hopital_id = ${parseInt(hopital_id)}`;
        }

        if (country) {
            filterCdt += ` AND (SELECT country FROM access_ip WHERE ip_adress = d.dossier_ip) = '${country}'`;
        }

        if (protocol_id) {
            filterCdt += ` AND rdv_protocolid = '${protocol_id}'`;
        }

        if (online_consultation) {
            filterCdt += ` AND rdv_type = 1`;
        }

        if (online_consultation && cons_paid) {
            filterCdt += ` AND rdv_paid = '${cons_paid}'`;
        }

        if (source_rs) {
            filterCdt += ` AND d.traffic_source = 'social'`;
        }

        if (demande_user) {
            filterCdt += ` AND d.dossier_creator = ${parseInt(demande_user)}`;
        }

        if (treatments) {
            filterCdt += ` AND d.dossier_id IN ( 
                SELECT dossier_id FROM dossier_procedures WHERE procedure_id = ${parseInt(treatments)} OR procedure_id IN ( 
                    SELECT procedure_id FROM procedures WHERE procedure_parent_id = ${parseInt(treatments)}
                )
            )`;
        }

        if (appointment) {
            if (datedeb) {
                filterCdt += ` AND d.dossier_datecreation >= '${dateToDbFormat(datedeb)}'`;
            }

            if (dateto) {
                filterCdt += ` AND d.dossier_datecreation <= '${dateToDbFormat(dateto)} 23:59:59'`;
            }
        }

        if (patientName) {
            filterCdt += ` AND (client_nom LIKE '%${patientName}%' OR client_prenom LIKE '%${patientName}%')`;
        }

        if (patientEmail) {
            filterCdt += ` AND client_email LIKE '%${patientEmail}%'`;
        }

        if (patientPhone) {
            filterCdt += ` AND client_telephone LIKE '%${patientPhone}%'`;
        }

        if (langue && langue !== 'All') {
            filterCdt += ` AND u.user_lang = '${langue}'`;
        }

        // Construction de la requête SQL
        let sql = `SELECT 
                        d.*, 
                        MIN(dc.dispatch_datetime) AS dispatch_datetime,
                        MAX(dc.status) AS hopitalStatus,
                        (SELECT user_lang FROM users u WHERE u.client_id = client.client_id LIMIT 1) AS user_lang,
                        (SELECT country FROM access_ip WHERE ip_adress = d.dossier_ip) AS country,
                        (SELECT GROUP_CONCAT(procedure_name_en ORDER BY procedure_name_en SEPARATOR '**') FROM procedures p INNER JOIN dossier_procedures dp ON dp.procedure_id = p.procedure_id WHERE dp.dossier_id = d.dossier_id) AS list_procedures
                FROM dossier d
                INNER JOIN client ON client_id = dossier_client
                LEFT JOIN dossier_rdv ON rdv_dossier_id = d.dossier_id
                LEFT JOIN dossier_cliniques dc ON dc.dossier_id = d.dossier_id
                LEFT JOIN hopital h ON h.hopital_id = dc.hopital_id
                LEFT JOIN ville ON ville_id = dossier_destination
                LEFT JOIN users u ON u.client_id = client.client_id
                LEFT JOIN users ur ON ur.id_user = d.dossier_responsable
                WHERE 1 = 1 ${filterCdt}`;

        sql += ` AND dossier_supprime = '0000-00-00 00:00:00'
                GROUP BY d.dossier_id ${filterHAVING}
                ORDER BY COALESCE(dc.dc_urgent, 0) DESC, ${user_type !== 'hopital' ? 'd.dossier_datecreation' : 'dc.dispatch_datetime'} DESC`;

        // Log de la requête SQL pour debug
        console.log('SQL Query:', sql);

        // Exécution de la requête SQL
        const dossiers = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

        return res.status(200).json(dossiers);
    } catch (error) {
        console.error('Error retrieving dossiers:', error);
        return res.status(500).json({ message: 'Error retrieving dossiers', error: error.message });
    }
});


// Route pour annuler une quotation
route.post('/cancel', (req, res) => {
    const { quotationId } = req.body;

    if (!quotationId) {
        return res.status(400).send({ error: 'Le champ quotationId est requis.' });
    }

    const sql = 'UPDATE dossier_quotations SET quotation_status = -1 WHERE quotation_id = ?';
    conn.query(sql, [quotationId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour:', err);
            return res.status(500).send({ error: 'Erreur lors de la mise à jour de la quotation.' });
        }

        res.send({ message: 'Quotation annulée avec succès.' });
    });
});


module.exports= route
