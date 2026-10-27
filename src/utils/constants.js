export const RESERVED_SLUGS = [
  'dashboard',
  'login',
  'register',
  'portal',
  'schedule',
  'clients',
  'notes',
  'analytics',
  'packages',
  'messages',
  'notifications',
  'settings',
  'billing',
  'plans',
  'api',
  'admin',
  'auth',
  'book',
  'pay',
  'intake'
];

export const SESSION_STATUS = {
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
  PENDING: 'pending'
};

export const PAYMENT_STATUS = {
  CREATED: 'created',
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const NOTE_TYPES = {
  FREEFORM: 'freeform',
  SOAP: 'soap',
  DAP: 'dap'
};

export const FEATURE_KEYS = {
  ACTIVE_CLIENT_CAP: 'active_client_cap',
  NOTE_TEMPLATES: 'note_templates',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_INTAKE_BUILDER: 'custom_intake_builder',
  PACKAGES_BUILDER: 'packages_builder'
};

export const GST_RATE = 0.18; // 18% GST (9% CGST + 9% SGST for intra-state)
export const PLATFORM_FEE_PERCENT = 0.02; // 2% platform fee

export const SPECIALIZATIONS_LIST = [
  'Anxiety & Panic Disorders',
  'Depression & Mood Disorders',
  'Cognitive Behavioral Therapy (CBT)',
  'Trauma & PTSD',
  'Relationship & Couples Counseling',
  'Work Stress & Burnout',
  'Grief & Bereavement',
  'Adolescent & Young Adult Mental Health',
  'Mindfulness-Based Stress Reduction',
  'LGBTQIA+ Affirmative Therapy',
  'ADHD & Neurodivergence Coaching',
  'Family Systems Therapy'
];

export const LANGUAGES_LIST = [
  'English',
  'Hindi',
  'Hinglish',
  'Marathi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Punjabi'
];

export const DEMO_CREDENTIALS = {
  therapist: {
    email: 'sharma@demo.com',
    password: 'Demo@1234',
    name: 'Dr. Neha Sharma',
    slug: 'dr-sharma',
    role: 'therapist'
  },
  client: {
    email: 'client@demo.com',
    password: 'Demo@1234',
    name: 'Aarav Mehta',
    role: 'client'
  }
};
