export interface IncidentReportPoint {
  id: string
  text: string
}

export interface IncidentReportSection {
  id: string
  heading: string
  points: IncidentReportPoint[]
}

export interface IncidentReportDraft {
  reportNumber: string
  selectedClientId: string
  title: string
  reportDate: string
  clientName: string
  contactPerson: string
  address: string
  sections: IncidentReportSection[]
}

export interface IncidentReportPdfData {
  title: string
  report_date: string
  client_name: string
  contact_person: string
  address: string
  sections: {
    heading: string
    points: string[]
  }[]
}

export const INCIDENT_REPORT_COLORS = {
  blue: '#19459a',
  orange: '#ff6b00',
  titleGradientStart: '#2e3192',
  titleGradientEnd: '#f15a24',
  text: '#111827',
  muted: '#4b5563',
  lightBlue: '#f3f8ff',
}

export const INCIDENT_REPORT_PAGE_WIDTH = 595.28 // A4
export const INCIDENT_REPORT_PAGE_HEIGHT = 841.89

export function createId() {
  return Math.random().toString(36).substring(2, 11)
}

export function createEmptySection(heading = ''): IncidentReportSection {
  return {
    id: createId(),
    heading,
    points: [{ id: createId(), text: '' }],
  }
}

export function createDefaultDraft(): IncidentReportDraft {
  return {
    reportNumber: '',
    selectedClientId: '',
    title: 'WATER ACCUMULATION IN STORE ROOM',
    reportDate: new Date().toISOString().split('T')[0],
    clientName: 'Island Grill',
    contactPerson: 'Ms Khalia O\'connor',
    address: '2 Valentine Drive, Kingston 19',
    sections: [
      {
        id: createId(),
        heading: 'Issue',
        points: [{ id: createId(), text: 'Water has been consistently observed on the store room floor, particularly in the mornings.' }],
      },
      {
        id: createId(),
        heading: 'Observation',
        points: [
          { id: createId(), text: 'Staff reported recurring water accumulation.' },
          { id: createId(), text: 'Inspection revealed that the wall adjacent to the cold room is cold and damp.' },
          { id: createId(), text: 'Condensation was seen forming on the wall surface and running down onto the floor.' },
        ],
      },
    ],
  }
}
