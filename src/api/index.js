import axiosInstance from './axiosInstance.js';
import { mockDb } from './mockApi.js';
import { DEMO_CREDENTIALS } from '../utils/constants.js';
import { 
  saveAppointmentToSupabase, 
  supabase, 
  getSupabaseClient,
  getSupabaseAppointments,
  getSupabaseConfig,
  setSupabaseConfig,
  resetSupabaseConfig
} from './supabaseClient.js';

const isMock = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_USE_MOCK !== 'false' : true;

// 1. Auth API
export const authApi = {
  login: async ({ email, password }) => {
    if (isMock) {
      // Check demo credentials or match therapist
      if (email === DEMO_CREDENTIALS.therapist.email && password === DEMO_CREDENTIALS.therapist.password) {
        const therapist = await mockDb.getTherapistById('therapist_sharma');
        return {
          token: 'mock_jwt_therapist_sharma_' + Date.now(),
          user: {
            id: therapist.id,
            name: therapist.name,
            email: therapist.email,
            slug: therapist.slug,
            role: 'therapist',
            tier: therapist.tier,
            avatar: therapist.avatar
          }
        };
      } else if (email === DEMO_CREDENTIALS.client.email && password === DEMO_CREDENTIALS.client.password) {
        const client = await mockDb.getClientById('client_1');
        return {
          token: 'mock_jwt_client_aarav_' + Date.now(),
          user: {
            id: client.id,
            name: client.name,
            email: client.email,
            role: 'client',
            therapistId: client.therapistId
          }
        };
      }
      // Or fallback custom login matching demo password
      if (password === 'Demo@1234') {
        return {
          token: 'mock_jwt_custom_' + Date.now(),
          user: {
            id: 'therapist_sharma',
            name: 'Dr. Neha Sharma',
            email,
            slug: 'dr-sharma',
            role: 'therapist',
            tier: 'pro'
          }
        };
      }
      throw new Error('Invalid email or password. Please use Demo credentials.');
    }
    const res = await axiosInstance.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (registerData) => {
    if (isMock) {
      const isAvailable = await mockDb.checkSlugAvailable(registerData.slug, null);
      if (!isAvailable) {
        throw new Error('This branded link slug is already taken. Please pick another one.');
      }
      const newTherapist = {
        id: 'therapist_' + Date.now(),
        name: registerData.name,
        email: registerData.email,
        slug: registerData.slug,
        title: 'Licensed Psychologist',
        tier: 'free',
        languages: registerData.languages || ['English'],
        specializations: registerData.specializations || [],
        bio: 'Welcome to my practice.',
        services: [
          { id: 'srv_1', name: 'Individual Therapy Session', duration: 60, priceINR: 2000, active: true }
        ],
        availability: {
          weekly: {
            monday: [{ start: '10:00', end: '17:00' }],
            tuesday: [{ start: '10:00', end: '17:00' }],
            wednesday: [{ start: '10:00', end: '17:00' }],
            thursday: [{ start: '10:00', end: '17:00' }],
            friday: [{ start: '10:00', end: '17:00' }],
            saturday: [], sunday: []
          }
        }
      };
      await mockDb.updateTherapist(newTherapist.id, newTherapist).catch(async () => {
        // save new therapist
      });
      return {
        token: 'mock_jwt_' + newTherapist.id,
        user: { ...newTherapist, role: 'therapist' }
      };
    }
    const res = await axiosInstance.post('/auth/register', registerData);
    return res.data;
  },

  checkSlug: async (slug, currentId) => {
    if (isMock) {
      return mockDb.checkSlugAvailable(slug, currentId);
    }
    const res = await axiosInstance.get(`/auth/check-slug?slug=${slug}`);
    return res.data.available;
  }
};

// 2. Therapist API
export const therapistApi = {
  getBySlug: async (slug) => {
    if (isMock) {
      return mockDb.getTherapistBySlug(slug);
    }
    const res = await axiosInstance.get(`/therapists/${slug}`);
    return res.data;
  },

  getProfile: async (id) => {
    if (isMock) {
      return mockDb.getTherapistById(id);
    }
    const res = await axiosInstance.get(`/therapists/profile/${id}`);
    return res.data;
  },

  updateProfile: async (id, data) => {
    if (isMock) {
      return mockDb.updateTherapist(id, data);
    }
    const res = await axiosInstance.put(`/therapists/${id}`, data);
    return res.data;
  }
};

// 3. Client API
export const clientApi = {
  getClients: async (therapistId, params) => {
    if (isMock) {
      return mockDb.getClients(therapistId, params);
    }
    const res = await axiosInstance.get('/clients', { params: { therapistId, ...params } });
    return res.data;
  },

  getClientById: async (id) => {
    if (isMock) {
      return mockDb.getClientById(id);
    }
    const res = await axiosInstance.get(`/clients/${id}`);
    return res.data;
  },

  addClient: async (data) => {
    if (isMock) {
      return mockDb.addClient(data);
    }
    const res = await axiosInstance.post('/clients', data);
    return res.data;
  },

  updateClient: async (id, data) => {
    if (isMock) {
      return mockDb.updateClient(id, data);
    }
    const res = await axiosInstance.put(`/clients/${id}`, data);
    return res.data;
  },

  submitIntakeAndConsent: async (clientId, intakeData, consentData) => {
    if (isMock) {
      const client = await mockDb.getClientById(clientId);
      const auditEntry = {
        action: 'Digital Consent & Intake Captured',
        timestamp: new Date().toISOString(),
        ip: '103.45.22.89',
        signature: consentData.signature
      };
      return mockDb.updateClient(clientId, {
        intakeCompleted: true,
        intakeAnswers: intakeData,
        consentSigned: true,
        consentSignedAt: new Date().toISOString(),
        consentAuditLog: [...(client.consentAuditLog || []), auditEntry]
      });
    }
    const res = await axiosInstance.post(`/clients/${clientId}/intake`, { intakeData, consentData });
    return res.data;
  },

  getIntakeTemplate: async (therapistId) => {
    if (isMock) {
      return mockDb.getIntakeTemplate(therapistId);
    }
    const res = await axiosInstance.get(`/therapists/${therapistId}/intake-template`);
    return res.data;
  },

  saveIntakeTemplate: async (therapistId, schema) => {
    if (isMock) {
      return mockDb.saveIntakeTemplate(therapistId, schema);
    }
    const res = await axiosInstance.put(`/therapists/${therapistId}/intake-template`, { schema });
    return res.data;
  }
};

// 4. Scheduling API
export const schedulingApi = {
  getSessions: async (therapistId, filters) => {
    let sessions = [];
    if (isMock) {
      sessions = await mockDb.getSessions(therapistId, filters);
    } else {
      const res = await axiosInstance.get('/sessions', { params: { therapistId, ...filters } });
      sessions = res.data;
    }

    // Also pull live records directly from Supabase appointments & bookings
    try {
      const sbAppointments = await getSupabaseAppointments(50);
      if (Array.isArray(sbAppointments) && sbAppointments.length > 0) {
        const existingIds = new Set(sessions.map(s => s.id));
        const sbSessions = sbAppointments
          .filter(app => !existingIds.has(app.id))
          .map(app => ({
            id: app.id,
            therapistId: app.therapist_id || therapistId,
            clientId: 'client_live',
            clientName: app.client_name,
            clientEmail: app.client_email,
            clientPhone: app.client_phone,
            serviceId: app.service_id || 'srv_cbt_60',
            serviceName: app.service_name,
            duration: app.duration_minutes || 60,
            startTime: app.start_time,
            endTime: app.end_time,
            priceINR: Number(app.price_inr) || 0,
            paymentStatus: app.payment_status || 'paid',
            status: app.status || 'confirmed',
            meetLink: app.meet_link,
            notes: app.notes,
            source: 'supabase'
          }));
        return [...sbSessions, ...sessions];
      }
    } catch (sbFetchErr) {
      console.warn('[Supabase] Non-fatal error merging live appointments:', sbFetchErr);
    }

    return sessions;
  },

  getClientSessions: async (clientId) => {
    if (isMock) {
      return mockDb.getClientSessions(clientId);
    }
    const res = await axiosInstance.get(`/clients/${clientId}/sessions`);
    return res.data;
  },

  getAvailableSlots: async (therapistId, dateStr, duration) => {
    if (isMock) {
      return mockDb.getAvailableSlots(therapistId, dateStr, duration);
    }
    const res = await axiosInstance.get('/availability/slots', { params: { therapistId, date: dateStr, duration } });
    return res.data;
  },

  bookSession: async (sessionData) => {
    // 1. Mandatory save to Supabase backend (appointments and bookings tables)
    const supabaseResult = await saveAppointmentToSupabase({
      ...sessionData,
      status: 'confirmed'
    });

    if (!supabaseResult.success) {
      console.error('[Supabase Database] Mandatory appointment insert failed:', supabaseResult.error);
      throw new Error(`Supabase Database Error: ${supabaseResult.error || 'Failed to save appointment to Supabase table'}`);
    }

    // 2. Also register in practice session store
    let session;
    if (isMock) {
      session = await mockDb.createSession(sessionData);
    } else {
      const res = await axiosInstance.post('/sessions/book', sessionData);
      session = res.data;
    }

    session.supabaseSync = supabaseResult;
    return session;
  },

  updateSessionStatus: async (sessionId, status) => {
    if (isMock) {
      return mockDb.updateSessionStatus(sessionId, status);
    }
    const res = await axiosInstance.patch(`/sessions/${sessionId}/status`, { status });
    return res.data;
  },

  joinWaitlist: async (payload) => {
    if (isMock) {
      return mockDb.joinWaitlist(payload);
    }
    const res = await axiosInstance.post('/availability/waitlist', payload);
    return res.data;
  }
};

// 5. Payments API
export const paymentApi = {
  getPayments: async (therapistId) => {
    if (isMock) {
      return mockDb.getPayments(therapistId);
    }
    const res = await axiosInstance.get('/payments', { params: { therapistId } });
    return res.data;
  },

  getClientInvoices: async (clientId) => {
    if (isMock) {
      return mockDb.getClientInvoices(clientId);
    }
    const res = await axiosInstance.get(`/clients/${clientId}/invoices`);
    return res.data;
  },

  getInvoiceById: async (invoiceId) => {
    if (isMock) {
      return mockDb.getInvoiceById(invoiceId);
    }
    const res = await axiosInstance.get(`/payments/invoice/${invoiceId}`);
    return res.data;
  },

  getPackages: async (therapistId) => {
    if (isMock) {
      return mockDb.getPackagesForTherapist(therapistId);
    }
    const res = await axiosInstance.get(`/packages`, { params: { therapistId } });
    return res.data;
  },

  savePackage: async (data) => {
    if (isMock) {
      return mockDb.savePackage(data);
    }
    const res = await axiosInstance.post('/packages', data);
    return res.data;
  },

  getClientPackages: async (clientId) => {
    if (isMock) {
      return mockDb.getClientPackages(clientId);
    }
    const res = await axiosInstance.get(`/clients/${clientId}/packages`);
    return res.data;
  },

  purchasePackage: async (payload) => {
    if (isMock) {
      return mockDb.purchasePackage(payload);
    }
    const res = await axiosInstance.post('/packages/purchase', payload);
    return res.data;
  }
};

// 6. Clinical Notes API
export const noteApi = {
  getNotesForTherapist: async (therapistId) => {
    if (isMock) {
      return mockDb.getNotesForTherapist(therapistId);
    }
    const res = await axiosInstance.get('/notes', { params: { therapistId } });
    return res.data;
  },

  getNotesForClient: async (clientId, therapistId) => {
    if (isMock) {
      return mockDb.getNotesForClient(clientId, therapistId);
    }
    const res = await axiosInstance.get(`/notes/client/${clientId}`, { params: { therapistId } });
    return res.data;
  },

  /**
   * CRITICAL SECURITY BOUNDARY:
   * Mirrors backend access rules. Client portal ONLY ever calls this endpoint,
   * which filters out all private SOAP/DAP notes and returns strictly shared takeaways.
   */
  getSharedNotesForClient: async (clientId) => {
    if (isMock) {
      return mockDb.getSharedNotesForClient(clientId);
    }
    const res = await axiosInstance.get(`/notes/shared/${clientId}`);
    return res.data;
  },

  saveNote: async (data) => {
    if (isMock) {
      return mockDb.saveNote(data);
    }
    const res = await axiosInstance.post('/notes', data);
    return res.data;
  },

  deleteNote: async (id) => {
    if (isMock) {
      return mockDb.deleteNote(id);
    }
    const res = await axiosInstance.delete(`/notes/${id}`);
    return res.data;
  }
};

// 7. Analytics API
export const analyticsApi = {
  getAnalytics: async (therapistId, rangeDays = 30) => {
    if (isMock) {
      return mockDb.getAnalytics(therapistId, rangeDays);
    }
    const res = await axiosInstance.get('/analytics', { params: { therapistId, rangeDays } });
    return res.data;
  }
};

// 8. Entitlement API
export const entitlementApi = {
  getTierConfig: async () => {
    if (isMock) {
      return mockDb.getTierConfig();
    }
    const res = await axiosInstance.get('/entitlements/tiers');
    return res.data;
  },

  upgradeTier: async (therapistId, targetTierKey) => {
    if (isMock) {
      return mockDb.upgradeTier(therapistId, targetTierKey);
    }
    const res = await axiosInstance.post('/entitlements/upgrade', { therapistId, tier: targetTierKey });
    return res.data;
  }
};

// 9. Chat API
export const chatApi = {
  getMessages: async (conversationId) => {
    if (isMock) {
      return mockDb.getChats(conversationId);
    }
    const res = await axiosInstance.get(`/chats/${conversationId}`);
    return res.data;
  },

  sendMessage: async (msg) => {
    if (isMock) {
      return mockDb.saveChatMessage(msg);
    }
    const res = await axiosInstance.post('/chats/message', msg);
    return res.data;
  }
};

// 10. Supabase Backend API
export const supabaseApi = {
  get client() {
    return getSupabaseClient();
  },
  saveAppointment: saveAppointmentToSupabase,
  getAppointments: getSupabaseAppointments,
  getConfig: getSupabaseConfig,
  setConfig: setSupabaseConfig,
  resetConfig: resetSupabaseConfig
};
