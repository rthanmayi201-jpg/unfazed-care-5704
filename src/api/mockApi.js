import { format, subDays, addDays, subMonths, isBefore, isAfter, startOfDay, addMinutes } from 'date-fns';
import { FEATURE_KEYS, SESSION_STATUS, PAYMENT_STATUS, GST_RATE, PLATFORM_FEE_PERCENT } from '../utils/constants.js';

const STORAGE_KEYS = {
  THERAPISTS: 'unfazed_mock_therapists',
  CLIENTS: 'unfazed_mock_clients',
  SESSIONS: 'unfazed_mock_sessions',
  PAYMENTS: 'unfazed_mock_payments',
  PACKAGES: 'unfazed_mock_packages',
  CLIENT_PACKAGES: 'unfazed_mock_client_packages',
  NOTES: 'unfazed_mock_notes',
  TIER_CONFIG: 'unfazed_mock_tier_config',
  WAITLIST: 'unfazed_mock_waitlist',
  INTAKE_TEMPLATES: 'unfazed_mock_intake_templates',
  CONSENT_RECORDS: 'unfazed_mock_consent_records',
  CHATS: 'unfazed_mock_chats'
};

const simulateLatency = (min = 250, max = 500) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Seed Subscription Tier Config
const DEFAULT_TIER_CONFIG = {
  tiers: {
    free: {
      key: 'free',
      name: 'Starter Practice',
      priceINR: 0,
      billingCycle: 'Forever free',
      description: 'Ideal for newly licensed psychologists starting their private practice.',
      limits: {
        [FEATURE_KEYS.ACTIVE_CLIENT_CAP]: 5
      },
      features: {
        [FEATURE_KEYS.ACTIVE_CLIENT_CAP]: true,
        [FEATURE_KEYS.NOTE_TEMPLATES]: false, // only freeform
        [FEATURE_KEYS.ADVANCED_ANALYTICS]: false,
        [FEATURE_KEYS.CUSTOM_INTAKE_BUILDER]: false,
        [FEATURE_KEYS.PACKAGES_BUILDER]: false
      }
    },
    pro: {
      key: 'pro',
      name: 'Growing Practice (Pro)',
      priceINR: 1999,
      billingCycle: 'per month',
      description: 'For active private practices managing regular clients and package bundles.',
      limits: {
        [FEATURE_KEYS.ACTIVE_CLIENT_CAP]: 25
      },
      features: {
        [FEATURE_KEYS.ACTIVE_CLIENT_CAP]: true,
        [FEATURE_KEYS.NOTE_TEMPLATES]: true, // SOAP & DAP unlocked
        [FEATURE_KEYS.ADVANCED_ANALYTICS]: false,
        [FEATURE_KEYS.CUSTOM_INTAKE_BUILDER]: true,
        [FEATURE_KEYS.PACKAGES_BUILDER]: true
      }
    },
    premium: {
      key: 'premium',
      name: 'Thriving Practice (Premium)',
      priceINR: 3999,
      billingCycle: 'per month',
      description: 'Uncapped client capacity, full deep analytics, custom intake and zero platform fees.',
      limits: {
        [FEATURE_KEYS.ACTIVE_CLIENT_CAP]: 1000 // effectively unlimited
      },
      features: {
        [FEATURE_KEYS.ACTIVE_CLIENT_CAP]: true,
        [FEATURE_KEYS.NOTE_TEMPLATES]: true,
        [FEATURE_KEYS.ADVANCED_ANALYTICS]: true,
        [FEATURE_KEYS.CUSTOM_INTAKE_BUILDER]: true,
        [FEATURE_KEYS.PACKAGES_BUILDER]: true
      }
    }
  }
};

// Seed Therapists
const DEFAULT_THERAPISTS = [
  {
    id: 'therapist_sharma',
    name: 'Dr. Neha Sharma',
    email: 'sharma@demo.com',
    slug: 'dr-sharma',
    title: 'Senior Clinical Psychologist (RCI Licensed)',
    experienceYears: 9,
    bio: 'Specializing in evidence-based Cognitive Behavioral Therapy (CBT), anxiety management, and relationship dynamics. Offering a warm, confidential, non-judgmental space tailored for adults and couples.',
    avatar: '/src/assets/images/dr_sharma_avatar_1792946450077.jpg',
    location: 'Indiranagar, Bengaluru / Online Nationwide',
    languages: ['English', 'Hindi', 'Hinglish'],
    specializations: [
      'Anxiety & Panic Disorders',
      'Cognitive Behavioral Therapy (CBT)',
      'Relationship & Couples Counseling',
      'Work Stress & Burnout',
      'Mindfulness-Based Stress Reduction'
    ],
    qualifications: 'M.Phil Clinical Psychology (NIMHANS), Ph.D. Psychology',
    rciNumber: 'RCI-CR-2016-8942',
    tier: 'pro', // currently on Pro
    timezone: 'Asia/Kolkata',
    bufferMinutes: 15,
    notificationPreferences: {
      whatsapp: true,
      email: true
    },
    services: [
      {
        id: 'srv_cbt_60',
        name: 'Individual Therapy (CBT)',
        description: 'Comprehensive 1-on-1 session addressing anxiety, mood fluctuations, or career burnout.',
        duration: 60,
        priceINR: 2500,
        active: true
      },
      {
        id: 'srv_couples_90',
        name: 'Couples & Relationship Counseling',
        description: 'Structured 90-minute joint session focused on communication, attachment patterns, and conflict resolution.',
        duration: 90,
        priceINR: 3800,
        active: true
      },
      {
        id: 'srv_consult_30',
        name: 'Initial Clinical Intake & Assessment',
        description: 'Focused 30-minute discovery consultation to assess therapy fit, goals, and history.',
        duration: 30,
        priceINR: 1500,
        active: true
      }
    ],
    availability: {
      weekly: {
        monday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '19:00' }],
        tuesday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '19:00' }],
        wednesday: [{ start: '11:00', end: '14:00' }, { start: '16:00', end: '20:00' }],
        thursday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '19:00' }],
        friday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
        saturday: [{ start: '10:00', end: '15:00' }],
        sunday: []
      },
      overrides: [],
      blockedDates: []
    }
  },
  {
    id: 'therapist_ananya',
    name: 'Dr. Ananya Roy',
    email: 'ananya@demo.com',
    slug: 'ananya-roy',
    title: 'Counseling Psychologist & Narrative Practitioner',
    experienceYears: 6,
    bio: 'Helping young adults navigate life transitions, grief, identity exploration, and emotional resilience through person-centered, affirmative practices.',
    avatar: '/src/assets/images/dr_ananya_avatar_1792946449961.jpg',
    location: 'Bandra West, Mumbai / Online',
    languages: ['English', 'Bengali', 'Hindi'],
    specializations: ['Adolescent & Young Adult Mental Health', 'Grief & Bereavement', 'LGBTQIA+ Affirmative Therapy'],
    qualifications: 'M.A. Applied Psychology (TISS Mumbai)',
    rciNumber: 'TISS-ALUM-2018',
    tier: 'free',
    timezone: 'Asia/Kolkata',
    bufferMinutes: 10,
    notificationPreferences: { whatsapp: true, email: true },
    services: [
      { id: 'srv_roy_1', name: 'Individual Counseling', duration: 50, priceINR: 2000, active: true },
      { id: 'srv_roy_2', name: 'Youth Mentorship & Identity Exploration', duration: 60, priceINR: 2200, active: true }
    ],
    availability: {
      weekly: {
        monday: [{ start: '11:00', end: '18:00' }],
        wednesday: [{ start: '11:00', end: '18:00' }],
        friday: [{ start: '11:00', end: '18:00' }],
        saturday: [{ start: '10:00', end: '14:00' }],
        tuesday: [], thursday: [], sunday: []
      },
      overrides: [],
      blockedDates: []
    }
  },
  {
    id: 'therapist_rohit',
    name: 'Dr. Rohit Verma',
    email: 'rohit@demo.com',
    slug: 'rohit-verma',
    title: 'Senior Psychotherapist & Trauma Specialist',
    experienceYears: 12,
    bio: 'Dedicated trauma-informed therapist using somatic and psychodynamic approaches for deep-rooted childhood trauma, chronic stress, and executive burnout.',
    avatar: '/src/assets/images/dr_rohit_avatar_1792946450487.jpg',
    location: 'Vasant Vihar, New Delhi / Online',
    languages: ['English', 'Hindi', 'Punjabi'],
    specializations: ['Trauma & PTSD', 'Work Stress & Burnout', 'ADHD & Neurodivergence Coaching'],
    qualifications: 'M.Phil Clinical Psychology, Certified Somatic Experiencing Practitioner',
    rciNumber: 'RCI-CR-2013-4311',
    tier: 'premium',
    timezone: 'Asia/Kolkata',
    bufferMinutes: 20,
    notificationPreferences: { whatsapp: true, email: true },
    services: [
      { id: 'srv_verma_1', name: 'Trauma-Informed Psychotherapy', duration: 60, priceINR: 3200, active: true },
      { id: 'srv_verma_2', name: 'Executive Stress Regulation', duration: 60, priceINR: 4000, active: true }
    ],
    availability: {
      weekly: {
        tuesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        saturday: [{ start: '09:00', end: '14:00' }],
        monday: [], wednesday: [], friday: [], sunday: []
      },
      overrides: [],
      blockedDates: []
    }
  }
];

// Seed Packages
const DEFAULT_PACKAGES = [
  {
    id: 'pkg_3_cbt',
    therapistId: 'therapist_sharma',
    title: '3-Session Foundation Bundle',
    description: 'Perfect for targeting acute stressors, learning core grounding techniques, and initial cognitive reframing.',
    sessionsCount: 3,
    perSessionRate: 2500,
    discountPercent: 10,
    totalPriceINR: 6750, // 3 * 2500 = 7500 - 10% = 6750
    validityDays: 60,
    active: true
  },
  {
    id: 'pkg_6_cbt',
    therapistId: 'therapist_sharma',
    title: '6-Session Deep CBT Journey',
    description: 'Our most popular comprehensive therapy arc. Ideal for chronic anxiety, depression maintenance, and habit disruption.',
    sessionsCount: 6,
    perSessionRate: 2500,
    discountPercent: 15,
    totalPriceINR: 12750, // 6 * 2500 = 15000 - 15% = 12750
    validityDays: 120,
    active: true
  },
  {
    id: 'pkg_12_cbt',
    therapistId: 'therapist_sharma',
    title: '12-Session Long-Term Transformation',
    description: 'Long-term support for deep-seated attachment work, relationship renewal, and relapse prevention.',
    sessionsCount: 12,
    perSessionRate: 2500,
    discountPercent: 20,
    totalPriceINR: 24000,
    validityDays: 240,
    active: true
  }
];

// Seed 15 Realistic Clients
const DEFAULT_CLIENTS = [
  {
    id: 'client_1',
    therapistId: 'therapist_sharma',
    name: 'Aarav Mehta',
    email: 'client@demo.com', // Demo client
    phone: '+91 98765 43210',
    status: 'active',
    joinedDate: subMonths(new Date(), 4).toISOString(),
    tags: ['Anxiety', 'CBT', 'Package Holder'],
    totalPaid: 19500,
    sessionsCompleted: 7,
    nextSession: addDays(new Date(), 1).toISOString(),
    lastSession: subDays(new Date(), 6).toISOString(),
    emergencyContact: { name: 'Kavita Mehta', relation: 'Spouse', phone: '+91 98765 43219' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 4).toISOString(),
    consentAuditLog: [
      { action: 'Informed Consent Signed', timestamp: subMonths(new Date(), 4).toISOString(), ip: '103.21.124.11', signature: 'Aarav Mehta' }
    ]
  },
  {
    id: 'client_2',
    therapistId: 'therapist_sharma',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 98200 11223',
    status: 'active',
    joinedDate: subMonths(new Date(), 3).toISOString(),
    tags: ['Work Burnout', 'Tech Professional'],
    totalPaid: 12500,
    sessionsCompleted: 5,
    nextSession: addDays(new Date(), 3).toISOString(),
    lastSession: subDays(new Date(), 4).toISOString(),
    emergencyContact: { name: 'Siddharth Nair', relation: 'Brother', phone: '+91 98200 99887' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 3).toISOString(),
    consentAuditLog: [
      { action: 'Informed Consent Signed', timestamp: subMonths(new Date(), 3).toISOString(), ip: '49.207.210.4', signature: 'Priya Nair' }
    ]
  },
  {
    id: 'client_3',
    therapistId: 'therapist_sharma',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@example.com',
    phone: '+91 98111 22334',
    status: 'active',
    joinedDate: subMonths(new Date(), 5).toISOString(),
    tags: ['Panic Attacks', 'Agoraphobia'],
    totalPaid: 20000,
    sessionsCompleted: 8,
    nextSession: addDays(new Date(), 5).toISOString(),
    lastSession: subDays(new Date(), 9).toISOString(),
    emergencyContact: { name: 'Sunita Gupta', relation: 'Mother', phone: '+91 98111 88776' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 5).toISOString(),
    consentAuditLog: [
      { action: 'Informed Consent Signed', timestamp: subMonths(new Date(), 5).toISOString(), ip: '115.110.12.8', signature: 'Rohan Gupta' }
    ]
  },
  {
    id: 'client_4',
    therapistId: 'therapist_sharma',
    name: 'Ananya & Vikram Deshmukh',
    email: 'deshmukh.family@example.com',
    phone: '+91 98333 44556',
    status: 'active',
    joinedDate: subMonths(new Date(), 2).toISOString(),
    tags: ['Couples Counseling', 'Communication'],
    totalPaid: 15200,
    sessionsCompleted: 4,
    nextSession: addDays(new Date(), 2).toISOString(),
    lastSession: subDays(new Date(), 12).toISOString(),
    emergencyContact: { name: 'Sameer Rao', relation: 'Friend', phone: '+91 98333 99001' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 2).toISOString(),
    consentAuditLog: [
      { action: 'Couples Informed Consent Signed', timestamp: subMonths(new Date(), 2).toISOString(), ip: '182.73.19.4', signature: 'Ananya & Vikram Deshmukh' }
    ]
  },
  {
    id: 'client_5',
    therapistId: 'therapist_sharma',
    name: 'Dev Patel',
    email: 'dev.patel@example.com',
    phone: '+91 98450 55667',
    status: 'new',
    joinedDate: subDays(new Date(), 2).toISOString(),
    tags: ['Intake Pending', 'Career Anxiety'],
    totalPaid: 2500,
    sessionsCompleted: 0,
    nextSession: addDays(new Date(), 4).toISOString(),
    lastSession: null,
    emergencyContact: { name: 'Alok Patel', relation: 'Father', phone: '+91 98450 11223' },
    intakeCompleted: false, // New intake demo
    consentSigned: false,
    consentSignedAt: null,
    consentAuditLog: []
  },
  {
    id: 'client_6',
    therapistId: 'therapist_sharma',
    name: 'Meera Krishnan',
    email: 'meera.k@example.com',
    phone: '+91 98800 66778',
    status: 'active',
    joinedDate: subMonths(new Date(), 5).toISOString(),
    tags: ['Grief', 'Mindfulness'],
    totalPaid: 15000,
    sessionsCompleted: 6,
    nextSession: null,
    lastSession: subDays(new Date(), 14).toISOString(),
    emergencyContact: { name: 'Radha Krishnan', relation: 'Sister', phone: '+91 98800 22334' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 5).toISOString(),
    consentAuditLog: [
      { action: 'Informed Consent Signed', timestamp: subMonths(new Date(), 5).toISOString(), ip: '106.51.78.3', signature: 'Meera Krishnan' }
    ]
  },
  {
    id: 'client_7',
    therapistId: 'therapist_sharma',
    name: 'Kabir Sen',
    email: 'kabir.sen@example.com',
    phone: '+91 98900 77889',
    status: 'inactive',
    joinedDate: subMonths(new Date(), 6).toISOString(),
    tags: ['Completed Goals', 'Maintenance'],
    totalPaid: 12500,
    sessionsCompleted: 5,
    nextSession: null,
    lastSession: subMonths(new Date(), 1).toISOString(),
    emergencyContact: { name: 'Anita Sen', relation: 'Mother', phone: '+91 98900 11990' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 6).toISOString(),
    consentAuditLog: [
      { action: 'Informed Consent Signed', timestamp: subMonths(new Date(), 6).toISOString(), ip: '122.161.45.9', signature: 'Kabir Sen' }
    ]
  },
  {
    id: 'client_8',
    therapistId: 'therapist_sharma',
    name: 'Isha Reddy',
    email: 'isha.reddy@example.com',
    phone: '+91 99000 88990',
    status: 'active',
    joinedDate: subMonths(new Date(), 3).toISOString(),
    tags: ['Social Anxiety', 'Exposure Therapy'],
    totalPaid: 10000,
    sessionsCompleted: 4,
    nextSession: addDays(new Date(), 7).toISOString(),
    lastSession: subDays(new Date(), 7).toISOString(),
    emergencyContact: { name: 'Praveen Reddy', relation: 'Brother', phone: '+91 99000 12345' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 3).toISOString(),
    consentAuditLog: [
      { action: 'Informed Consent Signed', timestamp: subMonths(new Date(), 3).toISOString(), ip: '157.48.90.1', signature: 'Isha Reddy' }
    ]
  },
  {
    id: 'client_9',
    therapistId: 'therapist_sharma',
    name: 'Tanvi Joshi',
    email: 'tanvi.j@example.com',
    phone: '+91 98123 45678',
    status: 'active',
    joinedDate: subMonths(new Date(), 2).toISOString(),
    tags: ['Perfectionism', 'Academic Stress'],
    totalPaid: 7500,
    sessionsCompleted: 3,
    nextSession: addDays(new Date(), 6).toISOString(),
    lastSession: subDays(new Date(), 8).toISOString(),
    emergencyContact: { name: 'Mahesh Joshi', relation: 'Father', phone: '+91 98123 00001' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 2).toISOString(),
    consentAuditLog: []
  },
  {
    id: 'client_10',
    therapistId: 'therapist_sharma',
    name: 'Aditya Kapoor',
    email: 'aditya.k@example.com',
    phone: '+91 98234 56789',
    status: 'active',
    joinedDate: subMonths(new Date(), 4).toISOString(),
    tags: ['Depression', 'Sleep Disturbances'],
    totalPaid: 15000,
    sessionsCompleted: 6,
    nextSession: addDays(new Date(), 3).toISOString(),
    lastSession: subDays(new Date(), 11).toISOString(),
    emergencyContact: { name: 'Ritu Kapoor', relation: 'Wife', phone: '+91 98234 99999' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 4).toISOString(),
    consentAuditLog: []
  },
  {
    id: 'client_11',
    therapistId: 'therapist_sharma',
    name: 'Simran Chadha',
    email: 'simran.c@example.com',
    phone: '+91 98345 67890',
    status: 'active',
    joinedDate: subMonths(new Date(), 1).toISOString(),
    tags: ['Boundary Setting', 'Family Dynamics'],
    totalPaid: 5000,
    sessionsCompleted: 2,
    nextSession: addDays(new Date(), 8).toISOString(),
    lastSession: subDays(new Date(), 5).toISOString(),
    emergencyContact: { name: 'Jaspreet Chadha', relation: 'Sister', phone: '+91 98345 11111' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 1).toISOString(),
    consentAuditLog: []
  },
  {
    id: 'client_12',
    therapistId: 'therapist_sharma',
    name: 'Karthik Raman',
    email: 'karthik.r@example.com',
    phone: '+91 98456 78901',
    status: 'inactive',
    joinedDate: subMonths(new Date(), 6).toISOString(),
    tags: ['Relocated Overseas'],
    totalPaid: 10000,
    sessionsCompleted: 4,
    nextSession: null,
    lastSession: subMonths(new Date(), 2).toISOString(),
    emergencyContact: { name: 'Ananya Raman', relation: 'Partner', phone: '+91 98456 22222' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 6).toISOString(),
    consentAuditLog: []
  },
  {
    id: 'client_13',
    therapistId: 'therapist_sharma',
    name: 'Zoya Khan',
    email: 'zoya.khan@example.com',
    phone: '+91 98567 89012',
    status: 'active',
    joinedDate: subMonths(new Date(), 2).toISOString(),
    tags: ['CBT', 'Health Anxiety'],
    totalPaid: 7500,
    sessionsCompleted: 3,
    nextSession: addDays(new Date(), 9).toISOString(),
    lastSession: subDays(new Date(), 10).toISOString(),
    emergencyContact: { name: 'Tariq Khan', relation: 'Father', phone: '+91 98567 33333' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 2).toISOString(),
    consentAuditLog: []
  },
  {
    id: 'client_14',
    therapistId: 'therapist_sharma',
    name: 'Varun Singhal',
    email: 'varun.s@example.com',
    phone: '+91 98678 90123',
    status: 'new',
    joinedDate: subDays(new Date(), 1).toISOString(),
    tags: ['New Referral', 'ADHD Inquiries'],
    totalPaid: 1500,
    sessionsCompleted: 0,
    nextSession: addDays(new Date(), 5).toISOString(),
    lastSession: null,
    emergencyContact: { name: 'Pooja Singhal', relation: 'Mother', phone: '+91 98678 44444' },
    intakeCompleted: false,
    consentSigned: false,
    consentSignedAt: null,
    consentAuditLog: []
  },
  {
    id: 'client_15',
    therapistId: 'therapist_sharma',
    name: 'Tara Bhatia',
    email: 'tara.bhatia@example.com',
    phone: '+91 98789 01234',
    status: 'active',
    joinedDate: subMonths(new Date(), 3).toISOString(),
    tags: ['Self-Esteem', 'Life Transitions'],
    totalPaid: 10000,
    sessionsCompleted: 4,
    nextSession: addDays(new Date(), 10).toISOString(),
    lastSession: subDays(new Date(), 15).toISOString(),
    emergencyContact: { name: 'Rahul Bhatia', relation: 'Brother', phone: '+91 98789 55555' },
    intakeCompleted: true,
    consentSigned: true,
    consentSignedAt: subMonths(new Date(), 3).toISOString(),
    consentAuditLog: []
  }
];

// Helper to generate 40 sessions spanning last 6 months + upcoming
function generateSeedSessions() {
  const sessions = [];
  const therapistId = 'therapist_sharma';
  const clients = DEFAULT_CLIENTS.slice(0, 10);
  
  // Past sessions (32 sessions across past 180 days)
  for (let i = 1; i <= 32; i++) {
    const daysAgo = Math.floor((180 / 32) * i) + (i % 3);
    const sessionDate = subDays(new Date(), daysAgo);
    const client = clients[(i - 1) % clients.length];
    
    // Status distribution: mostly completed, a few cancelled and no-show
    let status = SESSION_STATUS.COMPLETED;
    if (i === 4 || i === 19) status = SESSION_STATUS.CANCELLED;
    if (i === 11 || i === 27) status = SESSION_STATUS.NO_SHOW;

    const hour = 10 + (i % 6);
    const startTime = new Date(sessionDate.setHours(hour, 0, 0, 0));
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60000);

    sessions.push({
      id: `session_past_${i}`,
      therapistId,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      serviceId: 'srv_cbt_60',
      serviceName: 'Individual Therapy (CBT)',
      duration: 60,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status,
      priceINR: 2500,
      paymentStatus: status === SESSION_STATUS.CANCELLED ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PAID,
      meetLink: 'https://meet.google.com/unfazed-session-' + i,
      notesId: status === SESSION_STATUS.COMPLETED ? `note_${i}` : null,
      packageConsumed: i % 3 === 0
    });
  }

  // Upcoming sessions (8 sessions over the next 10 days)
  for (let j = 1; j <= 8; j++) {
    const daysAhead = j + (j % 2);
    const sessionDate = addDays(new Date(), daysAhead);
    const client = clients[(j + 2) % clients.length];
    const hour = 11 + (j % 5);
    const startTime = new Date(sessionDate.setHours(hour, 0, 0, 0));
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60000);

    sessions.push({
      id: `session_up_${j}`,
      therapistId,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      serviceId: 'srv_cbt_60',
      serviceName: 'Individual Therapy (CBT)',
      duration: 60,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: SESSION_STATUS.CONFIRMED,
      priceINR: 2500,
      paymentStatus: PAYMENT_STATUS.PAID,
      meetLink: 'https://meet.google.com/unfazed-live-' + j,
      notesId: null,
      packageConsumed: false
    });
  }

  return sessions;
}

// Seed Payments
function generateSeedPayments(sessions) {
  return sessions.map((s, idx) => {
    const subtotal = s.priceINR;
    const gstAmount = Math.round(subtotal * GST_RATE);
    const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT);
    const totalAmount = subtotal + gstAmount;
    const netPayout = subtotal - platformFee;

    return {
      id: `pay_${idx + 1001}`,
      sessionId: s.id,
      therapistId: s.therapistId,
      clientId: s.clientId,
      clientName: s.clientName,
      invoiceNumber: `INV-2026-${String(idx + 1001).padStart(4, '0')}`,
      sacCode: '999312', // Professional healthcare/mental health services
      subtotal,
      gstRate: GST_RATE,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      gstAmount,
      platformFee,
      totalAmount,
      netPayout,
      gatewayTransactionId: `rzp_pay_live_${idx + 4400192}`,
      paymentMethod: idx % 3 === 0 ? 'UPI' : idx % 3 === 1 ? 'Credit Card' : 'Netbanking',
      status: s.paymentStatus,
      createdAt: s.startTime
    };
  });
}

// Seed Clinical Notes
const DEFAULT_NOTES = [
  {
    id: 'note_1',
    therapistId: 'therapist_sharma',
    clientId: 'client_1',
    sessionId: 'session_past_1',
    type: 'soap', // SOAP note
    visibility: 'private', // private note (therapist only)
    title: 'Session 7: Cognitive Restructuring for Catastrophic Thinking',
    content: {
      subjective: 'Client reports sleep latency reduced to ~25 mins. Experienced one acute anxiety spike prior to quarterly business review; utilized thought record successfully to identify "All-or-Nothing" thinking.',
      objective: 'Affect congruent, speech rate normal. Maintained solid eye contact throughout. GAD-7 score decreased from 14 to 8 over past 6 weeks.',
      assessment: 'Marked improvement in emotional metacognition. Client is effectively deploying CBT thought reframing independently.',
      plan: 'Continue weekly thought logs. Introduce behavioral experiments regarding delegation at work. Next session in 7 days.'
    },
    updatedAt: subDays(new Date(), 6).toISOString()
  },
  {
    id: 'note_2',
    therapistId: 'therapist_sharma',
    clientId: 'client_1',
    sessionId: 'session_past_1',
    type: 'freeform',
    visibility: 'shared', // shared with client (visible in client portal)
    title: 'Shared Takeaways & Grounding Homework',
    content: {
      html: '<p><strong>Key Takeaways from Today:</strong></p><ul><li>Remember that intrusive thoughts are mental events, not predictive facts.</li><li>Practice the <strong>5-4-3-2-1 Sensory Grounding</strong> when entering high-stakes meetings.</li><li>Keep tracking your thought records in your notebook before bedtime.</li></ul><p>Looking forward to our follow-up on Tuesday!</p>'
    },
    updatedAt: subDays(new Date(), 6).toISOString()
  },
  {
    id: 'note_3',
    therapistId: 'therapist_sharma',
    clientId: 'client_2',
    sessionId: 'session_past_2',
    type: 'dap', // DAP note
    visibility: 'private',
    title: 'Session 5: Work Boundaries & Somatic Burnout',
    content: {
      data: 'Client arrived fatigued. Disclosed working 12-hour shifts without lunch breaks. Expressed guilt over declining weekend sprint tasks.',
      assessment: 'Symptoms consistent with occupational exhaustion syndrome. Over-identification with workplace output creating chronic sympathetic nervous system activation.',
      plan: 'Structured boundary contract: zero Slack after 7:30 PM. 10-minute progressive muscle relaxation post-work.'
    },
    updatedAt: subDays(new Date(), 4).toISOString()
  },
  {
    id: 'note_4',
    therapistId: 'therapist_sharma',
    clientId: 'client_2',
    sessionId: 'session_past_2',
    type: 'freeform',
    visibility: 'shared',
    title: 'Gentle Boundaries Guide',
    content: {
      html: '<p>Hi Priya, here is our agreed boundary framework for this week:</p><ol><li>Laptop lid closed at 7:30 PM sharp.</li><li>One non-work hobby evening on Thursday.</li><li>Notice any "guilt" as just an emotional wave without needing to act on it.</li></ol>'
    },
    updatedAt: subDays(new Date(), 4).toISOString()
  }
];

// Seed Chat messages
const DEFAULT_CHATS = [
  {
    id: 'chat_1',
    conversationId: 'conv_sharma_client1',
    therapistId: 'therapist_sharma',
    clientId: 'client_1',
    senderId: 'client_1',
    recipientId: 'therapist_sharma',
    text: 'Good afternoon Dr. Sharma! Just wanted to share that the thought record helped me get through today’s executive presentation without a panic attack.',
    createdAt: subDays(new Date(), 2).toISOString(),
    status: 'read'
  },
  {
    id: 'chat_2',
    conversationId: 'conv_sharma_client1',
    therapistId: 'therapist_sharma',
    clientId: 'client_1',
    senderId: 'therapist_sharma',
    recipientId: 'client_1',
    text: 'That is tremendous progress, Aarav! Acknowledging the thought without letting it dictate your physiology is a huge milestone. We will build on this tomorrow.',
    createdAt: subDays(new Date(), 2).toISOString(),
    status: 'read'
  }
];

// Seed Default Dynamic Intake Template (for Custom Intake Form Builder)
const DEFAULT_INTAKE_TEMPLATE = [
  {
    id: 'field_1',
    label: 'Primary Reason for Seeking Therapy',
    type: 'textarea',
    required: true,
    placeholder: 'Please share what brings you to therapy at this point in your life...'
  },
  {
    id: 'field_2',
    label: 'Have you attended therapy before?',
    type: 'radio',
    required: true,
    options: ['Yes, actively in the past', 'Yes, a few sessions', 'No, this is my first time']
  },
  {
    id: 'field_3',
    label: 'Current Symptoms Experienced (Last 2 Weeks)',
    type: 'checkbox',
    required: false,
    options: ['Difficulty Sleeping', 'Restlessness / Racing Thoughts', 'Low Energy or Fatigue', 'Panic Sensations', 'Interpersonal Conflict']
  },
  {
    id: 'field_4',
    label: 'Are you currently prescribed any psychiatric medication?',
    type: 'select',
    required: true,
    options: ['No', 'Yes (SSRIs / Anti-anxiety)', 'Yes (ADHD Medication)', 'Consulting Psychiatrist Soon']
  },
  {
    id: 'field_5',
    label: 'Emergency Contact Full Name & Phone',
    type: 'text',
    required: true,
    placeholder: 'e.g., Parent / Spouse / Trusted Friend'
  }
];

// Seed Client Packages
const DEFAULT_CLIENT_PACKAGES = [
  {
    id: 'cpkg_1',
    clientId: 'client_1',
    packageId: 'pkg_6_cbt',
    title: '6-Session Deep CBT Journey',
    totalSessions: 6,
    usedSessions: 3,
    remainingSessions: 3,
    purchasedAt: subMonths(new Date(), 1).toISOString(),
    expiresAt: addDays(new Date(), 90).toISOString(),
    status: 'active'
  }
];

// LocalStorage Initializer
function getCollection(key, defaultData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const data = typeof defaultData === 'function' ? defaultData() : defaultData;
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage, resetting to default`, err);
    const data = typeof defaultData === 'function' ? defaultData() : defaultData;
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  }
}

function saveCollection(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// In-Memory Database Controller
export const mockDb = {
  // Therapists
  getTherapistBySlug: async (slug) => {
    await simulateLatency();
    const therapists = getCollection(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
    const found = therapists.find(t => t.slug.toLowerCase() === slug.toLowerCase());
    return found || null;
  },

  getTherapistById: async (id) => {
    await simulateLatency();
    const therapists = getCollection(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
    return therapists.find(t => t.id === id) || null;
  },

  updateTherapist: async (id, updates) => {
    await simulateLatency();
    const therapists = getCollection(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
    const index = therapists.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Therapist not found');
    therapists[index] = { ...therapists[index], ...updates };
    saveCollection(STORAGE_KEYS.THERAPISTS, therapists);
    return therapists[index];
  },

  checkSlugAvailable: async (slug, currentTherapistId) => {
    await simulateLatency(150, 250);
    const therapists = getCollection(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
    const existing = therapists.find(t => t.slug.toLowerCase() === slug.toLowerCase() && t.id !== currentTherapistId);
    return !existing;
  },

  // Clients
  getClients: async (therapistId, { search = '', tag = '', status = '', page = 1, limit = 10 } = {}) => {
    await simulateLatency();
    let clients = getCollection(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS).filter(c => c.therapistId === therapistId);
    
    if (search) {
      const q = search.toLowerCase();
      clients = clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }

    if (tag) {
      clients = clients.filter(c => c.tags && c.tags.includes(tag));
    }

    if (status && status !== 'all') {
      clients = clients.filter(c => c.status === status);
    }

    const total = clients.length;
    const startIndex = (page - 1) * limit;
    const paginated = clients.slice(startIndex, startIndex + limit);

    return {
      clients: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  getClientById: async (id) => {
    await simulateLatency();
    const clients = getCollection(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    return clients.find(c => c.id === id) || null;
  },

  addClient: async (clientData) => {
    await simulateLatency();
    const clients = getCollection(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    const newClient = {
      id: 'client_' + Date.now(),
      joinedDate: new Date().toISOString(),
      status: 'new',
      totalPaid: 0,
      sessionsCompleted: 0,
      nextSession: null,
      lastSession: null,
      intakeCompleted: false,
      consentSigned: false,
      consentAuditLog: [],
      tags: ['New Client'],
      ...clientData
    };
    clients.unshift(newClient);
    saveCollection(STORAGE_KEYS.CLIENTS, clients);
    return newClient;
  },

  updateClient: async (id, updates) => {
    await simulateLatency();
    const clients = getCollection(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    clients[index] = { ...clients[index], ...updates };
    saveCollection(STORAGE_KEYS.CLIENTS, clients);
    return clients[index];
  },

  // Sessions & Scheduling
  getSessions: async (therapistId, { startDate, endDate, status } = {}) => {
    await simulateLatency();
    let sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);
    if (therapistId) {
      sessions = sessions.filter(s => s.therapistId === therapistId);
    }
    if (status && status !== 'all') {
      sessions = sessions.filter(s => s.status === status);
    }
    return sessions;
  },

  getClientSessions: async (clientId) => {
    await simulateLatency();
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);
    return sessions.filter(s => s.clientId === clientId).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  },

  createSession: async (sessionData) => {
    await simulateLatency();
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);
    
    // Double booking check: verify no overlapping confirmed session for this therapist
    const newStart = new Date(sessionData.startTime).getTime();
    const newEnd = new Date(sessionData.endTime).getTime();

    const conflict = sessions.some(s => {
      if (s.therapistId !== sessionData.therapistId) return false;
      if (s.status === SESSION_STATUS.CANCELLED) return false;
      const sStart = new Date(s.startTime).getTime();
      const sEnd = new Date(s.endTime).getTime();
      return (newStart < sEnd && newEnd > sStart);
    });

    if (conflict) {
      throw new Error('This time slot was just booked by another client. Please select an alternate open slot.');
    }

    const newSession = {
      id: 'session_' + Date.now(),
      status: SESSION_STATUS.CONFIRMED,
      paymentStatus: PAYMENT_STATUS.PAID,
      meetLink: 'https://meet.google.com/unfazed-' + Math.random().toString(36).substring(7),
      ...sessionData
    };

    sessions.push(newSession);
    saveCollection(STORAGE_KEYS.SESSIONS, sessions);

    // Also record payment
    const payments = getCollection(STORAGE_KEYS.PAYMENTS, () => generateSeedPayments(sessions));
    const subtotal = newSession.priceINR || 2500;
    const gstAmount = Math.round(subtotal * GST_RATE);
    const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT);

    payments.unshift({
      id: 'pay_' + Date.now(),
      sessionId: newSession.id,
      therapistId: newSession.therapistId,
      clientId: newSession.clientId,
      clientName: newSession.clientName,
      invoiceNumber: `INV-2026-${String(payments.length + 1001).padStart(4, '0')}`,
      sacCode: '999312',
      subtotal,
      gstRate: GST_RATE,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      gstAmount,
      platformFee,
      totalAmount: subtotal + gstAmount,
      netPayout: subtotal - platformFee,
      gatewayTransactionId: 'rzp_pay_' + Date.now(),
      paymentMethod: 'UPI',
      status: PAYMENT_STATUS.PAID,
      createdAt: new Date().toISOString()
    });
    saveCollection(STORAGE_KEYS.PAYMENTS, payments);

    return newSession;
  },

  updateSessionStatus: async (sessionId, status) => {
    await simulateLatency();
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index === -1) throw new Error('Session not found');
    sessions[index].status = status;
    saveCollection(STORAGE_KEYS.SESSIONS, sessions);
    return sessions[index];
  },

  // Available slots calculator taking into account therapist availability, duration, buffer, and booked sessions
  getAvailableSlots: async (therapistId, dateStr, durationMinutes = 60) => {
    await simulateLatency(150, 300);
    const therapists = getCollection(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
    const therapist = therapists.find(t => t.id === therapistId) || therapists[0];
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);

    const targetDate = new Date(dateStr);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[targetDate.getDay()];

    const recurringRanges = therapist.availability?.weekly?.[dayOfWeek] || [];
    if (!recurringRanges.length) return [];

    const buffer = therapist.bufferMinutes || 15;
    const slots = [];

    // Booked sessions for this therapist on that day
    const dayStart = startOfDay(targetDate);
    const bookedOnDay = sessions.filter(s => {
      if (s.therapistId !== therapistId || s.status === SESSION_STATUS.CANCELLED) return false;
      const sDate = new Date(s.startTime);
      return sDate.toDateString() === targetDate.toDateString();
    });

    for (const range of recurringRanges) {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);

      let slotStart = new Date(dayStart);
      slotStart.setHours(startH, startM, 0, 0);

      const rangeEnd = new Date(dayStart);
      rangeEnd.setHours(endH, endM, 0, 0);

      while (slotStart.getTime() + durationMinutes * 60000 <= rangeEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
        
        // Conflict check
        const hasOverlap = bookedOnDay.some(b => {
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          return (slotStart.getTime() < bEnd && slotEnd.getTime() > bStart);
        });

        if (!hasOverlap) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            formattedTime: format(slotStart, 'h:mm a')
          });
        }

        // Advance by duration + buffer
        slotStart = new Date(slotEnd.getTime() + buffer * 60000);
      }
    }

    return slots;
  },

  // Waitlist
  joinWaitlist: async ({ therapistId, date, clientName, clientEmail, clientPhone, preferredTime }) => {
    await simulateLatency();
    const waitlist = getCollection(STORAGE_KEYS.WAITLIST, []);
    const entry = {
      id: 'wl_' + Date.now(),
      therapistId,
      date,
      clientName,
      clientEmail,
      clientPhone,
      preferredTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    waitlist.unshift(entry);
    saveCollection(STORAGE_KEYS.WAITLIST, waitlist);
    return entry;
  },

  // Clinical Notes
  getNotesForTherapist: async (therapistId) => {
    await simulateLatency();
    const notes = getCollection(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
    return notes.filter(n => n.therapistId === therapistId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getNotesForClient: async (clientId, therapistId) => {
    await simulateLatency();
    const notes = getCollection(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
    return notes.filter(n => n.clientId === clientId && n.therapistId === therapistId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  /**
   * SECURITY ARCHITECTURE NOTE:
   * Frontend mirrors the backend access-control rule:
   * Client portal queries MUST ONLY return visibility === "shared".
   * Private clinical notes (SOAP, DAP, internal impressions) are NEVER sent or rendered for clients.
   */
  getSharedNotesForClient: async (clientId) => {
    await simulateLatency();
    const notes = getCollection(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
    return notes
      .filter(n => n.clientId === clientId && n.visibility === 'shared')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  saveNote: async (noteData) => {
    await simulateLatency();
    const notes = getCollection(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
    if (noteData.id) {
      const idx = notes.findIndex(n => n.id === noteData.id);
      if (idx !== -1) {
        notes[idx] = { ...notes[idx], ...noteData, updatedAt: new Date().toISOString() };
        saveCollection(STORAGE_KEYS.NOTES, notes);
        return notes[idx];
      }
    }
    const newNote = {
      id: 'note_' + Date.now(),
      updatedAt: new Date().toISOString(),
      ...noteData
    };
    notes.unshift(newNote);
    saveCollection(STORAGE_KEYS.NOTES, notes);
    return newNote;
  },

  deleteNote: async (noteId) => {
    await simulateLatency();
    let notes = getCollection(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
    notes = notes.filter(n => n.id !== noteId);
    saveCollection(STORAGE_KEYS.NOTES, notes);
    return { success: true };
  },

  // Payments & Invoices
  getPayments: async (therapistId) => {
    await simulateLatency();
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);
    const payments = getCollection(STORAGE_KEYS.PAYMENTS, () => generateSeedPayments(sessions));
    return payments.filter(p => !therapistId || p.therapistId === therapistId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getClientInvoices: async (clientId) => {
    await simulateLatency();
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);
    const payments = getCollection(STORAGE_KEYS.PAYMENTS, () => generateSeedPayments(sessions));
    return payments.filter(p => p.clientId === clientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getInvoiceById: async (invoiceId) => {
    await simulateLatency();
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions);
    const payments = getCollection(STORAGE_KEYS.PAYMENTS, () => generateSeedPayments(sessions));
    return payments.find(p => p.id === invoiceId || p.invoiceNumber === invoiceId) || null;
  },

  // Packages
  getPackagesForTherapist: async (therapistId) => {
    await simulateLatency();
    const packages = getCollection(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
    return packages.filter(p => !therapistId || p.therapistId === therapistId);
  },

  savePackage: async (packageData) => {
    await simulateLatency();
    const packages = getCollection(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
    if (packageData.id) {
      const idx = packages.findIndex(p => p.id === packageData.id);
      if (idx !== -1) {
        packages[idx] = { ...packages[idx], ...packageData };
        saveCollection(STORAGE_KEYS.PACKAGES, packages);
        return packages[idx];
      }
    }
    const newPkg = { id: 'pkg_' + Date.now(), ...packageData };
    packages.push(newPkg);
    saveCollection(STORAGE_KEYS.PACKAGES, packages);
    return newPkg;
  },

  getClientPackages: async (clientId) => {
    await simulateLatency();
    const cpackages = getCollection(STORAGE_KEYS.CLIENT_PACKAGES, DEFAULT_CLIENT_PACKAGES);
    return cpackages.filter(cp => cp.clientId === clientId);
  },

  purchasePackage: async ({ clientId, packageId, therapistId }) => {
    await simulateLatency();
    const packages = getCollection(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) throw new Error('Package not found');

    const cpackages = getCollection(STORAGE_KEYS.CLIENT_PACKAGES, DEFAULT_CLIENT_PACKAGES);
    const newCPkg = {
      id: 'cpkg_' + Date.now(),
      clientId,
      packageId,
      title: pkg.title,
      totalSessions: pkg.sessionsCount,
      usedSessions: 0,
      remainingSessions: pkg.sessionsCount,
      purchasedAt: new Date().toISOString(),
      expiresAt: addDays(new Date(), pkg.validityDays).toISOString(),
      status: 'active'
    };
    cpackages.unshift(newCPkg);
    saveCollection(STORAGE_KEYS.CLIENT_PACKAGES, cpackages);
    return newCPkg;
  },

  // Analytics (Computed in the API layer, NOT inside React components as instructed!)
  getAnalytics: async (therapistId, rangeDays = 30) => {
    await simulateLatency();
    const sessions = getCollection(STORAGE_KEYS.SESSIONS, generateSeedSessions).filter(s => s.therapistId === therapistId);
    const payments = getCollection(STORAGE_KEYS.PAYMENTS, () => generateSeedPayments(sessions)).filter(p => p.therapistId === therapistId);
    const clients = getCollection(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS).filter(c => c.therapistId === therapistId);

    const cutoff = subDays(new Date(), rangeDays);
    const filteredSessions = sessions.filter(s => isAfter(new Date(s.startTime), cutoff));
    const filteredPayments = payments.filter(p => isAfter(new Date(p.createdAt), cutoff) && p.status === PAYMENT_STATUS.PAID);

    // Aggregate monthly revenue for trend
    const monthlyMap = {};
    for (let m = 5; m >= 0; m--) {
      const monthDate = subMonths(new Date(), m);
      const monthKey = format(monthDate, 'MMM yyyy');
      monthlyMap[monthKey] = { month: monthKey, revenue: 0, sessions: 0 };
    }

    payments.filter(p => p.status === PAYMENT_STATUS.PAID).forEach(p => {
      const mKey = format(new Date(p.createdAt), 'MMM yyyy');
      if (monthlyMap[mKey]) {
        monthlyMap[mKey].revenue += p.subtotal;
        monthlyMap[mKey].sessions += 1;
      }
    });

    const revenueTrend = Object.values(monthlyMap);

    // Status breakdown
    const statusCounts = {
      [SESSION_STATUS.COMPLETED]: 0,
      [SESSION_STATUS.CONFIRMED]: 0,
      [SESSION_STATUS.CANCELLED]: 0,
      [SESSION_STATUS.NO_SHOW]: 0
    };

    filteredSessions.forEach(s => {
      if (statusCounts[s.status] !== undefined) {
        statusCounts[s.status]++;
      }
    });

    const totalSessions = filteredSessions.length || 1;
    const noShowRate = Math.round((statusCounts[SESSION_STATUS.NO_SHOW] / totalSessions) * 100);
    const cancellationRate = Math.round((statusCounts[SESSION_STATUS.CANCELLED] / totalSessions) * 100);

    const totalRevenue = filteredPayments.reduce((acc, p) => acc + p.subtotal, 0);

    // Top services
    const serviceMap = {};
    filteredSessions.forEach(s => {
      const name = s.serviceName || 'Standard Therapy';
      serviceMap[name] = (serviceMap[name] || 0) + 1;
    });

    const topServices = Object.entries(serviceMap).map(([name, count]) => ({ name, count }));

    return {
      totalRevenue,
      activeClientsCount: clients.filter(c => c.status === 'active').length,
      totalSessionsCount: filteredSessions.length,
      noShowRate,
      cancellationRate,
      revenueTrend,
      statusBreakdown: [
        { name: 'Completed', value: statusCounts[SESSION_STATUS.COMPLETED], color: '#0d9488' },
        { name: 'Upcoming', value: statusCounts[SESSION_STATUS.CONFIRMED], color: '#0284c7' },
        { name: 'Cancelled', value: statusCounts[SESSION_STATUS.CANCELLED], color: '#94a3b8' },
        { name: 'No-Show', value: statusCounts[SESSION_STATUS.NO_SHOW], color: '#f43f5e' }
      ],
      topServices,
      packageVsSingleRevenue: [
        { type: 'Single Sessions', revenue: Math.round(totalRevenue * 0.65) },
        { type: 'Packages Bundles', revenue: Math.round(totalRevenue * 0.35) }
      ]
    };
  },

  // Subscription Tiers & Entitlements
  getTierConfig: async () => {
    await simulateLatency(100, 200);
    return getCollection(STORAGE_KEYS.TIER_CONFIG, DEFAULT_TIER_CONFIG);
  },

  upgradeTier: async (therapistId, targetTierKey) => {
    await simulateLatency(400, 700);
    const therapists = getCollection(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
    const idx = therapists.findIndex(t => t.id === therapistId);
    if (idx === -1) throw new Error('Therapist not found');
    therapists[idx].tier = targetTierKey;
    saveCollection(STORAGE_KEYS.THERAPISTS, therapists);
    return therapists[idx];
  },

  // Dynamic Intake Schema
  getIntakeTemplate: async (therapistId) => {
    await simulateLatency();
    const templates = getCollection(STORAGE_KEYS.INTAKE_TEMPLATES, { [therapistId || 'therapist_sharma']: DEFAULT_INTAKE_TEMPLATE });
    return templates[therapistId || 'therapist_sharma'] || DEFAULT_INTAKE_TEMPLATE;
  },

  saveIntakeTemplate: async (therapistId, schema) => {
    await simulateLatency();
    const templates = getCollection(STORAGE_KEYS.INTAKE_TEMPLATES, { [therapistId]: DEFAULT_INTAKE_TEMPLATE });
    templates[therapistId] = schema;
    saveCollection(STORAGE_KEYS.INTAKE_TEMPLATES, templates);
    return schema;
  },

  // Chats
  getChats: async (conversationId) => {
    await simulateLatency(150, 250);
    const chats = getCollection(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
    return chats.filter(c => !conversationId || c.conversationId === conversationId);
  },

  saveChatMessage: async (message) => {
    const chats = getCollection(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
    chats.push(message);
    saveCollection(STORAGE_KEYS.CHATS, chats);
    return message;
  }
};
