import * as XLSX from 'xlsx';
import { Patient, FlowsheetRow } from '../types';

export const SHAREPOINT_BACKUP_URL =
  'https://ufmgbr-my.sharepoint.com/:f:/g/personal/ghcoutinho_ufmg_br/IgDsir6b37smTJL0vfJpnTPKAZC2HzvJYvWaw6TMh_12vTs?e=o3kHQc';

export const exportPatientDataToExcel = (
  patient: Patient,
  allPatients: Patient[],
  rows: FlowsheetRow[],
  timeSlots: string[]
) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Patients Summary
  const patientsData = allPatients.map((p) => ({
    'Patient ID': p.patientId,
    'Name': p.name,
    'Weight (kg)': p.weightKg,
    'Age (yrs)': p.ageYears,
    'Breed': p.breed,
    'Sex': p.sex || 'N/A',
    'Status': p.status,
    'Diagnosis': p.diagnosis,
    'Surgical Procedure': p.surgicalProcedure || 'None',
    'Assigned Surgeon': p.assignedSurgeon,
    'Intern / Resident': p.intern || 'N/A',
    'Facility': p.facility || 'N/A',
    'Next Shift Surgeon': p.nextShiftSurgeon,
    'Survival Prognosis (%)': `${p.survivalPrognosisPercent}%`,
    'On Ice Score': p.onIceScore,
    'Net Fluid Balance (L)': p.netFluidBalanceLiters,
    'Surgery Consent': p.surgeryConsentStatus || 'N/A',
    'Crib Biter': p.cribBiter ? 'Yes' : 'No',
    'Prev Abdominal Surgery': p.previousAbdominalSurgery || 'No',
    'Emergency Contact': p.ownerEmergencyContact || 'N/A',
    'Referring Vet': p.referringVetContact || 'N/A',
  }));
  const wsPatients = XLSX.utils.json_to_sheet(patientsData);
  XLSX.utils.book_append_sheet(wb, wsPatients, 'Patients Summary');

  // Sheet 2: Clinical Flowsheet
  const flowsheetData = rows.map((row) => {
    const rowObj: Record<string, any> = {
      'Category': row.categoryLabel || row.category,
      'Parameter': row.parameter,
      'Target / Range': row.target,
      'Route / Dose': row.route ? `${row.route} (${row.dosePicked || ''})` : '—',
    };

    timeSlots.forEach((slot) => {
      const cell = row.values[slot];
      if (cell) {
        let valStr = String(cell.value || '');
        if (cell.status === 'PROCESSING') valStr = '[PROCESSING]';
        else if (cell.status === 'DONE') valStr = `✓ ${valStr || row.target}`;
        else if (cell.status === 'DUE') valStr = '[DUE]';
        rowObj[slot] = valStr;
      } else {
        rowObj[slot] = '—';
      }
    });

    return rowObj;
  });
  const wsFlowsheet = XLSX.utils.json_to_sheet(flowsheetData);
  XLSX.utils.book_append_sheet(wb, wsFlowsheet, 'Clinical Flowsheet');

  // Sheet 3: Patient Specific ICU Profile
  const patientDetailData = [
    { Field: 'Patient ID', Value: patient.patientId },
    { Field: 'Horse Name', Value: patient.name },
    { Field: 'Weight (kg)', Value: `${patient.weightKg} kg` },
    { Field: 'Age & Breed', Value: `${patient.ageYears} yrs - ${patient.breed}` },
    { Field: 'Sex / Reproductive Status', Value: patient.sex || 'N/A' },
    { Field: 'Status', Value: patient.status },
    { Field: 'Diagnosis', Value: patient.diagnosis },
    { Field: 'Surgical Procedure', Value: patient.surgicalProcedure || 'None' },
    { Field: 'Surgery Consent Status', Value: patient.surgeryConsentStatus || 'N/A' },
    { Field: 'Attending Surgeon', Value: patient.assignedSurgeon },
    { Field: 'Intern / Resident', Value: patient.intern || 'N/A' },
    { Field: 'Facility', Value: patient.facility || 'N/A' },
    { Field: 'Surgery Date & Time', Value: patient.surgeryTime || 'N/A' },
    { Field: 'Next Shift Surgeon', Value: patient.nextShiftSurgeon },
    { Field: 'Survival Prognosis %', Value: `${patient.survivalPrognosisPercent}%` },
    { Field: 'ICE Score (Laminitis Risk)', Value: patient.onIceScore },
    { Field: 'Net Fluid Balance', Value: `${patient.netFluidBalanceLiters} L` },
    { Field: 'Crib-Biter / Aerophagia (EFE Risk)', Value: patient.cribBiter ? 'Yes' : 'No' },
    { Field: 'Previous Abdominal Surgery', Value: patient.previousAbdominalSurgery || 'No' },
    { Field: 'Tetanus Vaccination Date', Value: patient.tetanusVaccinationDate || 'Up to Date' },
    { Field: 'Pre-Admission Analgesia', Value: patient.preAdmissionAnalgesia || 'None' },
    { Field: 'Baseline Rectal Exam', Value: patient.rectalExamBaseline || 'N/A' },
    { Field: 'Owner / Emergency Contact', Value: patient.ownerEmergencyContact || 'N/A' },
    { Field: 'Referring Veterinarian', Value: patient.referringVetContact || 'N/A' },
  ];
  const wsDetail = XLSX.utils.json_to_sheet(patientDetailData);
  XLSX.utils.book_append_sheet(wb, wsDetail, `${patient.name} ICU Profile`);

  // Download Excel File
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Equine_Colic_ICU_${patient.name.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
